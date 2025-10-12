export function useImporter(equipmentStore, logStore, toast) {
  async function importAnalyzedItems(items, isCancelled, isImporting) {
    isImporting.value = true;
    try {
      for (const item of items) {
        if (isCancelled.value) {
          toast.warning('导入操作已取消');
          throw new Error('导入已取消');
        }

        let category = equipmentStore.categories.find(c => c.name === item.category);
        if (!category) {
          equipmentStore.addCategory(item.category, item.categoryIcon || '🛍️');
          category = equipmentStore.categories.find(c => c.name === item.category);
        }

        equipmentStore.addItem(category.id, {
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          quantityUnit: item.quantityUnit || '件',
          weight: item.weight || 0,
          weightUnit: item.weightUnit || 'g',
        });
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
