const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; Tradewithvss/1.0)' };
const send = (res, data, age = 20) => { res.setHeader('Cache-Control', `s-maxage=${age}, stale-while-revalidate=${age * 3}`); res.setHeader('Access-Control-Allow-Origin', '*'); res.status(200).json(data); };
const get = async (url, opt = {}) => { const r = await fetch(url, { headers: UA, ...opt }); if (!r.ok) throw new Error(r.status); return r; };
module.exports = { UA, send, get };
