/**
 * 装备管理Store
 * 管理所有装备分类和项目数据
 */
import { defineStore } from 'pinia';
import { ref, computed, watch, WatchStopHandle } from 'vue';
import { useStorage, useRefHistory } from '@vueuse/core';
import { useOperationLogStore } from './operationLog';
import { defaultCategories, localStorageKeys } from '../config/appConfig';
import { toast } from '../utils/toast';
import { v4 as uuidv4 } from 'uuid';

export interface Category {
  id: string;
  name: string;
  icon: string;
  items: Item[];
  collapsed: boolean;
}

interface Item {
  id: number | string;
  index: number;
  name: string;
  completed: boolean;
  quantity: number;
  quantityUnit: string;
  weight: number;
  weightUnit: string;
  price: number;
  priceUnit: string;
  isRecommended: boolean;
  notes: string;
  priority: string;
}

interface BeforeState {
  action: string;
  categories: Category[];
}

function reindexCategoryItems(category: Category): void {
  category.items.forEach((item, index) => {
    item.index = index + 1;
  });
  console.log(`🔢 Re-indexing category "${category.name}" with ${category.items.length} items`);
}

function fixDuplicateItemIds(category: Category): number {
  const idSet = new Set<string | number>();
  let fixedCount = 0;
  category.items.forEach((item) => {
    if (idSet.has(item.id)) {
      const oldId = item.id;
      item.id = uuidv4();
      console.warn(`⚠️ Fixed duplicate ID: ${oldId} → ${item.id} (Item: ${item.name})`);
      fixedCount++;
    }
    idSet.add(item.id);
  });
  if (fixedCount > 0) {
    console.log(`✅ Fixed ${fixedCount} duplicate item IDs in category "${category.name}"`);
  }
  return fixedCount;
}

function migrateAndValidateData(data: Category[]): Category[] {
  let needsReindex = false;
  const validatedData = data.map(cat => {
    const items = cat.items.map((item, index) => {
      const updatedItem: Item = { ...item };
      if (typeof item.index !== 'number') {
        needsReindex = true;
        updatedItem.index = index + 1;
      }
      if (updatedItem.price === undefined) updatedItem.price = 0;
      if (!updatedItem.priceUnit) updatedItem.priceUnit = '人民币';
      if (typeof item.id !== 'string') updatedItem.id = uuidv4();
      return updatedItem;
    });
    return { ...cat, icon: cat.icon || '✨', items };
  });

  if (needsReindex) {
    console.log('🔢 Re-indexing items...');
    validatedData.forEach(reindexCategoryItems);
  }

  let totalFixed = 0;
  validatedData.forEach(cat => {
    totalFixed += fixDuplicateItemIds(cat);
  });
  if (totalFixed > 0) {
    console.warn(`⚠️ Fixed ${totalFixed} duplicate item IDs.`);
  }

  console.log('✅ Data loaded from storage and validated.');
  return validatedData;
}

function initializeDefaultCategories(): Category[] {
  console.log('📦 Initializing default categories...');
  const defaultData = defaultCategories.map((cat) => ({
    id: uuidv4(),
    name: cat.name,
    icon: cat.icon,
    items: [],
    collapsed: false,
  }));

  // Can't log here as the store is not yet available
  // Consider logging after initialization if needed
  
  return defaultData;
}

