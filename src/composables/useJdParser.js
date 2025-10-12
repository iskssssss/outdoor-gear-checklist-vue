import { ref } from 'vue';

export function useJdParser() {
  const corsProxy = 'https://api.allorigins.win/get?url=';

  function extractShortLink(text) {
    const match = text.match(/https?:\/\/3\.cn\/[a-zA-Z0-9_-]+/i);
    return match ? match[0] : null;
  }

  async function fetchHtml(url) {
    const res = await fetch(`${corsProxy}${encodeURIComponent(url)}`);
    if (!res.ok) {
        const data = await res.json();
        throw new Error(`获取页面内容失败: ${data?.contents || '网络错误'}`);
    }
    const data = await res.json();
    return data.contents;
  }

  function parseHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const items = [];

    doc.querySelectorAll('ul.recommendation > li').forEach(el => {
      const nameEl = el.querySelector('div.short-description h4 span');
      const priceEl = el.querySelector('div.short-description span.price');
      const quantityEl = el.querySelector('div.short-description input.num_input');

      if (nameEl && priceEl && quantityEl) {
        const name = nameEl.textContent?.trim();
        const priceText = priceEl.textContent ?? '';
        const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || null;
        const quantity = parseInt(quantityEl.value || '1', 10);

        if (name) {
          items.push({
            id: crypto.randomUUID(),
            name,
            price,
            quantity,
          });
        }
      }
    });

    return items;
  }

  async function parseJdContent(input) {
    let html = input;
    const link = extractShortLink(input);
    if (link) {
        try {
            html = await fetchHtml(link);
        } catch (e) {
            throw new Error(`无法自动获取页面内容。请手动打开链接，复制页面源代码后粘贴。(${e.message})`);
        }
    }
    return parseHtml(html);
  }

  return { parseJdContent };
}
