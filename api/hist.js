// Price history: /api/hist?s=RELIANCE.NS&range=1y&interval=1d
const { send, get } = require('./_util');
module.exports = async (req, res) => {
  const s = String(req.query.s || ''), range = String(req.query.range || '1y'), iv = String(req.query.interval || '1d');
  try {
    const j = await (await get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=${iv}&range=${range}`)).json();
    const r = j.chart.result[0], q = r.indicators.quote[0];
    send(res, { t: r.timestamp, o: q.open, h: q.high, l: q.low, c: q.close, v: q.volume, m: r.meta && { n: r.meta.longName || r.meta.shortName, p: r.meta.regularMarketPrice } }, 120);
  } catch (e) { send(res, { error: 1 }, 10); }
};
