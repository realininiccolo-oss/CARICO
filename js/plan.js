/* Il piano flessibile: la scheda è una rotazione (A → B → C → A…), non un calendario fisso.
   Gli allenamenti si assegnano ai prossimi "slot" liberi: se un giorno salta, tutto slitta in avanti. */
import { S, today, addDays, dow } from './store.js';
import * as ritmo from './ritmo.js';

const ORIZZONTE = 28;
export const giorno = (id) => S.scheda.giorni.find((g) => g.id === id) || null;

/* Indice del prossimo giorno della scheda: scelto a mano, oppure quello dopo l'ultimo fatto. */
export function prossimoIdx() {
  const G = S.scheda.giorni; if (!G.length) return -1;
  if (S.prossimo) { const i = G.findIndex((g) => g.id === S.prossimo); if (i >= 0) return i; }
  for (let k = S.sessioni.length - 1; k >= 0; k--) { const i = G.findIndex((g) => g.id === S.sessioni[k].giorno); if (i >= 0) return (i + 1) % G.length; }
  return 0;
}

const addMin = (t, m) => { if (!t) return null; const [h, mm] = t.split(':').map(Number), x = h * 60 + mm + m; return `${String(Math.floor(x / 60) % 24).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };

/* Slot di allenamento nei prossimi giorni.
   Dove Ritmo ha già le palestre in calendario comandano quelle; dopo, i giorni preferiti. */
export function slot() {
  const t = today(), fine = addDays(t, ORIZZONTE), out = [];
  const ultimaRitmo = ritmo.ultimaPalestra(t); // fin dove Ritmo ha già le palestre in calendario
  const fattoOggi = S.sessioni.some((s) => s.data === t);
  for (let d = t; d <= fine; d = addDays(d, 1)) {
    if (S.salti.includes(d)) continue;
    if (d === t && (fattoOggi || S.live)) continue;
    const ev = ritmo.palestraIl(d);
    if (ev) out.push({ data: d, ora: ev.inizio || null, fine: ev.fine || null, fonte: 'ritmo', occupato: ritmo.impegniIl(d).length });
    else if ((!ultimaRitmo || d > ultimaRitmo) && S.pref.giorni.includes(dow(d))) out.push({ data: d, ora: S.pref.ora, fine: addMin(S.pref.ora, S.pref.durata), fonte: 'piano', occupato: ritmo.impegniIl(d).length });
  }
  return out;
}

/* Prossimi allenamenti: slot + giorni della scheda in rotazione. */
export function agenda(n = 8) {
  const G = S.scheda.giorni, i0 = prossimoIdx();
  return slot().slice(0, n).map((s, k) => ({ ...s, giorno: G.length ? G[(i0 + k) % G.length] : null }));
}

/* «Non oggi»: il giorno salta e l'allenamento passa al prossimo slot. */
export function salta(d) { if (!S.salti.includes(d)) S.salti = [...S.salti.filter((x) => x >= addDays(today(), -60)), d]; }
export function annullaSalto(d) { S.salti = S.salti.filter((x) => x !== d); }

/* Pubblica in Ritmo gli allenamenti che Ritmo non ha già in calendario. */
export function aggiornaRitmo() {
  const lista = agenda(12).filter((a) => a.fonte === 'piano' && a.giorno).map((a) => ({ data: a.data, ora: a.ora, fine: a.fine, durata: S.pref.durata, titolo: 'Palestra · ' + a.giorno.nome }));
  const fatti = S.sessioni.filter((s) => s.data >= addDays(today(), -7) && !ritmo.palestraIl(s.data)).map((s) => ({ data: s.data, titolo: 'Palestra · ' + s.nome, fatto: true }));
  ritmo.pubblica([...fatti, ...lista]);
}

/* ---------- numeri ---------- */
export const e1rm = (kg, reps) => (kg > 0 && reps > 0 ? kg * (1 + reps / 30) : 0); // stima di Epley
export const topReps = (r) => { const m = String(r || '').match(/(\d+)\s*(?:[-–]\s*(\d+))?/); return m ? Number(m[2] || m[1]) : 0; };
export const lowReps = (r) => { const m = String(r || '').match(/(\d+)/); return m ? Number(m[1]) : 0; };
const chiave = (e) => (e.esId || e.nome || '').toLowerCase();

/* Ultima volta che ho fatto questo esercizio (stesso id o stesso nome). */
export function ultima(es) {
  for (let k = S.sessioni.length - 1; k >= 0; k--) {
    const x = S.sessioni[k].esercizi.find((e) => chiave(e) === chiave(es) || (e.nome || '').toLowerCase() === (es.nome || '').toLowerCase());
    if (x && x.serie.some((s) => s.ok)) return x;
  }
  return null;
}
/* Proposta di carico: se l'ultima volta tutte le serie hanno toccato il massimo delle ripetizioni, +2,5 kg. */
export function proposta(es) {
  const u = ultima(es); if (!u) return { kg: '', reps: lowReps(es.reps) || '', su: false };
  const fatte = u.serie.filter((s) => s.ok), top = topReps(es.reps), kg = Math.max(...fatte.map((s) => Number(s.kg) || 0));
  const su = top > 0 && fatte.length >= (es.serie || fatte.length) && fatte.every((s) => Number(s.reps) >= top) && kg > 0;
  return { kg: su ? kg + 2.5 : kg || '', reps: su ? lowReps(es.reps) : (fatte[0] && fatte[0].reps) || lowReps(es.reps) || '', su };
}
/* Storia di un esercizio: miglior e1RM per sessione. */
export function storia(nome) {
  const n = nome.toLowerCase(), out = [];
  for (const s of S.sessioni) for (const e of s.esercizi) if ((e.nome || '').toLowerCase() === n) {
    const ok = e.serie.filter((x) => x.ok && Number(x.kg) > 0);
    if (ok.length) { const best = ok.reduce((a, b) => (e1rm(+b.kg, +b.reps) > e1rm(+a.kg, +a.reps) ? b : a)); out.push({ data: s.data, v: Math.round(e1rm(+best.kg, +best.reps) * 10) / 10, kg: +best.kg, reps: +best.reps }); }
  }
  return out;
}
export const eserciziFatti = () => [...new Set(S.sessioni.flatMap((s) => s.esercizi.filter((e) => e.serie.some((x) => x.ok && +x.kg > 0)).map((e) => e.nome)))];