export const useEquipmentStore = defineStore('equipment', () => {
  const categories = useStorage<Category[]>(localStorageKeys.equipmentChecklist, [], localStorage, {
    mergeDefaults: (storageValue) => {
      if (storageValue && storageValue.length > 0) {
        return migrateAndValidateData(storageValue);
      }
      return initializeDefaultCategories();
    },
  });

  const { history, undo, redo, canUndo, canRedo } = useRefHistory(categories, {
    deep: true,
    capacity: 20,
  });

  const groupByStatus = ref<boolean>(true);
  const hasLoaded = ref<boolean>(false);

  let stopWatch: WatchStopHandle | undefined;

  stopWatch = watch(
    categories,
    (value) => {
      if (value) {
        hasLoaded.value = true;
        if (stopWatch) {
            stopWatch();
        }
      }
    },
    { immediate: true, deep: true }
  );
  
  const totalCategories = computed<number>(() => categories.value.length);

  const totalItems = computed<number>(() =>
    categories.value.reduce((sum, cat) => sum + cat.items.length, 0)
  );

  const completedItems = computed<number>(() =>
    categories.value.reduce(
      (sum, cat) => sum + cat.items.filter((item) => item.completed).length,
      0
    )
  );

  const remainingItems = computed<number>(() => totalItems.value - completedItems.value);

  const totalWeight = computed<string>(() => {
    const weightInGrams = categories.value.reduce(
      (sum, cat) =>
        sum +
        cat.items.reduce((itemSum, item) => {
          let weightInGrams: number = item.weight;
          // 单位转换
          switch (item.weightUnit) {
            case 'kg': weightInGrams = item.weight * 1000; break;
            case '斤': weightInGrams = item.weight * 500; break;
            case '磅': weightInGrams = item.weight * 453.592; break;
            default: weightInGrams = item.weight; // g
          }
          return itemSum + weightInGrams * item.quantity;
        }, 0),
      0
    );
    return (weightInGrams / 1000).toFixed(2) + 'kg';
  });

  const totalPrice = computed<string>(() => {
    const priceInYuan = categories.value.reduce(
      (sum, cat) =>
        sum +
        cat.items.reduce((itemSum, item) => {
          let priceInYuan: number = item.price || 0;
          // 单位转换到人民币
          switch (item.priceUnit) {
            case '美元': priceInYuan = (item.price || 0) * 7; break; // 简单汇率转换
            case '英镑': priceInYuan = (item.price || 0) * 9; break;
            case '日元': priceInYuan = (item.price || 0) * 0.05; break;
            default: priceInYuan = item.price || 0; // 人民币
          }
          return itemSum + priceInYuan * item.quantity;
        }, 0),
      0
    );
    return priceInYuan.toFixed(2) + '人民币';
  });

  /**
   * 添加分类
   * @param {string} name
   * @param {string} icon
   * @returns {boolean}
   */
  function addCategory(name: string, icon: string = '✨'): boolean {
    if (!name || name.trim() === '') {
      toast.warning('请输入分类名称');
      return false;
    }

    const newCategory: Category = {
      id: uuidv4(),
      name: name.trim(),
      icon: icon,
      items: [],
      collapsed: false,
    };

    const logStore = useOperationLogStore();
    logStore.log('add', `添加了分类：${name}`, { category: name });

    categories.value.push(newCategory);
    
    return true;
  }
  
  function editCategoryIcon(categoryId: string, newIcon: string): boolean {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) return false;

    if (newIcon.trim() === category.icon) {
      return false;
    }

    const oldIcon = category.icon;
    const categoryName = category.name;
    
    undo();
    
    const categoryToUpdate = categories.value.find((cat) => cat.id === categoryId);
    if(categoryToUpdate) {
        categoryToUpdate.icon = newIcon.trim();
    }

    const logStore = useOperationLogStore();
    logStore.log(
      'edit',
      `修改了分类图标：${categoryName}`,
      {
        category: categoryName,
        oldIcon: oldIcon,
        newIcon: newIcon,
      }
    );
    return true;
  }
  
  async function deleteCategory(categoryId: string): Promise<boolean> {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) return false;

    const categoryName = category.name;
    const itemCount = category.items.length;

    const logStore = useOperationLogStore();
    logStore.log(
      'delete',
      `删除了分类：${categoryName}`,
      {
        category: categoryName,
        itemCount: itemCount,
      }
    );
    
    categories.value = categories.value.filter((cat) => cat.id !== categoryId);

    toast.success(`分类"${categoryName}"已删除`);
    return true;
  }
  
  function editCategoryName(categoryId: string, newName: string): boolean {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) return false;

    if (!newName || newName.trim() === '') {
      toast.warning('分类名称不能为空');
      return false;
    }

    const oldName = category.name;
    
    undo();
    
    const categoryToUpdate = categories.value.find((cat) => cat.id === categoryId);
    if(categoryToUpdate) {
        categoryToUpdate.name = newName.trim();
    }

    const logStore = useOperationLogStore();
    logStore.log(
      'edit',
      `修改了分类名称：${oldName} → ${newName}`,
      {
        oldName: oldName,
        newName: newName,
      }
    );

    toast.success(`分类名称已更新为"${newName}"`);
    return true;
  }
  
  function toggleCategoryCollapse(categoryId: string): void {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) return;

    category.collapsed = !category.collapsed;
  }
  
  function reindexCategory(categoryId: string): void {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) return;

    reindexCategoryItems(category);
  }
  
  function fixDuplicateIds(categoryId: string): number {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) return 0;

    return fixDuplicateItemIds(category);
  }
  
  function updateCategoriesOrder(newOrder: Category[]): void {
    const logStore = useOperationLogStore();
    logStore.log(
      'sort',
      '重新排序了分类',
      {
        categories: newOrder.map((cat) => cat.name).join('、'),
      }
    );
    
    categories.value = newOrder;
  }
  
  function addItem(
    categoryId: string,
    itemData: Partial<Item> & { description?: string }
  ): boolean {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) return false;

    if (!itemData.name || itemData.name.trim() === '') {
      toast.warning('请输入装备名称');
      return false;
    }

    const maxIndex = category.items.reduce(
      (max, item) => Math.max(max, item.index || 0),
      0
    );

    const newItem: Item = {
      id: uuidv4(),
      index: maxIndex + 1,
      name: itemData.name.trim(),
      completed: itemData.completed || false,
      quantity: itemData.quantity || 1,
      quantityUnit: itemData.quantityUnit || '个',
      weight: itemData.weight || 0,
      weightUnit: itemData.weightUnit || 'g',
      price: itemData.price || 0,
      priceUnit: itemData.priceUnit || '人民币',
      isRecommended: itemData.isRecommended || false, // 新增字段，标记为推荐装备
      notes: itemData.description || itemData.notes || '', // 支持 description 或 notes
      priority: itemData.priority || 'medium', // 支持优先级
    };

    const logStore = useOperationLogStore();
    logStore.log(
      'add',
      `添加了装备 #${newItem.index}：${newItem.name}`,
      {
        category: category.name,
        item: newItem.name,
        index: newItem.index,
        quantity: `${newItem.quantity}${newItem.quantityUnit}`,
        weight: `${newItem.weight}${newItem.weightUnit}`,
        price: `${newItem.price}${newItem.priceUnit}`,
      }
    );
    
    category.items.push(newItem);

    toast.success(`装备"${newItem.name}"添加成功`);
    return true;
  }
  
  async function deleteItem(
    categoryId: string,
    itemId: string | number
  ): Promise<boolean> {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) return false;

    const item = category.items.find((i) => i.id === itemId);
    if (!item) return false;

    const logStore = useOperationLogStore();
    logStore.log(
      'delete',
      `删除了装备 #${item.index}：${item.name}`,
      {
        category: category.name,
        item: item.name,
        index: item.index,
      }
    );
    
    category.items = category.items.filter((item) => item.id !== itemId);

    reindexCategory(categoryId);

    toast.success(`装备"${item.name}"已删除`);
    return true;
  }
  
  async function removeItem(
    categoryId: string,
    itemId: string | number
  ): Promise<boolean> {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) return false;

    const item = category.items.find((i) => i.id === itemId);
    if (!item) return false;

    const logStore = useOperationLogStore();
    logStore.log(
      'delete',
      `删除了装备 #${item.index}：${item.name}`,
      {
        category: category.name,
        item: item.name,
        index: item.index,
      }
    );
    
    category.items = category.items.filter((item) => item.id !== itemId);

    reindexCategory(categoryId);

    toast.success(`装备"${item.name}"已删除`);
    return true;
  }
  
  function editItem(
    categoryId: string,
    itemId: string | number,
    itemData: Partial<Item>
  ): boolean {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) return false;

    const item = category.items.find((i) => i.id === itemId);
    if (!item) return false;

    if (!itemData.name || itemData.name.trim() === '') {
      toast.warning('请输入装备名称');
      return false;
    }

    const oldName = item.name;
    const oldQuantity = `${item.quantity}${item.quantityUnit}`;
    const oldWeight = `${item.weight}${item.weightUnit}`;
    const oldPrice = `${item.price || 0}${item.priceUnit || '人民币'}`;

    undo();
    
    const itemToUpdate = category.items.find((i) => i.id === itemId);
    
    if(itemToUpdate) {
        itemToUpdate.name = itemData.name.trim();
        itemToUpdate.quantity = itemData.quantity || 1;
        itemToUpdate.quantityUnit = itemData.quantityUnit || '个';
        itemToUpdate.weight = itemData.weight || 0;
        itemToUpdate.weightUnit = itemData.weightUnit || 'g';
        itemToUpdate.price = itemData.price || 0;
        itemToUpdate.priceUnit = itemData.priceUnit || '人民币';
    }


    const logStore = useOperationLogStore();
    logStore.log(
      'edit',
      `修改了装备：${oldName} → ${item.name}`,
      {
        category: category.name,
        oldName: oldName,
        newName: item.name,
        quantity: `${oldQuantity} → ${item.quantity}${item.quantityUnit}`,
        weight: `${oldWeight} → ${item.weight}${item.weightUnit}`,
        price: `${oldPrice} → ${item.price}${item.priceUnit}`,
      }
    );

    toast.success(`装备"${item.name}"已更新`);
    return true;
  }
  
  function updateEquipment(
    categoryId: string,
    itemId: string | number,
    itemData: Partial<Item>
  ): void {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) return;
    const itemIndex = category.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;
    category.items[itemIndex] = { ...category.items[itemIndex], ...itemData };
  }
  
  function toggleEquipmentStatus(
    categoryId: string,
    itemId: string | number
  ): boolean {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) {
      console.error('❌ 未找到分类:', categoryId);
      return false;
    }

    const item = category.items.find((i) => i.id === itemId);
    if (!item) {
      console.error('❌ 未找到装备:', itemId, '在分类:', category.name);
      return false;
    }

    const logStore = useOperationLogStore();
    logStore.log(
      'toggle',
      `${item.completed ? '标记为已准备' : '标记为待准备'}：${item.name}`,
      {
        category: category.name,
        item: item.name,
        status: item.completed ? '已准备' : '待准备',
      }
    );
    
    item.completed = !item.completed;

    return true;
  }
  
  async function importData(data: Category[]): Promise<boolean> {
    if (!Array.isArray(data)) {
      toast.error('导入的数据格式不正确');
      return false;
    }

    const oldCount = categories.value.length;

    categories.value = data.map((cat) => {
      const categoryData: Category = {
        ...cat,
        icon: cat.icon || '✨',
        items: cat.items.map((item, index) => ({
          ...item,
          id: item.id && typeof item.id === 'string' ? item.id : uuidv4(),
          index: item.index || index + 1,
          price: item.price !== undefined ? item.price : 0,
          priceUnit: item.priceUnit || '人民币',
        })),
      };
      return categoryData;
    });

    categories.value.forEach((cat) => {
      reindexCategory(cat.id);
    });

    let totalFixed = 0;
    categories.value.forEach((cat) => {
      totalFixed += fixDuplicateIds(cat.id);
    });

    if (totalFixed > 0) {
      console.warn(`⚠️ 导入数据时修复了 ${totalFixed} 个重复的装备ID`);
    }

    const logStore = useOperationLogStore();
    logStore.log('import', '导入了装备清单数据', {
      oldCategories: oldCount,
      newCategories: categories.value.length,
      totalItems: totalItems.value,
    });

    console.log('✅ 数据导入完成，已为所有装备分配序号');
    return true;
  }
  
  function clearAllData(): boolean {
    const oldCategories = categories.value.length;
    const oldItems = totalItems.value;

    categories.value = [];

    const logStore = useOperationLogStore();
    logStore.log('clear', '清空了所有装备数据', {
      deletedCategories: oldCategories,
      deletedItems: oldItems,
    });

    return true;
  }
  
  function toggleGroupByStatus(): void {
    groupByStatus.value = !groupByStatus.value;
  }
  
  function quickUndo(): boolean {
    if (canUndo.value) {
      undo();
      toast.success('操作已撤销');
      return true;
    }
    toast.info('没有可以撤销的操作');
    return false;
  }
  
  function getLatestUndoableLog(): object | undefined {
    const logStore = useOperationLogStore();
    return logStore.getLatestUndoableLog();
  }
  
  function getOrCreateCategory(categoryName: string, icon: string = '✨'): string {
    let category = categories.value.find((cat) => cat.name === categoryName);
    if (!category) {
      const newCategory: Category = {
        id: uuidv4(),
        name: categoryName,
        icon: icon,
        items: [],
        collapsed: false,
      };
      categories.value.push(newCategory);
      const logStore = useOperationLogStore();
      logStore.log('add', `自动创建了分类：${categoryName}`, {
        category: categoryName,
      });
      return newCategory.id;
    }
    return category.id;
  }

  return {
    categories,
    groupByStatus,
    hasLoaded,
    totalCategories,
    totalItems,
    completedItems,
    remainingItems,
    totalWeight,
    totalPrice,
    initializeCategories: initializeDefaultCategories,
    addCategory,
    deleteCategory,
    editCategoryName,
    editCategoryIcon,
    toggleCategoryCollapse,
    reindexCategory,
    fixDuplicateIds,
    updateCategoriesOrder,
    addItem,
    deleteItem,
    editItem,
    updateEquipment,
    toggleEquipmentStatus,
    toggleItem: toggleEquipmentStatus,
    toggleGroupByStatus,
    importData,
    clearAllData,
    undo,
    redo,
    canUndo,
    canRedo,
    quickUndo, // 快速撤销最近操作
    getLatestUndoableLog, // 暴露获取最新可撤销日志方法
    getOrCreateCategory, // 暴露获取或创建分类方法
    removeItem,
  };
});

