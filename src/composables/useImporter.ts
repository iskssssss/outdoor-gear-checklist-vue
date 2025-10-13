import { useEquipmentStore } from '../stores/equipment';
import { useOperationLogStore } from '../stores/operationLog';
import { toast as ToastServiceInstance } from '../utils/toast';
import { Ref } from 'vue';
import { Category } from '../stores/equipment';

interface AnalyzedItem {
  category: string;
  categoryIcon?: string;
  name: string;
  quantity: number;
  price: number | null;
  quantityUnit?: string;
  weight?: number;
  weightUnit?: string;
}

export function useImporter(equipmentStore: ReturnType<typeof useEquipmentStore>, logStore: ReturnType<typeof useOperationLogStore>, toast: typeof ToastServiceInstance) {
  async function importAnalyzedItems(items: AnalyzedItem[], isCancelled: Ref<boolean>, isImporting: Ref<boolean>): Promise<void> {
    isImporting.value = true;
    try {
      for (const item of items) {
        if (isCancelled.value) {
          toast.warning('导入操作已取消');
          throw new Error('导入已取消');
        }

        let category: Category | undefined = equipmentStore.categories.find(c => c.name === item.category);
        if (!category) {
          equipmentStore.addCategory(item.category, item.categoryIcon || '🛍️');
          category = equipmentStore.categories.find(c => c.name === item.category);
        }

        if (category) {
          equipmentStore.addItem(category.id, {
            name: item.name,
            quantity: item.quantity,
            price: item.price ?? 0, // 确保价格是数字
            quantityUnit: item.quantityUnit || '件',
            weight: item.weight || 0,
            weightUnit: item.weightUnit || 'g',
          });
        }
      }

      logStore.log('import-cart', `导入了 ${items.length} 件商品`, {
        items: items.map(i => i.name).join(', '),
      });

    } finally {
      isImporting.value = false;
    }
  }

  return { importAnalyzedItems };
}
