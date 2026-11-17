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

/* ---------- tipi di esercizio ---------- */
/* campi: [chiave, unità, passo, decimali]. ordine: quali campi contano per dire "meglio" o "peggio". */
export const TIPI = {
  pesi: { n: 'Pesi', campi: [['kg', 'kg', 2.5, true], ['reps', 'rip', 1, false]], ordine: ['kg', 'reps'], obiettivo: 'Ripetizioni', serie: 3 },
  corpo: { n: 'Corpo libero', campi: [['reps', 'rip', 1, false]], ordine: ['reps'], obiettivo: 'Ripetizioni', serie: 3 },
  tempo: { n: 'A tempo', campi: [['sec', 'sec', 5, false]], ordine: ['sec'], obiettivo: 'Secondi', serie: 3 },
  cardio: { n: 'Cardio', campi: [['min', 'min', 1, true], ['km', 'km', 0.1, true], ['liv', 'livello', 1, false]], ordine: ['km', 'min', 'liv'], obiettivo: 'Obiettivo (min)', serie: 1 },
};
const CARDIO = /\b(corsa|cyclette|bici|tapis|ellittica|vogatore|camminata|nuoto|spinning|cardio|step|stairmaster)/i;
export const tipoDi = (e) => (e && TIPI[e.tipo] ? e.tipo : CARDIO.test((e && e.nome) || '') ? 'cardio' : 'pesi');

/* ---------- numeri ---------- */
export const e1rm = (kg, reps) => (kg > 0 && reps > 0 ? kg * (1 + reps / 30) : 0); // stima di Epley
export const topReps = (r) => { const m = String(r || '').match(/(\d+)\s*(?:[-–]\s*(\d+))?/); return m ? Number(m[2] || m[1]) : 0; };
export const lowReps = (r) => { const m = String(r || '').match(/(\d+)/); return m ? Number(m[1]) : 0; };
const chiave = (e) => (e.esId || e.nome || '').toLowerCase();
const okSerie = (e) => (e ? e.serie.filter((s) => s.ok) : []);
export const n0 = (v) => Number(String(v ?? '').replace(',', '.')) || 0;

/* Quanto "vale" una serie: pesi → massimale stimato; corpo → ripetizioni; tempo → secondi; cardio → km (o minuti). */
export function forza(t, s) {
  if (t === 'pesi') return e1rm(n0(s.kg), n0(s.reps));
  if (t === 'corpo') return n0(s.reps);
  if (t === 'tempo') return n0(s.sec);
  return n0(s.km) || n0(s.min);
}
export const unitaForza = (t, e) => ({ pesi: 'kg', corpo: 'rip', tempo: 's', cardio: e && okSerie(e).some((x) => n0(x.km)) ? 'km' : 'min' }[t]);
/* Volume: pesi kg×rip; corpo ripetizioni; tempo secondi; cardio km (o minuti). */
export function volumeEs(e) {
  const t = tipoDi(e), ok = okSerie(e);
  if (t === 'pesi') return ok.reduce((a, s) => a + n0(s.kg) * n0(s.reps), 0);
  if (t === 'cardio') { const km = ok.reduce((a, s) => a + n0(s.km), 0); return km || ok.reduce((a, s) => a + n0(s.min), 0); }
  return ok.reduce((a, s) => a + forza(t, s), 0);
}
export const unitaVolume = (e) => ({ pesi: 'kg', corpo: 'rip', tempo: 's', cardio: okSerie(e).some((x) => n0(x.km)) ? 'km' : 'min' }[tipoDi(e)]);

