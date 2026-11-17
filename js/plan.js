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

/* ---------- confronto con l'ultima volta ---------- */
const okSerie = (e) => (e ? e.serie.filter((s) => s.ok) : []);
const n0 = (v) => Number(String(v ?? '').replace(',', '.')) || 0;
export const record = (nome) => Math.max(0, ...storia(nome).map((x) => x.v));
export const volumeEs = (e) => okSerie(e).reduce((a, s) => a + n0(s.kg) * n0(s.reps), 0);

/* Una serie appena fatta contro la stessa serie dell'ultima volta. */
export function confrontoSerie(es, i) {
  const s = es.serie[i], u = okSerie(ultima(es)), kg = n0(s.kg), r = n0(s.reps);
  // record: meglio di tutto lo storico e delle serie già fatte oggi
  const prima = Math.max(record(es.nome), ...es.serie.slice(0, i).filter((x) => x.ok).map((x) => e1rm(n0(x.kg), n0(x.reps))));
  const rec = record(es.nome) > 0 && e1rm(kg, r) > prima + 0.01;
  if (!u.length) return { prima: true, dir: 0, rec };
  const p = u[Math.min(i, u.length - 1)], dk = Math.round((kg - n0(p.kg)) * 10) / 10, dr = r - n0(p.reps);
  return { dk, dr, rec, dir: dk ? Math.sign(dk) : Math.sign(dr), prima: false };
}
/* Un esercizio finito contro l'ultima volta: volume, serie migliore, record. */
export function confrontoEsercizio(es) {
  const ok = okSerie(es), vol = volumeEs(es);
  const best = ok.reduce((a, s) => (e1rm(n0(s.kg), n0(s.reps)) > e1rm(n0(a.kg), n0(a.reps)) ? s : a), ok[0] || { kg: 0, reps: 0 });
  const u = ultima(es), rec = record(es.nome) > 0 && e1rm(n0(best.kg), n0(best.reps)) > record(es.nome) + 0.01;
  if (!u) return { prima: true, vol, best, rec, dir: 0 };
  const pv = volumeEs(u), uo = okSerie(u);
  const pb = uo.reduce((a, s) => (e1rm(n0(s.kg), n0(s.reps)) > e1rm(n0(a.kg), n0(a.reps)) ? s : a), uo[0]);
  const dv = pv ? Math.round(((vol - pv) / pv) * 100) : null, dk = Math.round((n0(best.kg) - n0(pb.kg)) * 10) / 10, dr = n0(best.reps) - n0(pb.reps);
  return { prima: false, vol, pv, dv, best, pb, dk, dr, rec, dir: Math.sign(dv || 0) || Math.sign(dk) || Math.sign(dr) };
}
