/* Stato dell'app: tutto sul telefono. Dati in localStorage, foto in IndexedDB. */
const KEY = 'carico:stato';

export const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const iso = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
/* Il giorno "logico" cambia alle 4 di notte, come in Ritmo. */
export const today = () => iso(Date.now() - 4 * 3600e3);
export const addDays = (d, n) => { const [y, m, g] = d.split('-').map(Number); return iso(new Date(y, m - 1, g + n)); };
export const dow = (d) => { const [y, m, g] = d.split('-').map(Number); return new Date(y, m - 1, g).getDay(); };

const vuoto = () => ({
  v: 1,
  scheda: { giorni: [] },            // giorni in ordine di rotazione
  pref: { giorni: [1, 3, 5], ora: '18:00', durata: 90 }, // giorni della settimana (0 = domenica)
  sessioni: [],                       // allenamenti finiti
  live: null,                         // allenamento in corso
  salti: [],                          // date in cui ho detto «non oggi»
  prossimo: null,                     // giorno della scheda scelto a mano per il prossimo allenamento
  misure: [],                         // pesate e dati della bilancia
});

export const S = load();
function load() {
  try { const x = JSON.parse(localStorage.getItem(KEY) || 'null'); return x ? { ...vuoto(), ...x } : vuoto(); } catch (e) { return vuoto(); }
}
const listeners = new Set();
export const onSave = (fn) => listeners.add(fn);
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* spazio finito */ }
  listeners.forEach((fn) => fn());
}
export function replaceAll(x) { for (const k of Object.keys(S)) delete S[k]; Object.assign(S, vuoto(), x); save(); }

/* ---------- foto (IndexedDB) ---------- */
let dbp = null;
const db = () => dbp || (dbp = new Promise((ok, ko) => {
  const r = indexedDB.open('carico', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('foto', { keyPath: 'id' });
  r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
}));
const tx = async (mode, fn) => { const d = await db(); return new Promise((ok, ko) => { const t = d.transaction('foto', mode), st = t.objectStore('foto'), r = fn(st); t.oncomplete = () => ok(r && r.result); t.onerror = () => ko(t.error); }); };
export const foto = {
  all: async () => (await tx('readonly', (s) => s.getAll())).sort((a, b) => a.data < b.data ? 1 : -1),
  put: (f) => tx('readwrite', (s) => s.put(f)),
  del: (id) => tx('readwrite', (s) => s.delete(id)),
};
/* Riduce la foto (lato lungo 1400 px, JPEG) prima di salvarla. */
export async function shrink(file, max = 1400) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.82));
}
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { /* niente */ }