/* Ultima volta che ho fatto questo esercizio (stesso id o stesso nome). */
export function ultima(es) {
  for (let k = S.sessioni.length - 1; k >= 0; k--) {
    const x = S.sessioni[k].esercizi.find((e) => chiave(e) === chiave(es) || (e.nome || '').toLowerCase() === (es.nome || '').toLowerCase());
    if (x && x.serie.some((s) => s.ok)) return x;
  }
  return null;
}
/* Valori di partenza. Pesi: se l'ultima volta tutte le serie hanno toccato il massimo delle ripetizioni, +passo kg. */
export function proposta(es) {
  const t = tipoDi(es), u = ultima(es), fatte = okSerie(u), base = {};
  if (t === 'pesi') {
    if (!fatte.length) return { kg: '', reps: lowReps(es.reps) || '', su: false };
    const top = topReps(es.reps), kg = Math.max(...fatte.map((s) => n0(s.kg)));
    const su = top > 0 && fatte.length >= (es.serie || fatte.length) && fatte.every((s) => n0(s.reps) >= top) && kg > 0;
    return { kg: su ? kg + (Number(es.passo) || 2.5) : kg || '', reps: su ? lowReps(es.reps) : (fatte[0] && fatte[0].reps) || lowReps(es.reps) || '', su };
  }
  for (const [k] of TIPI[t].campi) base[k] = fatte[0] ? n0(fatte[0][k]) || '' : '';
  const ob = lowReps(es.reps);
  if (!fatte.length && ob) base[{ corpo: 'reps', tempo: 'sec', cardio: 'min' }[t]] = ob;
  return { ...base, su: false };
}
/* Storia di un esercizio: la serie migliore per allenamento. */
export function storia(nome) {
  const n = nome.toLowerCase(), out = [];
  for (const s of S.sessioni) for (const e of s.esercizi) if ((e.nome || '').toLowerCase() === n) {
    const t = tipoDi(e), ok = okSerie(e).filter((x) => forza(t, x) > 0);
    if (!ok.length) continue;
    const best = ok.reduce((a, b) => (forza(t, b) > forza(t, a) ? b : a));
    out.push({ data: s.data, v: Math.round(forza(t, best) * 10) / 10, s: best, t, tot: Math.round(volumeEs(e) * 10) / 10 });
  }
  return out;
}
export const eserciziFatti = () => [...new Set(S.sessioni.flatMap((s) => s.esercizi.filter((e) => okSerie(e).some((x) => forza(tipoDi(e), x) > 0)).map((e) => e.nome)))];
export const record = (nome) => Math.max(0, ...storia(nome).map((x) => x.v));

/* Differenze tra due serie, nell'ordine che conta per il tipo. */
function diff(t, a, b) {
  const d = {}; let dir = 0;
  for (const k of TIPI[t].ordine) { d[k] = Math.round((n0(a[k]) - n0(b[k])) * 100) / 100; if (!dir && d[k]) dir = Math.sign(d[k]); }
  return { d, dir };
}
/* Una serie appena fatta contro la stessa serie dell'ultima volta. */
export function confrontoSerie(es, i) {
  const t = tipoDi(es), s = es.serie[i], u = okSerie(ultima(es));
  const prima = Math.max(record(es.nome), ...es.serie.slice(0, i).filter((x) => x.ok).map((x) => forza(t, x)));
  const rec = record(es.nome) > 0 && forza(t, s) > prima + 0.01;
  if (!u.length) return { prima: true, dir: 0, rec, t };
  return { ...diff(t, s, u[Math.min(i, u.length - 1)]), rec, t, prima: false };
}
/* Un esercizio finito contro l'ultima volta: volume, serie migliore, passo (cardio), record. */
export function confrontoEsercizio(es) {
  const t = tipoDi(es), ok = okSerie(es), vol = volumeEs(es), uv = unitaVolume(es);
  const migliore = (l) => l.reduce((a, s) => (forza(t, s) > forza(t, a) ? s : a), l[0] || {});
  const best = migliore(ok), rec = record(es.nome) > 0 && forza(t, best) > record(es.nome) + 0.01;
  const passo = (l) => { const km = l.reduce((a, s) => a + n0(s.km), 0), mi = l.reduce((a, s) => a + n0(s.min), 0); return km && mi ? mi / km : null; };
  const u = ultima(es);
  if (!u) return { prima: true, vol, uv, best, rec, dir: 0, t, passo: passo(ok) };
  const pv = volumeEs(u), uo = okSerie(u), pb = migliore(uo), dv = pv ? Math.round(((vol - pv) / pv) * 100) : null;
  const pa = passo(ok), pp = passo(uo);
  return { prima: false, vol, uv, pv, dv, best, pb, ...diff(t, best, pb), rec, t, passo: pa, dpasso: pa && pp ? pa - pp : null };
}
