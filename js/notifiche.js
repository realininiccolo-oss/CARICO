/* Notifica a fine recupero anche a schermo spento, tramite ntfy (ntfy.sh).
   L'app chiede a ntfy di spedire una notifica tra N secondi; l'app ntfy sul telefono la riceve
   e il telefono la passa allo smartwatch come tutte le altre. Se il recupero cambia, la annullo. */
import { S, save } from './store.js';

const BASE = 'https://ntfy.sh/';
export const attive = () => !!(S.notif && S.notif.on && S.notif.topic);
export function attiva() {
  if (!S.notif || !S.notif.topic) {
    const a = crypto.getRandomValues(new Uint8Array(16));
    S.notif = { on: true, topic: 'carico-' + [...a].map((b) => (b % 36).toString(36)).join('') };
  } else S.notif.on = true;
  save();
}
export function spegni() { annulla(); if (S.notif) S.notif.on = false; save(); }
// richieste "semplici" (no-cors): partono anche se ntfy non risponde con le intestazioni CORS
const invia = (url, body) => fetch(url, { method: body == null ? 'GET' : 'POST', body, mode: 'no-cors', keepalive: true }).catch(() => {});

/* Programma la notifica tra `sec` secondi (ntfy accetta da 10 s in su). */
export function programma(sec, titolo, testo) {
  annulla();
  if (!attive() || sec < 10) return;
  const id = 'r' + Date.now().toString(36);
  S.notif.ultimo = id; save();
  const q = new URLSearchParams({ delay: `${Math.round(sec)}s`, title: titolo, tags: 'stopwatch', priority: '5' });
  invia(`${BASE}${S.notif.topic}/${id}?${q}`, testo);
}
export function annulla() {
  const id = S.notif && S.notif.ultimo; if (!id) return;
  S.notif.ultimo = null; save();
  invia(`${BASE}${S.notif.topic}/${id}/delete`);
}
export function prova() { if (attive()) invia(`${BASE}${S.notif.topic}?${new URLSearchParams({ title: 'Carico', tags: 'muscle', priority: '5' })}`, 'Le notifiche arrivano. Buon allenamento!'); }
