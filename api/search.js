// Symbol search: /api/search?q=reliance&x=NS  (x=NS|BO|all)
const { send, get } = require('./_util');
module.exports = async (req, res) => {
  const q = String(req.query.q || '').trim(), x = String(req.query.x || 'NS');
  if (!q) return send(res, []);
  try {
    const j = await (await get('https://query1.finance.yahoo.com/v1/finance/search?quotesCount=14&newsCount=0&q=' + encodeURIComponent(q))).json();
    let a = (j.quotes || []).filter((e) => e.symbol && e.quoteType !== 'OPTION');
    if (x !== 'all') a = a.filter((e) => e.symbol.endsWith('.' + x));
    send(res, a.map((e) => ({ s: e.symbol, n: e.longname || e.shortname, e: e.exchDisp })), 300);
  } catch (e) { send(res, []); }
};
