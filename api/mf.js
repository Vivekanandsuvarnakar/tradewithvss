// Mutual funds via mfapi.in. /api/mf?q=parag  -> search;  /api/mf?code=122639 -> meta + NAV series (ts,nav) oldest first
const { send, get } = require('./_util');
module.exports = async (req, res) => {
  try {
    if (req.query.q) {
      const j = await (await get('https://api.mfapi.in/mf/search?q=' + encodeURIComponent(String(req.query.q)))).json();
      return send(res, j.slice(0, 60), 600);
    }
    const j = await (await get('https://api.mfapi.in/mf/' + encodeURIComponent(String(req.query.code)))).json();
    const d = (j.data || []).map((e) => { const p = e.date.split('-'); return [Date.UTC(+p[2], +p[1] - 1, +p[0]) / 1000, +e.nav]; }).reverse();
    send(res, { meta: j.meta, nav: d }, 3600);
  } catch (e) { send(res, { error: 1 }, 10); }
};
