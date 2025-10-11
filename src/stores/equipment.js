/**
 * 装备管理Store
 * 管理所有装备分类和项目数据
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useOperationLogStore } from './operationLog'
import { defaultCategories, localStorageKeys } from '../config/appConfig'

export const useEquipmentStore = defineStore('equipment', () => {
  // 状态
  const categories = ref([])

  // Getters - 统计信息
  const totalCategories = computed(() => categories.value.length)
  
  const totalItems = computed(() => 
    categories.value.reduce((sum, cat) => sum + cat.items.length, 0)
  )
  
  const completedItems = computed(() => 
    categories.value.reduce((sum, cat) => 
      sum + cat.items.filter(item => item.completed).length, 0
    )
  )
  
  const remainingItems = computed(() => totalItems.value - completedItems.value)
  
  const totalWeight = computed(() => {
    const weightInGrams = categories.value.reduce((sum, cat) => 
      sum + cat.items.reduce((itemSum, item) => {
        let weightInGrams = item.weight
        // 单位转换
        switch(item.weightUnit) {
          case 'kg': weightInGrams = item.weight * 1000; break
          case '斤': weightInGrams = item.weight * 500; break
          case '磅': weightInGrams = item.weight * 453.592; break
          default: weightInGrams = item.weight // g
        }
        return itemSum + (weightInGrams * item.quantity)
      }, 0), 0
    )
    return (weightInGrams / 1000).toFixed(2) + 'kg'
  })

  const totalPrice = computed(() => {
    const priceInYuan = categories.value.reduce((sum, cat) => 
      sum + cat.items.reduce((itemSum, item) => {
        let priceInYuan = item.price || 0
        // 单位转换到人民币
        switch(item.priceUnit) {
          case '美元': priceInYuan = (item.price || 0) * 7; break // 简单汇率转换
          case '英镑': priceInYuan = (item.price || 0) * 9; break
          case '日元': priceInYuan = (item.price || 0) * 0.05; break
          default: priceInYuan = item.price || 0 // 人民币
        }
        return itemSum + (priceInYuan * item.quantity)
      }, 0), 0
    )
    return priceInYuan.toFixed(2) + '人民币'
  })

  // Actions
  /**
   * 从localStorage加载数据
   */
  function loadData() {
    const data = localStorage.getItem(localStorageKeys.equipmentChecklist)
    if (data) {
      try {
        categories.value = JSON.parse(data)
        
        let needsReindex = false
        
        // 确保导入时 icon 属性存在，并检查序号，补充默认价格单位
        categories.value = categories.value.map(cat => {
          const items = cat.items.map((item, index) => {
            const updatedItem = { ...item }
            if (!item.index) {
              needsReindex = true
              updatedItem.index = index + 1
            }
            // 确保价格字段存在默认值
            if (updatedItem.price === undefined) {
              updatedItem.price = 0
            }
            if (!updatedItem.priceUnit) {
              updatedItem.priceUnit = '人民币'
            }
            return updatedItem
          })
          
          return {
            ...cat,
            icon: cat.icon || '✨',
            items
          }
        })
        
        // 如果有装备没有序号，重新编码并保存
        if (needsReindex) {
          console.log('🔢 检测到装备缺少序号，正在重新编码...')
          categories.value.forEach(cat => {
            reindexCategory(cat.id)
          })
          saveData()
        }
        
        // 检查并修复重复的装备ID
        let totalFixed = 0
        categories.value.forEach(cat => {
          const fixed = fixDuplicateIds(cat.id)
          totalFixed += fixed
        })
        
        if (totalFixed > 0) {
          console.warn(`⚠️ 总共修复了 ${totalFixed} 个重复的装备ID`)
        }
        
        console.log('✅ 数据已从缓存加载', {
          分类数: categories.value.length,
          装备总数: totalItems.value,
          数据大小: `${(data.length / 1024).toFixed(2)} KB`
        })
      } catch (e) {
        console.error('❌ 数据加载失败:', e)
        categories.value = []
      }
    } else {
      console.log('📦 首次使用，初始化预设分类')
      initializeDefaultCategories()
    }
  }

  /**
   * 初始化预设分类
   */
  function initializeDefaultCategories() {
    
    categories.value = defaultCategories.map((cat, index) => ({
      id: Date.now() + index,
      name: cat.name,
      icon: cat.icon,
      items: [],
      collapsed: false
    }))
    
    saveData()
    
    const logStore = useOperationLogStore()
    logStore.log('add', '初始化了8个预设分类', {
      categories: defaultCategories.map(cat => cat.name).join('、')
    })
  }

  /**
   * 保存数据到localStorage
   */
  function saveData() {
    try {
      const dataString = JSON.stringify(categories.value)
      localStorage.setItem(localStorageKeys.equipmentChecklist, dataString)
      console.log('✅ 数据已成功保存到缓存', {
        分类数: categories.value.length,
        装备总数: totalItems.value
      })
    } catch (e) {
      console.error('❌ 数据保存失败:', e)
      alert('数据保存失败，请检查浏览器存储空间')
    }
  }

  /**
   * 同步数据（多标签页同步）
   */
  function syncData() {
    const currentData = JSON.stringify(categories.value)
    const savedData = localStorage.getItem(localStorageKeys.equipmentChecklist)
    
    if (savedData && currentData !== savedData) {
      console.log('🔄 检测到数据变化，重新加载...')
      loadData()
    } else {
      console.log('✅ 数据已同步，无需重新加载')
    }
  }

  /**
   * 添加分类
   */
  function addCategory(name, icon = '✨') {
    if (!name || name.trim() === '') {
      alert('请输入分类名称')
      return false
    }

    // 生成唯一ID：时间戳 + 随机数，避免快速连续添加时ID重复
    const uniqueId = Date.now() + Math.floor(Math.random() * 10000)

    const newCategory = {
      id: uniqueId,
      name: name.trim(),
      icon: icon,
      items: [],
      collapsed: false
    }

    categories.value.push(newCategory)
    saveData()

    const logStore = useOperationLogStore()
    logStore.log('add', `添加了分类：${name}`, { category: name })
    
    return true
  }

  /**
   * 编辑分类图标
   */
  function editCategoryIcon(categoryId, newIcon) {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (!category) return false

    if (newIcon.trim() === category.icon) {
      return false
    }

    category.icon = newIcon.trim()
    saveData()

    const logStore = useOperationLogStore()
    logStore.log('edit', `修改了分类图标：${category.name}`, { 
      category: category.name,
      oldIcon: category.icon,
      newIcon: newIcon
    })
    return true
  }

  /**
   * 删除分类
   */
  function deleteCategory(categoryId) {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (!category) return false

    const categoryName = category.name
    const itemCount = category.items.length

    if (confirm(`确定要删除"${categoryName}"及其所有装备吗？`)) {
      categories.value = categories.value.filter(cat => cat.id !== categoryId)
      saveData()

      const logStore = useOperationLogStore()
      logStore.log('delete', `删除了分类：${categoryName}`, { 
        category: categoryName, 
        itemCount: itemCount 
      })
      
      return true
    }
    return false
  }

  /**
   * 编辑分类名称
   */
  function editCategoryName(categoryId, newName) {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (!category) return false

    if (!newName || newName.trim() === '') {
      alert('分类名称不能为空')
      return false
    }

    const oldName = category.name
    if (newName.trim() === oldName) {
      return false
    }

    category.name = newName.trim()
    saveData()

    const logStore = useOperationLogStore()
    logStore.log('edit', `修改了分类名称：${oldName} → ${newName}`, {
      oldName: oldName,
      newName: newName
    })

    return true
  }

  /**
   * 切换分类折叠状态
   */
  function toggleCategoryCollapse(categoryId) {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (!category) return

    category.collapsed = !category.collapsed
    saveData()

    const logStore = useOperationLogStore()
    logStore.log('toggle', `${category.collapsed ? '收起' : '展开'}了分类：${category.name}`, {
      category: category.name,
      action: category.collapsed ? '收起' : '展开'
    })
  }

  /**
   * 重新编码分类中的所有装备序号
   */
  function reindexCategory(categoryId) {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (!category) return

    // 按照当前顺序重新编号（从1开始）
    category.items.forEach((item, index) => {
      item.index = index + 1
    })
    
    console.log(`🔢 重新编码分类 "${category.name}"，共 ${category.items.length} 个装备`)
  }

  /**
   * 修复分类中重复的装备ID
   */
  function fixDuplicateIds(categoryId) {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (!category) return 0

    const idSet = new Set()
    let fixedCount = 0

    category.items.forEach((item, index) => {
      if (idSet.has(item.id)) {
        // 发现重复ID，生成新的唯一ID
        const oldId = item.id
        // 使用更可靠的方式生成唯一ID：时间戳 + 随机数 + 索引
        item.id = Date.now() + Math.floor(Math.random() * 10000) + index
        console.warn(`⚠️ 修复重复ID: ${oldId} → ${item.id} (装备: ${item.name})`)
        fixedCount++
      } else {
        idSet.add(item.id)
      }
    })

    if (fixedCount > 0) {
      console.log(`✅ 修复了 ${fixedCount} 个重复的装备ID`)
      saveData()
    }
    
    return fixedCount
  }

  /**
   * 更新分类顺序
   */
  function updateCategoriesOrder(newOrder) {
    categories.value = newOrder
    saveData()
    
    const logStore = useOperationLogStore()
    logStore.log('sort', '重新排序了分类', {
      categories: newOrder.map(cat => cat.name).join('、')
    })
  }

  /**
   * 添加装备项目
   */
  function addItem(categoryId, itemData) {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (!category) return false

    if (!itemData.name || itemData.name.trim() === '') {
      alert('请输入装备名称')
      return false
    }

    // 计算新装备的序号（最大序号+1）
    const maxIndex = category.items.reduce((max, item) => 
      Math.max(max, item.index || 0), 0)

    // 生成唯一ID：时间戳 + 随机数，避免快速连续添加时ID重复
    const uniqueId = Date.now() + Math.floor(Math.random() * 10000)

    const newItem = {
      id: uniqueId,
      index: maxIndex + 1,  // 固定序号
      name: itemData.name.trim(),
      completed: false,
      quantity: itemData.quantity || 1,
      quantityUnit: itemData.quantityUnit || '个',
      weight: itemData.weight || 0,
      weightUnit: itemData.weightUnit || 'g',
      price: itemData.price || 0,
      priceUnit: itemData.priceUnit || '人民币'
    }

    category.items.push(newItem)
    saveData()

    const logStore = useOperationLogStore()
    logStore.log('add', `添加了装备 #${newItem.index}：${newItem.name}`, {
      category: category.name,
      item: newItem.name,
      index: newItem.index,
      quantity: `${newItem.quantity}${newItem.quantityUnit}`,
      weight: `${newItem.weight}${newItem.weightUnit}`,
      price: `${newItem.price}${newItem.priceUnit}`
    })

    return true
  }

  /**
   * 删除装备项目
   */
  function deleteItem(categoryId, itemId) {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (!category) return false

    const item = category.items.find(i => i.id === itemId)
    if (!item) return false

    const itemName = item.name
    const itemIndex = item.index

    if (confirm(`确定要删除 #${itemIndex} "${itemName}"吗？`)) {
      category.items = category.items.filter(item => item.id !== itemId)
      
      // 删除后重新编码
      reindexCategory(categoryId)
      saveData()

      const logStore = useOperationLogStore()
      logStore.log('delete', `删除了装备 #${itemIndex}：${itemName}`, {
        category: category.name,
        item: itemName,
        index: itemIndex
      })

      return true
    }
    return false
  }

  /**
   * 编辑装备项目
   */
  function editItem(categoryId, itemId, itemData) {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (!category) return false

    const item = category.items.find(i => i.id === itemId)
    if (!item) return false

    if (!itemData.name || itemData.name.trim() === '') {
      alert('请输入装备名称')
      return false
    }

    const oldName = item.name
    const oldQuantity = `${item.quantity}${item.quantityUnit}`
    const oldWeight = `${item.weight}${item.weightUnit}`
    const oldPrice = `${item.price || 0}${item.priceUnit || '人民币'}`

    item.name = itemData.name.trim()
    item.quantity = itemData.quantity || 1
    item.quantityUnit = itemData.quantityUnit || '个'
    item.weight = itemData.weight || 0
    item.weightUnit = itemData.weightUnit || 'g'
    item.price = itemData.price || 0
    item.priceUnit = itemData.priceUnit || '人民币'

    saveData()

    const logStore = useOperationLogStore()
    logStore.log('edit', `修改了装备：${oldName} → ${item.name}`, {
      category: category.name,
      oldName: oldName,
      newName: item.name,
      quantity: `${oldQuantity} → ${item.quantity}${item.quantityUnit}`,
      weight: `${oldWeight} → ${item.weight}${item.weightUnit}`,
      price: `${oldPrice} → ${item.price}${item.priceUnit}`
    })

    return true
  }

  /**
   * 切换装备完成状态
   */
  function toggleItem(categoryId, itemId) {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (!category) {
      console.error('❌ 未找到分类:', categoryId)
      return false
    }

    const item = category.items.find(i => i.id === itemId)
    if (!item) {
      console.error('❌ 未找到装备:', itemId, '在分类:', category.name)
      return false
    }

    item.completed = !item.completed
    saveData()

    const logStore = useOperationLogStore()
    logStore.log('toggle', `${item.completed ? '标记为已准备' : '标记为待准备'}：${item.name}`, {
      category: category.name,
      item: item.name,
      status: item.completed ? '已准备' : '待准备'
    })

    return true
  }

  /**
   * 导入数据
   */
  function importData(data) {
    if (!Array.isArray(data)) {
      alert('导入的数据格式不正确')
      return false
    }

    if (confirm('导入数据将覆盖当前清单，确定要继续吗？')) {
      const oldCount = categories.value.length
      
      // 导入数据并为每个装备分配序号和唯一ID，补充默认值
      categories.value = data.map(cat => {
        const categoryData = {
          ...cat,
          icon: cat.icon || '✨', // 确保导入时 icon 属性存在
          items: cat.items.map((item, index) => ({
            ...item,
            // 如果没有ID或ID不是数字，生成新的唯一ID
            id: (item.id && typeof item.id === 'number') ? item.id : Date.now() + Math.random() * 10000 + index,
            index: item.index || (index + 1), // 如果没有序号就分配一个
            price: item.price !== undefined ? item.price : 0, // 确保价格字段存在
            priceUnit: item.priceUnit || '人民币' // 确保价格单位存在
          }))
        }
        return categoryData
      })
      
      // 重新编码所有分类（确保序号连续）
      categories.value.forEach(cat => {
        reindexCategory(cat.id)
      })
      
      // 修复所有重复的ID
      let totalFixed = 0
      categories.value.forEach(cat => {
        const fixed = fixDuplicateIds(cat.id)
        totalFixed += fixed
      })
      
      if (totalFixed > 0) {
        console.warn(`⚠️ 导入数据时修复了 ${totalFixed} 个重复的装备ID`)
      }
      
      saveData()

      const logStore = useOperationLogStore()
      logStore.log('import', '导入了装备清单数据', {
        oldCategories: oldCount,
        newCategories: categories.value.length,
        totalItems: totalItems.value
      })

      console.log('✅ 数据导入完成，已为所有装备分配序号')
      alert('数据导入成功！')
      return true
    }
    return false
  }

  /**
   * 清空所有数据
   */
  function clearAllData() {
    if (confirm('确定要清空所有装备数据吗？此操作不可恢复！')) {
      if (confirm('再次确认：真的要删除所有装备分类和项目吗？')) {
        const oldCategories = categories.value.length
        const oldItems = totalItems.value

        categories.value = []
        saveData()

        const logStore = useOperationLogStore()
        logStore.log('clear', '清空了所有装备数据', {
          deletedCategories: oldCategories,
          deletedItems: oldItems
        })

        alert('所有数据已清空！')
        return true
      }
    }
    return false
  }

  return {
    // 状态
    categories,
    // Getters
    totalCategories,
    totalItems,
    completedItems,
    remainingItems,
    totalWeight,
    totalPrice,
    // Actions
    loadData,
    initializeCategories: initializeDefaultCategories, // 暴露初始化分类方法
    saveData,
    syncData,
    addCategory,
    deleteCategory,
    editCategoryName,
    editCategoryIcon, // 暴露 editCategoryIcon 方法
    toggleCategoryCollapse,
    reindexCategory, // 暴露重编码方法
    fixDuplicateIds, // 暴露修复重复ID方法
    updateCategoriesOrder, // 暴露更新分类顺序方法
    addItem,
    deleteItem,
    editItem,
    toggleItem,
    importData,
    clearAllData
  }
})

