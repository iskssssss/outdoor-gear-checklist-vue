// composables/useModelAnalyzer.js
export function useModelAnalyzer(modelConfigStore, equipmentStore) {
  /**
   * 检测商品名称中是否含有套装信息
   * 支持格式：
   *   - “5支装”、“10包”、“3件”、“二支装”、“一套”、“家庭装”、“组合装”等
   */
  function detectBundleInfo(name) {
    // 匹配阿拉伯数字或中文数字 + 常见单位
    const match = name.match(/(\d+|[一二三四五六七八九十]+)\s*(支|包|件|个|对|瓶|片|条|套)/u);
    if (!match) return null;

    let num = match[1];
    // 中文数字转阿拉伯数字
    if (isNaN(num)) {
      const map = { 一:1, 二:2, 三:3, 四:4, 五:5, 六:6, 七:7, 八:8, 九:9, 十:10 };
      num = map[num] ?? 1;
    }

    return { count: Number(num), unit: match[2] };
  }

  /**
   * 对模型返回的商品结果进行后处理，自动调整套装单价
   */
  function adjustBundlePrice(item) {
    const bundle = detectBundleInfo(item.name);
    if (!bundle) return item;
    const adjusted = { ...item };

    // 如果模型未自行调整单价，则进行推算
    if (adjusted.price && adjusted.quantity === 1 && bundle.count > 1) {
      const unitPrice = adjusted.price / bundle.count;
      adjusted.price = parseFloat(unitPrice.toFixed(2));
      adjusted.note = `(自动修正: ${bundle.count}${bundle.unit}套装单价)`;
    }

    return adjusted;
  }

  /**
   * 主函数：分析商品并分类
   */
  async function analyzeWithModel(items) {
    if (!modelConfigStore.settings.apiKey && !modelConfigStore.settings.apiUrl.includes('localhost')) {
      throw new Error('未配置模型 API');
    }

    // 先预识别套装信息
    const enrichedItems = items.map(i => ({
      ...i,
      bundleInfo: detectBundleInfo(i.name)
    }));

    // 获取现有分类
    const existingCategories = equipmentStore.categories.map(c => c.name).join('、');

    // 构造结构化提示词
    const prompt = `
你是一个户外装备专家，请分析以下商品名称并进行分类。
输出结构化 JSON 数组。

规则要求：
1. 若商品名称或描述中包含“×N”、“N个”、“N支”、“N包”、“N件”、“N对”、“套装”、“组合装”等，视为套装。
2. 请提取套装数量 N（如果是中文数字，请转为阿拉伯数字）。
3. 如果检测到套装，请计算单品单价 = 总价 / N，并填写到 price 字段中。
4. 输出字段包括：
   - name: 商品名称 ()
   - category: 分类名称（从以下选择或自行创建）→ ${existingCategories}
   - quantity: 数量
   - price: 单品价格
   - quantityUnit: 数量单位
   - weight: 重量（可选）
   - weightUnit: 重量单位（可选）
5. 返回的每个商品的'name'字段中，请根据产品属性仅保留必要的信息
6. 输出严格为 JSON 数组格式，不添加任何说明文字。

以下是待分析商品：
${enrichedItems.map(i => `商品：${i.name}，价格：${i.price ?? '未知'}元，数量：${i.quantity}`).join('\n')}
`;

    // 调用大模型
    const result = await modelConfigStore.testConnection(prompt);
    const content = result?.content ?? '';

    // 尝试解析 JSON 块
    const jsonMatch = content.match(/```json\n([\s\S]*?)```/);
    let jsonStr = jsonMatch ? jsonMatch[1] : content;

    // 进一步处理，以防模型返回不规范的JSON
    try {
        // 尝试找到第一个'['和最后一个']'之间的内容
        const firstBracket = jsonStr.indexOf('[');
        const lastBracket = jsonStr.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
            jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
        }
        
        let parsed = JSON.parse(jsonStr);

        if (!Array.isArray(parsed)) {
          throw new Error('模型返回格式错误，应为 JSON 数组');
        }
        
        // 进行后处理：调整套装价格
        const adjustedResults = parsed.map(adjustBundlePrice);

        // 返回最终结果
        return adjustedResults.map((p, i) => ({
          id: items[i].id,
          name: p.name ?? items[i].name,
          category: p.category ?? '未分类',
          quantity: p.quantity ?? items[i].quantity,
          price: p.price ?? items[i].price ?? null,
          quantityUnit: p.quantityUnit ?? '件',
          weight: p.weight ?? 0,
          weightUnit: p.weightUnit ?? 'g',
          note: p.note ?? null
        }));

    } catch (e) {
      console.error("JSON 解析失败:", e, "原始字符串:", jsonStr);
      throw new Error('模型返回的结果无法解析为 JSON');
    }
  }

  return { analyzeWithModel };
}
