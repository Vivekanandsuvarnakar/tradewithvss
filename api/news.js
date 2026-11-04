// Multi-source news: /api/news?topic=india|global|forex|crypto|dividend|ipo|stock&q=optional
const { send, get } = require('./_util');
const G = (q) => 'https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=' + encodeURIComponent(q + ' when:2d');
const FEEDS = {
  india: [G('Sensex OR Nifty OR "Indian stock market"'), 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', 'https://www.livemint.com/rss/markets', 'https://www.business-standard.com/rss/markets-106.rss', 'https://www.moneycontrol.com/rss/marketreports.xml'],
  global: [G('Wall Street OR "global markets" OR Fed OR "oil prices"'), 'https://feeds.bbci.co.uk/news/business/rss.xml', 'https://www.cnbc.com/id/10000664/device/rss/rss.html'],
  forex: [G('forex OR "dollar index" OR EURUSD OR USDJPY OR rupee'), 'https://www.fxstreet.com/rss/news', 'https://www.dailyfx.com/feeds/market-news'],
  crypto: [G('bitcoin OR ethereum OR crypto market'), 'https://www.coindesk.com/arc/outboundfeeds/rss/', 'https://cointelegraph.com/rss'],
  dividend: [G('dividend record date OR bonus OR "stock split" India'), 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms'],
  ipo: [G('IPO GMP OR "IPO listing" OR "IPO subscription" India')],
  stock: [],
};
const tag = (x, t) => { const m = x.match(new RegExp('<' + t + '[^>]*>([\\s\\S]*?)</' + t + '>')); return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : ''; };
module.exports = async (req, res) => {
  const topic = String(req.query.topic || 'india'), q = String(req.query.q || '');
  const urls = FEEDS[topic] ? FEEDS[topic].slice() : []; if (q) urls.unshift(G(q));
  const lists = await Promise.all(urls.map(async (u) => {
    try {
      const x = await (await get(u)).text(), host = new URL(u).hostname.replace('www.', '').replace('news.google.com', '');
      return (x.match(/<item[\s\S]*?<\/item>/g) || []).slice(0, 12).map((it) => {
        let t = tag(it, 'title'), s = tag(it, 'source') || host;
        if (!host && / - [^-]+$/.test(t)) { s = t.split(' - ').pop(); t = t.replace(/ - [^-]+$/, ''); }
        return { t, l: tag(it, 'link'), s, d: Date.parse(tag(it, 'pubDate')) || 0 };
      });
    } catch (e) { return []; }
  }));
  const seen = {}, all = [].concat(...lists).filter((i) => i.t && i.l && !seen[i.t.slice(0, 60)] && (seen[i.t.slice(0, 60)] = 1)).sort((a, b) => b.d - a.d);
  send(res, all.slice(0, 40), 120);
};
