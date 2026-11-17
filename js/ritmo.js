/* Collegamento con Ritmo (stesso indirizzo: realininiccolo-oss.github.io).
   Lettura: gli impegni di Ritmo, presi dalla memoria che le due app condividono quando girano nello stesso browser.
   Su iPhone, aggiunte alla schermata Home, ogni app ha la sua memoria: allora leggo il file cifrato di Ritmo
   con la parola chiave e, se c'è, anche il gist privato dove Ritmo salva l'andamento (impegni aggiunti a mano).
   Scrittura: Carico pubblica i suoi allenamenti in «carico:per-ritmo»; Ritmo li mostra (vedi README). */
const RITMO_URL = '../ritmo/';
const K = { dati: 'ritmo:dati', stato: 'ritmo:stato', pass: 'carico:ritmo-pass', gist: 'carico:ritmo-gist', cache: 'carico:ritmo-cache', out: 'carico:per-ritmo' };
const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* niente */ } };
const jp = (s) => { try { return JSON.parse(s || 'null'); } catch (e) { return null; } };

export const R = { via: null, eventi: [], letto: 0 };

/* Impegni di Ritmo: quelli del file (meno i nascosti) + quelli aggiunti sul telefono. */
function merge(dati, stato) {
  const hid = new Set((stato && stato.nascosti) || []);
  const file = ((dati && dati.eventi) || []).filter((e) => !hid.has(e.id));
  const miei = (stato && stato.miei) || [];
  return [...file, ...miei].filter((e) => e && e.data);
}

export async function leggi() {
  const dati = jp(get(K.dati)), stato = jp(get(K.stato));
  if (dati || stato) { R.via = 'locale'; R.eventi = merge(dati, stato); R.letto = Date.now(); return R; }
  const pass = get(K.pass);
  if (pass) {
    const c = jp(get(K.cache)) || {};
    try { const d = await scaricaFile(pass); c.eventi = d.eventi || []; c.wk = d.wk || null; } catch (e) { if (!c.eventi) { R.via = null; R.eventi = []; return R; } }
    const g = get(K.gist);
    if (g && c.wk && (!c.t || Date.now() - c.t > 5 * 60e3)) { try { c.stato = await leggiGist(g, c.wk); c.t = Date.now(); } catch (e) { /* uso l'ultima copia */ } }
    set(K.cache, JSON.stringify(c));
    R.via = c.stato ? 'gist' : 'file'; R.eventi = merge({ eventi: c.eventi }, c.stato || null); R.letto = Date.now(); return R;
  }
  R.via = null; R.eventi = []; return R;
}

const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
/* Stessa cifratura di Ritmo: PBKDF2-SHA256 + AES-GCM. */
async function scaricaFile(pass) {
  const r = await fetch(RITMO_URL + 'data.enc.json?t=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) throw new Error('rete');
  const pkg = await r.json(), enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(pass.trim().toLowerCase()), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(pkg.salt), iterations: pkg.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(pkg.iv) }, key, b64(pkg.ct))));
}
/* L'andamento di Ritmo nel gist: SHA-256 a contatore + HMAC-SHA256, con la chiave del widget (wk) presa dal file. */
async function leggiGist(id, wk) {
  const r = await fetch('https://api.github.com/gists/' + id, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
  if (!r.ok) throw new Error('gist ' + r.status);
  const f = (await r.json()).files['ritmo-stato.json'], x = JSON.parse(f.content);
  const Kb = Uint8Array.from(wk.match(/../g).map((h) => parseInt(h, 16))), n = b64(x.n), c = b64(x.c), t = b64(x.t);
  const hk = await crypto.subtle.importKey('raw', Kb, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const msg = new Uint8Array(16 + c.length); msg.set(n); msg.set(c, 16);
  if (!(await crypto.subtle.verify('HMAC', hk, t, msg))) throw new Error('firma');
  const p = new Uint8Array(c.length);
  for (let i = 0; i * 32 < c.length; i++) {
    const blk = new Uint8Array(Kb.length + 20); blk.set(Kb); blk.set(n, Kb.length); new DataView(blk.buffer).setUint32(Kb.length + 16, i);
    const ks = new Uint8Array(await crypto.subtle.digest('SHA-256', blk));
    for (let j = 0; j < 32 && i * 32 + j < c.length; j++) p[i * 32 + j] = c[i * 32 + j] ^ ks[j];
  }
  return JSON.parse(new TextDecoder().decode(p));
}
const gistId = (s) => ((s || '').match(/[0-9a-f]{20,}/i) || [''])[0];
export async function collegaConParola(pass, gist) {
  await scaricaFile(pass); set(K.pass, pass.trim().toLowerCase());
  try { localStorage.removeItem(K.cache); if (gistId(gist)) set(K.gist, gistId(gist)); else localStorage.removeItem(K.gist); } catch (e) { /* niente */ }
  return leggi();
}
export function scollega() { try { [K.pass, K.cache, K.gist].forEach((k) => localStorage.removeItem(k)); } catch (e) { /* niente */ } }

const isGym = (e) => e.tipo === 'palestra' || /\b(palestra|gym|pesi|allenamento)\b/i.test(e.titolo || '');
export const palestraIl = (d) => R.eventi.filter((e) => e.data === d && isGym(e)).sort((a, b) => (a.inizio || '').localeCompare(b.inizio || ''))[0] || null;
export const impegniIl = (d) => R.eventi.filter((e) => e.data === d && !isGym(e));
export const ultimaPalestra = (from) => R.eventi.filter((e) => e.data >= from && isGym(e)).map((e) => e.data).sort().pop() || null;
export const haPalestra = (from, to) => R.eventi.some((e) => e.data >= from && e.data <= to && isGym(e));

/* Allenamenti di Carico da mostrare in Ritmo (solo dove Ritmo non ha già la palestra). */
export function pubblica(lista) {
  set(K.out, JSON.stringify({ v: 1, t: Date.now(), eventi: lista.map((x) => ({
    id: 'carico-' + x.data, data: x.data, inizio: x.ora || null, fine: x.fine || null, durata: x.durata || 90,
    titolo: x.titolo, tipo: 'palestra', fonte: 'carico', fatto: !!x.fatto,
  })) }));
}
