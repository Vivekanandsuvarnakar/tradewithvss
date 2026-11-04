// Live quotes: /api/quote?s=RELIANCE.NS,^NSEI,EURUSD=X,GC=F  (Yahoo Finance chart endpoint)
const { send, get } = require('./_util');
module.exports = async (req, res) => {
  const syms = String(req.query.s || '').split(',').filter(Boolean).slice(0, 80), out = {};
  await Promise.all(syms.map(async (s) => {
    try {
      const j = await (await get('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(s) + '?interval=1d&range=1d')).json();
      const m = j.chart.result[0].meta;
      out[s] = { p: m.regularMarketPrice, c: m.chartPreviousClose, h: m.fiftyTwoWeekHigh, l: m.fiftyTwoWeekLow, dh: m.regularMarketDayHigh, dl: m.regularMarketDayLow, v: m.regularMarketVolume, n: m.longName || m.shortName, t: m.regularMarketTime };
    } catch (e) {}
  }));
  send(res, out, 20);
};
