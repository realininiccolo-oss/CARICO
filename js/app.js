import { S, save, uid, today, addDays, foto, shrink, replaceAll } from './store.js';
import * as P from './plan.js';
import * as ritmo from './ritmo.js';
import * as N from './notifiche.js';

/* ---------- utilità ---------- */
const $ = (s) => document.querySelector(s);
function h(tag, a = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(a || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'text') el.textContent = v; else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else if (k === 'style') el.style.cssText = v; else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
}
const ICON = {
  play: '<path d="M7 4.5v15l12-7.5z"/>', skip: '<path d="M4 12a8 8 0 0 1 14-5.3M18 3v4h-4"/><path d="M12 20h.01"/>', swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>', cam: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  scale: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 9.5a4 4 0 0 1 6 0l-2 2.5"/>', bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>', trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
  busy: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5M12 16h.01"/>', trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7"/>',
  focus: '<path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4"/><circle cx="12" cy="12" r="2.5"/>', list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>', stop: '<rect x="7" y="7" width="10" height="10" rx="1.5"/>',
  equal: '<path d="M6 9.5h12M6 14.5h12"/>', flag: '<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>', dumb: '<path d="M3 9.5h2.5m13 0H21M3 14.5h2.5m13 0H21"/><rect x="5.5" y="6.5" width="3.5" height="11" rx="1"/><rect x="15" y="6.5" width="3.5" height="11" rx="1"/><path d="M9 12h6"/>',
  pause: '<path d="M9 6v12M15 6v12"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
};
const ic = (n) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.innerHTML = ICON[n]; return s; };
const GG = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'], MM = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const pd = (d) => { const [y, m, g] = d.split('-').map(Number); return new Date(y, m - 1, g); };
const fmtD = (d) => { const x = pd(d); return `${GG[x.getDay()]} ${x.getDate()} ${MM[x.getMonth()]}`; };
const rel = (d) => { const t = today(); return d === t ? 'Oggi' : d === addDays(t, 1) ? 'Domani' : fmtD(d); };
const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };
const kgf = (n) => (n == null || n === '' ? '–' : String(Math.round(n * 10) / 10).replace('.', ','));
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, '0')}`;
const LETT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let toastT;
function toast(msg, act) {
  const t = $('#toast'); t.replaceChildren(h('span', { text: msg }));
  if (act) t.append(h('button', { text: act.label, onclick: () => { t.classList.remove('on'); act.fn(); } }));
  t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), act ? 4500 : 2200);
}
$('#toast').addEventListener('click', (ev) => { if (ev.target.tagName !== 'BUTTON') $('#toast').classList.remove('on'); });
const snap = () => JSON.stringify(S);
const undo = (msg, s0) => toast(msg, { label: 'Annulla', fn: () => { replaceAll(JSON.parse(s0)); render(); } });

/* ---------- foglio dal basso ---------- */
function sheet(...kids) {
  const c = $('.sheet-card');
  c.replaceChildren(h('button', { class: 'sheet-x', 'aria-label': 'Chiudi', onclick: close }, ic('x')), ...kids.filter((k) => k != null && k !== false));
  c.style.transform = ''; $('#sheet').hidden = false; c.scrollTop = 0;
}
const close = () => { $('#sheet').hidden = true; if (document.activeElement) document.activeElement.blur(); };
$('.sheet-bg').addEventListener('click', close);
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !$('#sheet').hidden) close(); });
/* Trascina giù il foglio (dalla parte alta) per chiuderlo. */
(() => {
  const c = $('.sheet-card'); let y0 = null, dy = 0;
  c.addEventListener('touchstart', (ev) => { const r = c.getBoundingClientRect(), y = ev.touches[0].clientY; if (c.scrollTop <= 0 && y - r.top < 70) { y0 = y; dy = 0; c.style.transition = 'none'; } }, { passive: true });
  c.addEventListener('touchmove', (ev) => { if (y0 == null) return; dy = Math.max(0, ev.touches[0].clientY - y0); c.style.transform = `translateY(${dy}px)`; }, { passive: true });
  c.addEventListener('touchend', () => { if (y0 == null) return; y0 = null; c.style.transition = ''; if (dy > 90) close(); c.style.transform = ''; });
})();
const field = (label, input) => h('label', { class: 'f' }, h('span', { text: label }), input);

/* ---------- navigazione ---------- */
let TAB = location.hash.slice(1) || 'oggi', SUB = 'corpo';
if (!['oggi', 'scheda', 'progressi'].includes(TAB)) TAB = 'oggi';
document.querySelectorAll('#tabs button').forEach((b) => b.addEventListener('click', () => { TAB = b.dataset.tab; history.replaceState(null, '', '#' + TAB); render(); scrollTo(0, 0); }));

const inCorso = () => !!(S.live && !S.live.pausa);
/* Orologi della schermata: ogni componente registra il suo aggiornamento. */
let TICKS = [], tickInt = null;
const onTick = (fn) => { TICKS.push(fn); fn(); };
let wl = null;
async function sveglia() {
  try {
    if (inCorso() && !wl && 'wakeLock' in navigator && document.visibilityState === 'visible') { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); }
    if (!inCorso() && wl) { wl.release(); wl = null; }
  } catch (e) { /* lo schermo può spegnersi */ }
}
function render() {
  TICKS = []; clearInterval(tickInt);
  document.body.classList.toggle('guida', !!(inCorso() && S.live.vista === 'guida' && TAB === 'oggi'));
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === TAB));
  const v = $('#view');
  if (TAB === 'oggi') inCorso() ? renderLive(v) : renderOggi(v);
  else if (TAB === 'scheda') renderScheda(v);
  else renderProgressi(v);
  renderRest(); renderRiprendi();
  if (TICKS.length) tickInt = setInterval(() => TICKS.forEach((f) => f()), 250);
  sveglia();
}
function top(title, sub, right) {
  $('#top').replaceChildren(h('div', {}, h('h1', { text: title }), sub ? h('div', { class: 'sub', text: sub }) : null), right || h('button', { class: 'ib', 'aria-label': 'Impostazioni', onclick: openSettings }, ic('gear')));
}

/* =====================================================================
   OGGI
   ===================================================================== */
function renderOggi(v) {
  const t = today(), ag = P.agenda(8), G = S.scheda.giorni;
  top('Oggi', fmtD(t));
  const kids = [];
  const fatto = S.sessioni.filter((s) => s.data === t);
  const saltato = S.salti.includes(t);
  const ev = ritmo.palestraIl(t), occ = ritmo.impegniIl(t).length;

  const L = S.live;
  if (L && L.pausa) {
    const nS = L.esercizi.reduce((a, e) => a + e.serie.length, 0), fS = L.esercizi.reduce((a, e) => a + e.serie.filter((x) => x.ok).length, 0);
    kids.push(h('div', { class: 'hero' }, h('div', { class: 'k' }, ic('pause'), 'In pausa'), h('div', { class: 'big', text: L.nome }),
      h('div', { class: 'meta' }, h('span', { class: 'num', text: mmss((L.pausa - L.t0) / 1000) }), h('span', { class: 'num', text: `${fS}/${nS} serie` })),
      h('div', { class: 'row' }, h('button', { class: 'play', 'aria-label': 'Riprendi allenamento', onclick: riprendi }, ic('play')),
        h('span', { class: 'ghost-l', text: 'Riprendi' }), h('span', { style: 'flex:1' }),
        h('button', { class: 'ghost', onclick: finish }, ic('stop'), 'Termina'))));
  } else if (!G.length) {
    kids.push(h('div', { class: 'hero' }, h('div', { class: 'k' }, 'Oggi'), h('div', { class: 'big', text: 'Giornata libera' }),
      h('div', { class: 'meta' }, 'Crea un allenamento o registra un esercizio')));
  } else if (fatto.length) {
    const s = fatto[fatto.length - 1];
    kids.push(h('div', { class: 'hero' }, h('div', { class: 'k' }, ic('check'), 'Fatto'), h('div', { class: 'big', text: s.nome }),
      h('div', { class: 'meta' }, h('span', { class: 'num', text: `${Math.round((s.t1 - s.t0) / 60000)} min` }), h('span', { class: 'num', text: `${sessTxt(s)}` })),
      h('div', { class: 'row' }, h('button', { class: 'ghost', onclick: () => openSessione(s) }, 'Dettagli'), h('button', { class: 'ghost', onclick: addAllenamento }, ic('plus'), 'Un altro'))));
  } else {
    const next = ag[0], oggiSlot = next && next.data === t, g = next ? next.giorno : G[P.prossimoIdx()];
    kids.push(h('div', { class: 'hero' },
      h('div', { class: 'k' }, oggiSlot ? 'Oggi' : saltato ? 'Saltato oggi' : 'Riposo', oggiSlot && next.ora ? h('span', { class: 'chip' }, ic('clock'), next.ora) : null,
        oggiSlot && next.fonte === 'ritmo' ? h('span', { class: 'chip' }, ic('link'), 'Ritmo') : null,
        occ >= 4 ? h('span', { class: 'chip', title: 'Giornata piena in Ritmo' }, ic('busy'), occ) : null),
      h('div', { class: 'big', text: g.nome }),
      h('div', { class: 'meta' }, h('span', { text: nEs(g) }), !oggiSlot && next ? h('span', { text: rel(next.data) }) : null),
      h('div', { class: 'row' },
        h('button', { class: 'play', 'aria-label': 'Inizia', onclick: () => startLive(g) }, ic('play')),
        oggiSlot ? h('button', { class: 'ghost', onclick: () => skipToday() }, ic('skip'), 'Non oggi') : null,
        saltato ? h('button', { class: 'ghost', onclick: () => { P.annullaSalto(t); commit(); } }, 'Ripristina') : null,
        h('button', { class: 'ghost', 'aria-label': 'Cambia', onclick: () => pickDay() }, ic('swap')))));
  }

  if (!fatto.length && !L) kids.push(h('div', { class: 'tiles' },
    h('button', { class: 'tile', onclick: addAllenamento }, h('span', { class: 'ico' }, ic('dumb')), h('b', { text: 'Allenamento' }), h('small', { text: 'Avvia un pacchetto' })),
    h('button', { class: 'tile', onclick: addEsercizio }, h('span', { class: 'ico' }, ic('plus')), h('b', { text: 'Esercizio' }), h('small', { text: 'Registra un esercizio' }))));

  const resto = ag.filter((a) => !(a.data === t && !fatto.length));
  if (resto.length && G.length) {
    kids.push(h('div', { class: 'sec' }, 'In arrivo'));
    kids.push(h('div', { class: 'list' }, resto.slice(0, 6).map((a) => {
      const x = pd(a.data);
      return h('div', { class: 'li' }, h('div', { class: 'd' }, h('small', { text: GG[x.getDay()] }), h('b', { class: 'num', text: x.getDate() })),
        h('div', { class: 't' }, h('b', { text: a.giorno ? a.giorno.nome : '—' }), h('small', { text: [a.ora, a.occupato >= 4 ? 'giornata piena' : null].filter(Boolean).join(' · ') || ' ' })),
        h('div', { class: 'r' }, a.fonte === 'ritmo' ? ic('link') : null));
    })));
  }
  const ult = S.sessioni.filter((s) => s.data !== t).slice(-3).reverse();
  if (ult.length) {
    kids.push(h('div', { class: 'sec' }, 'Ultimi'));
    kids.push(h('div', { class: 'list' }, ult.map((s) => h('button', { class: 'li', onclick: () => openSessione(s) },
      h('div', { class: 'd' }, h('small', { text: GG[pd(s.data).getDay()] }), h('b', { class: 'num', text: pd(s.data).getDate() })),
      h('div', { class: 't' }, h('b', { text: s.nome }), h('small', { class: 'num', text: `${Math.round((s.t1 - s.t0) / 60000)} min · ${sessTxt(s)}` }))))));
  }
  v.replaceChildren(...kids);
}
function skipToday() {
  const s0 = snap(); P.salta(today()); commit();
  const n = P.agenda(1)[0]; undo(n ? `Spostato a ${rel(n.data).toLowerCase()}` : 'Saltato', s0);
}
function pickDay() {
  sheet(h('h2', { text: 'Quale allenamento?' }), h('div', { class: 'list' }, S.scheda.giorni.map((g, i) => h('button', { class: 'li', onclick: () => { S.prossimo = g.id; commit(); close(); } },
    h('div', { class: 'badge', text: LETT[i] }), h('div', { class: 't' }, h('b', { text: g.nome }), h('small', { text: nEs(g) })),
    P.prossimoIdx() === i ? h('span', { class: 'chip acc' }, ic('check')) : null)),
  h('button', { class: 'li', onclick: () => { close(); startLive(null); } }, h('div', { class: 'badge', html: '' }, ic('bolt')), h('div', { class: 't' }, h('b', { text: 'Libero' }), h('small', { text: 'senza scheda' })))));
}
const nEs = (g) => (g.esercizi.length === 1 ? '1 esercizio' : `${g.esercizi.length} esercizi`);
/* Riassunto di un allenamento: kg sollevati e, se c'è cardio, km o minuti. */
const sessTxt = (s) => {
  const v = volume(s), c = s.esercizi.filter((e) => P.tipoDi(e) === 'cardio').flatMap((e) => e.serie.filter((x) => x.ok));
  const km = c.reduce((a, x) => a + (num(x.km) || 0), 0), mi = c.reduce((a, x) => a + (num(x.min) || 0), 0);
  return [v ? `${Math.round(v).toLocaleString('it')} kg` : null, km ? `${kgf(km)} km` : mi ? `${kgf(mi)} min` : null].filter(Boolean).join(' · ') || nEs(s);
};
const volume = (s) => s.esercizi.reduce((a, e) => a + e.serie.filter((x) => x.ok).reduce((b, x) => b + (num(x.kg) || 0) * (num(x.reps) || 0), 0), 0);

/* =====================================================================
   ALLENAMENTO IN CORSO
   ===================================================================== */
/* Avvia: parte un breve conto alla rovescia ("Si parte") e la guida segue l'allenamento serie dopo serie. */
const PARTENZA = 10;
function startLive(g) {
  if (S.live && S.live.pausa) { toast('Prima riprendi o termina l’allenamento in pausa'); TAB = 'oggi'; render(); return; }
  unlockAudio();
  S.live = {
    id: uid('s'), data: today(), giorno: g ? g.id : null, nome: g ? g.nome : 'Libero', t0: Date.now(), vista: 'guida',
    riposo: g && g.esercizi.length ? { fine: Date.now() + PARTENZA * 1000, tot: PARTENZA, via: true } : null,
    esercizi: (g ? g.esercizi : []).map((e) => liveEx(e)),
  };
  TAB = 'oggi'; commit(); scrollTo(0, 0);
}
function liveEx(e) {
  const n = Math.max(1, Number(e.serie) || 3);
  const lib = (S.libreria || []).find((l) => norm(l.nome) === norm(e.nome));
  const tipo = P.tipoDi({ ...e, tipo: e.tipo || (lib && lib.tipo) }), { su, ...val } = P.proposta({ ...e, tipo });
  return { id: uid('x'), esId: e.id || null, nome: e.nome, tipo, ss: e.ss || null, reps: e.reps || '', rec: Number(e.rec ?? 90), passo: Number(e.passo || (lib && lib.passo)) || 2.5, note: e.note || '', su,
    serie: Array.from({ length: n }, () => ({ ...val, ok: null })) };
}
function renderLive(v) {
  if (S.live.vista === 'guida') return renderGuida(v);
  const L = S.live;
  $('#top').replaceChildren();
  const el = h('small', { class: 'num' });
  onTick(() => { el.textContent = mmss((Date.now() - L.t0) / 1000) + ` · ${L.esercizi.reduce((a, e) => a + e.serie.filter((s) => s.ok).length, 0)} serie`; });
  const kids = [h('div', { class: 'live-top' }, h('div', { class: 't' }, h('b', { text: L.nome }), el),
    h('button', { class: 'ib', 'aria-label': 'Guida', onclick: () => { L.vista = 'guida'; commit(); scrollTo(0, 0); } }, ic('focus')),
    h('button', { class: 'btn', onclick: esci }, ic('pause'), 'Esci'))];
  const act = activeEx();
  L.esercizi.forEach((e, ei) => kids.push(exCard(e, ei, e === act)));
  kids.push(h('button', { class: 'add', onclick: addEsercizio }, ic('plus'), 'Esercizio'));
  kids.push(h('div', { style: 'text-align:center;margin-top:18px' }, h('button', { class: 'btn danger', onclick: discard }, 'Annulla allenamento')));
  kids.push(h('div', { class: 'live-pad' }));
  v.replaceChildren(...kids);
}

/* L'esercizio aperto: quello toccato, altrimenti il primo non finito. */
const isDone = (e) => e.serie.length > 0 && e.serie.every((x) => x.ok);
/* Superserie: esercizi vicini con lo stesso `ss` si fanno a giro (A1 → B1 → recupero → A2 → B2…). */
function blocchi(list) {
  const out = [];
  list.forEach((e, k) => { if (k && e.ss && list[k - 1].ss === e.ss) out[out.length - 1].push(e); else out.push([e]); });
  return out;
}
const primaLibera = (e) => e.serie.findIndex((x) => !x.ok);
function passoIn(b) { // prossimo esercizio da fare dentro un blocco
  const giri = Math.max(...b.map((e) => e.serie.length));
  for (let r = 0; r < giri; r++) for (const e of b) if (e.serie[r] && !e.serie[r].ok) return e;
  return null;
}
const bloccoDi = (e) => blocchi(S.live.esercizi).find((b) => b.includes(e)) || [e];
function activeEx() {
  const L = S.live, f = L.esercizi.find((e) => e.id === L.focus);
  if (f && !isDone(f)) { const x = passoIn(bloccoDi(f)); if (x) return x; }
  for (const b of blocchi(L.esercizi)) { const x = passoIn(b); if (x) return x; }
  return null;
}
/* Scelta degli esercizi da mettere in superserie: li rende vicini e li lega. */
function sceltaSuperserie(list, base, after) {
  const sel = new Set(base && base.ss ? list.filter((e) => e.ss === base.ss) : base ? [base] : []);
  const box = h('div', { class: 'list' }), ok = h('button', { class: 'btn wide', style: 'margin-top:14px' });
  const info = (e) => exInfo(Array.isArray(e.serie) ? { ...e, serie: e.serie.length } : e);
  function draw() {
    box.replaceChildren(...list.map((e) => { const on = sel.has(e); return h('button', { class: 'li' + (on ? ' sel' : ''), onclick: () => { if (on) sel.delete(e); else sel.add(e); draw(); } },
      h('div', { class: 't' }, h('b', { text: e.nome }), h('small', { class: 'num', text: info(e) })), h('span', { class: 'tick' }, ic('check'))); }));
    ok.textContent = sel.size >= 2 ? `Crea superserie (${sel.size})` : 'Scegli almeno 2 esercizi';
    ok.classList.toggle('sec2', sel.size < 2);
  }
  ok.addEventListener('click', () => {
    if (sel.size < 2) return;
    const scelti = list.filter((e) => sel.has(e)), vecchi = new Set(scelti.map((e) => e.ss).filter(Boolean)), id = uid('ss');
    list.forEach((e) => { if (vecchi.has(e.ss) && !sel.has(e)) e.ss = null; });
    const at = list.indexOf(scelti[0]), resto = list.filter((e) => !sel.has(e));
    scelti.forEach((e) => { e.ss = id; });
    list.splice(0, list.length, ...resto.filter((e) => list.indexOf(e) < at), ...scelti, ...resto.filter((e) => list.indexOf(e) > at));
    list.forEach((e, k) => { if (e.ss && list[k - 1]?.ss !== e.ss && list[k + 1]?.ss !== e.ss) e.ss = null; });
    after(); toast('Superserie creata');
  });
  const unita = base && base.ss && list.filter((e) => e.ss === base.ss).length > 1;
  sheet(h('h2', { text: 'Superserie' }), h('div', { class: 'note', style: 'margin-top:-6px', text: 'Scegli gli esercizi da fare uno dietro l’altro, senza pausa in mezzo. Il recupero arriva a fine giro.' }),
    box, ok, unita ? h('div', { style: 'text-align:center;margin-top:8px' }, h('button', { class: 'btn danger', onclick: () => { const id = base.ss; list.forEach((e) => { if (e.ss === id) e.ss = null; }); after(); toast('Superserie sciolta'); } }, 'Sciogli superserie')) : null);
  draw();
}
const inSS = (list, k) => !!(list[k].ss && (list[k - 1]?.ss === list[k].ss || list[k + 1]?.ss === list[k].ss));
const ssBtn = (list, k, after) => (list.length > 1 ? h('button', { class: 'mini' + (inSS(list, k) ? ' on' : ''), onclick: (ev) => { ev.stopPropagation(); sceltaSuperserie(list, list[k], after); } }, ic('link'), inSS(list, k) ? 'Superserie ✓' : 'Superserie') : null);
/* Testo di una serie secondo il tipo: 62,5×10 · 15 rip · 45 s · 30′ · 5,2 km */
function setTxt(e, x) {
  const t = P.tipoDi(e), n = (k) => num(x[k]) ?? 0;
  if (t === 'pesi') return `${kgf(n('kg'))}×${n('reps')}`;
  if (t === 'corpo') return `${n('reps')} rip`;
  if (t === 'tempo') return n('sec') >= 60 ? mmss(n('sec')) : `${n('sec')} s`;
  return [`${kgf(n('min'))}′`, n('km') ? `${kgf(n('km'))} km` : null, n('liv') ? `liv ${n('liv')}` : null].filter(Boolean).join(' · ');
}
const UNI = { kg: 'kg', reps: 'rip', sec: 's', min: 'min', km: 'km', liv: 'liv' };
const fbTxt = (c) => {
  if (c.prima) return 'Prima volta';
  const k = P.TIPI[c.t].ordine.find((x) => c.d[x]);
  if (!k) return 'Come l’ultima volta';
  const d = c.d[k];
  return `${d > 0 ? '+' : '−'}${['kg', 'km', 'min'].includes(k) ? kgf(Math.abs(d)) : Math.abs(d)} ${UNI[k]}`;
};
const dirIc = (d) => ic(d > 0 ? 'up' : d < 0 ? 'down' : 'equal');
const dirCl = (d) => (d > 0 ? 'su' : d < 0 ? 'giu' : 'pari');
const passoTxt = (p) => `${Math.floor(p)}:${String(Math.round((p % 1) * 60)).padStart(2, '0')}/km`;

/* Selettore a frecce: ▲ ▼ (tieni premuto per correre), trascina il numero su e giù, toccalo per scrivere. */
function stepper({ value, step, unit, dec, onChange }) {
  let v = num(value) ?? 0;
  const grid = step < 0.25 ? step : dec ? 0.25 : 1;
  const fmt = (x) => (dec ? kgf(x) : String(Math.round(x)));
  const out = h('div', { class: 'sv num', text: fmt(v) });
  const setV = (x) => { v = Math.max(0, Math.round(x / grid) * grid); out.textContent = fmt(v); onChange(v); };
  const rep = (d) => {
    let t1, t2;
    const stop = () => { clearTimeout(t1); clearInterval(t2); };
    return { onpointerdown: (ev) => { ev.preventDefault(); setV(v + d * step); try { navigator.vibrate && navigator.vibrate(8); } catch (e) { /* niente */ } t1 = setTimeout(() => { t2 = setInterval(() => setV(v + d * step), 80); }, 380); },
      onpointerup: stop, onpointerleave: stop, onpointercancel: stop, oncontextmenu: (ev) => ev.preventDefault() };
  };
  let y0 = null, v0 = 0, mosso = false;
  out.addEventListener('pointerdown', (ev) => { y0 = ev.clientY; v0 = v; mosso = false; out.setPointerCapture(ev.pointerId); });
  out.addEventListener('pointermove', (ev) => { if (y0 == null) return; const k = Math.trunc((y0 - ev.clientY) / 16); if (k) mosso = true; if (mosso) setV(v0 + k * step); });
  out.addEventListener('pointerup', () => {
    if (y0 == null) return; y0 = null; if (mosso) return;
    const inp = h('input', { class: 'sv num', inputmode: dec ? 'decimal' : 'numeric', value: fmt(v) });
    const fine = () => { const x = num(inp.value); if (x != null) setV(x); inp.replaceWith(out); };
    inp.addEventListener('blur', fine); inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') inp.blur(); });
    out.replaceWith(inp); inp.focus(); inp.select();
  });
  return h('div', { class: 'stp' }, h('button', { class: 'ar', 'aria-label': 'più', ...rep(1) }, ic('up')), out, h('small', { text: unit }), h('button', { class: 'ar', 'aria-label': 'meno', ...rep(-1) }, ic('down')));
}
/* I selettori della serie, secondo il tipo di esercizio. */
function steppers(e, x, onCh = save) {
  const campi = P.TIPI[P.tipoDi(e)].campi;
  return h('div', { class: 'steps', style: `grid-template-columns:repeat(${campi.length},1fr)` }, campi.map(([k, u, step, dec]) =>
    stepper({ value: x[k], step: k === 'kg' ? Number(e.passo) || step : step, unit: u, dec, onChange: (v) => { x[k] = v; onCh(); } })));
}
/* Cronometro per cardio e esercizi a tempo: Avvia / Stop scrive i minuti o i secondi della serie. */
function cronometro(e, i) {
  const L = S.live, x = e.serie[i], t = P.tipoDi(e), C = L.cron && L.cron.ex === e.id && L.cron.i === i ? L.cron : null;
  const tm = h('b', { class: 'num' });
  if (C) onTick(() => { tm.textContent = mmss((Date.now() - C.t0) / 1000); });
  else tm.textContent = t === 'tempo' ? mmss(num(x.sec) ?? 0) : mmss((num(x.min) ?? 0) * 60);
  return h('div', { class: 'cron' + (C ? ' on' : '') }, ic('clock'), tm, h('button', { class: 'btn' + (C ? '' : ' sec2'), onclick: () => {
    unlockAudio();
    if (!C) { L.cron = { ex: e.id, i, t0: Date.now() }; L.riposo = null; N.annulla(); commit(); return; }
    const sec = (Date.now() - C.t0) / 1000;
    if (t === 'tempo') x.sec = Math.round(sec); else x.min = Math.round((sec / 60) * 10) / 10;
    L.cron = null; commit();
  } }, C ? ic('stop') : ic('play'), C ? 'Stop' : 'Avvia'));
}
/* La serie da fare: frecce, cronometro se serve, e Fatta. */
function editorSerie(e, cur) {
  const t = P.tipoDi(e), x = e.serie[cur];
  return h('div', { class: 'cur' },
    h('div', { class: 'cur-l' }, `Serie ${cur + 1} di ${e.serie.length}`, e.su && cur === 0 ? h('span', { class: 'chip acc' }, ic('up'), `+${kgf(Number(e.passo) || 2.5)} kg`) : null),
    t === 'cardio' || t === 'tempo' ? cronometro(e, cur) : null,
    steppers(e, x),
    h('button', { class: 'btn wide fatta', onclick: () => serieFatta(e, cur) }, ic('check'), 'Fatta'));
}
const nSerie = (e) => h('div', { class: 'ns' },
  h('button', { 'aria-label': 'Una serie in meno', onclick: () => { const k = e.serie.map((x) => !x.ok).lastIndexOf(true); if (k >= 0 && e.serie.length > 1) { e.serie.splice(k, 1); commit(); } } }, ic('minus')),
  h('span', { class: 'num', text: `${e.serie.length} serie` }),
  h('button', { 'aria-label': 'Una serie in più', onclick: () => { const l = e.serie[e.serie.length - 1] || {}; const { ok, ...val } = l; e.serie.push({ ...val, ok: null }); commit(); } }, ic('plus')));
const obiettivo = (e) => { const t = P.tipoDi(e); if (!e.reps) return null; if (t === 'tempo' && P.lowReps(e.reps) >= 60) return `obiettivo ${mmss(P.lowReps(e.reps))}`; return `obiettivo ${e.reps}${{ tempo: ' s', cardio: ' min' }[t] || ''}`; };

const chip = (e, i) => {
  const x = e.serie[i], c = P.confrontoSerie(e, i);
  return h('button', { class: 'sc ' + dirCl(c.dir), onclick: () => editSet(e, i) }, h('span', { class: 'i num', text: i + 1 }), h('b', { class: 'num', text: setTxt(e, x) }), c.prima ? null : dirIc(c.dir), c.rec ? ic('trophy') : null);
};
/* Le righe di confronto di un esercizio finito. */
function riepilogoEs(e) {
  const c = P.confrontoEsercizio(e), out = [], t = c.t, nOk = e.serie.filter((x) => x.ok).length;
  const nome = { pesi: 'Volume', corpo: 'Ripetizioni', tempo: 'Tempo totale', cardio: c.uv === 'km' ? 'Distanza' : 'Durata' }[t];
  const tot = `${nome} ${['kg', 'km', 'min'].includes(c.uv) ? kgf(c.vol) : Math.round(c.vol)}${c.uv === 'kg' ? '' : ''} ${c.uv}`.replace(/(\d)\.(\d)/, '$1,$2');
  if (c.prima) out.push(h('div', { class: 'fbl' }, ic('flag'), h('span', { class: 'num', text: `Prima volta · ${tot}` })));
  else {
    out.push(h('div', { class: 'fbl ' + dirCl(Math.sign(c.dv || 0)) }, dirIc(Math.sign(c.dv || 0)), h('span', { class: 'num', text: tot }), h('b', { class: 'num', text: c.dv == null ? '' : `${c.dv > 0 ? '+' : ''}${c.dv}%` })));
    if (nOk > 1 || t === 'pesi') out.push(h('div', { class: 'fbl ' + dirCl(c.dir) }, dirIc(c.dir), h('span', { class: 'num', text: `Migliore ${setTxt(e, c.best)}` }), h('b', { class: 'num', text: fbTxt(c) })));
  }
  if (t === 'cardio' && c.passo) {
    const d = c.dpasso == null ? 0 : -Math.sign(Math.round(c.dpasso * 60)); // passo più basso = meglio
    out.push(h('div', { class: 'fbl ' + dirCl(d) }, c.dpasso == null ? ic('clock') : dirIc(d), h('span', { class: 'num', text: `Passo ${passoTxt(c.passo)}` }),
      c.dpasso == null ? null : h('b', { class: 'num', text: Math.round(Math.abs(c.dpasso) * 60) ? `${c.dpasso < 0 ? '−' : '+'}${Math.round(Math.abs(c.dpasso) * 60)} s/km` : 'uguale' })));
  }
  if (c.rec) out.push(h('div', { class: 'fbl rec' }, ic('trophy'), h('span', { text: 'Nuovo record' })));
  return out;
}
function exCard(e, ei, active) {
  const ssb = ssBtn(S.live.esercizi, ei, () => { close(); commit(); }), ssc = inSS(S.live.esercizi, ei) ? ' ss' : '';
  const done = isDone(e), cur = e.serie.findIndex((x) => !x.ok), fatte = e.serie.filter((x) => x.ok).length;
  const u = P.ultima(e), last = u ? u.serie.filter((x) => x.ok).map((x) => setTxt(e, x)).join(' · ') : null;
  const chips = e.serie.map((x, i) => (x.ok ? chip(e, i) : null)).filter(Boolean);
  const head = h('div', { class: 'ex-h' },
    h('div', { class: 't' }, h('b', { text: e.nome }), h('small', { class: 'num', text: [obiettivo(e), e.rec ? `${e.rec}s` : null].filter(Boolean).join(' · ') })),
    active ? nSerie(e) : h('span', { class: 'prog num' + (done ? ' ok' : ''), text: done ? '' : `${fatte}/${e.serie.length}` }, done ? ic('check') : null));
  const togli = h('button', { class: 'mini', 'aria-label': 'Togli', onclick: () => { const s0 = snap(); S.live.esercizi.splice(ei, 1); commit(); undo('Esercizio tolto', s0); } }, ic('trash'));

  if (!active && !done) return h('div', { class: 'ex mini-ex' + ssc, onclick: () => { S.live.focus = e.id; commit(); } }, head, chips.length ? h('div', { class: 'chips2' }, chips) : null, ssb ? h('div', { class: 'ex-f' }, ssb) : null);
  if (done) return h('div', { class: 'ex done' + ssc, id: 'ex-' + e.id }, head, h('div', { class: 'chips2' }, chips), h('div', { class: 'fb' }, riepilogoEs(e)),
    h('div', { class: 'ex-f' }, h('button', { class: 'mini', onclick: () => { const { ok, ...val } = e.serie[e.serie.length - 1]; e.serie.push({ ...val, ok: null }); S.live.focus = e.id; commit(); } }, ic('plus'), 'Serie'), ssb, h('span', { style: 'flex:1' }), togli));

  const fx = S.live.fb && S.live.esercizi.find((y) => y.id === S.live.fb.ex), fb = fx && bloccoDi(fx).includes(e) ? P.confrontoSerie(fx, S.live.fb.i) : null;
  return h('div', { class: 'ex active' + ssc, id: 'ex-' + e.id }, head,
    last ? h('div', { class: 'last num' }, h('span', { text: 'Ultima' }), last) : null,
    chips.length ? h('div', { class: 'chips2' }, chips) : null,
    fb ? fbLine(fb, fx !== e ? fx.nome : null) : null,
    editorSerie(e, cur),
    h('div', { class: 'ex-f' }, ssb, h('span', { style: 'flex:1' }),
      ei > 0 ? h('button', { class: 'mini', 'aria-label': 'Su', onclick: () => { const a = S.live.esercizi; [a[ei - 1], a[ei]] = [a[ei], a[ei - 1]]; commit(); } }, ic('up')) : null, togli));
}
const fbLine = (fb, nome) => h('div', { class: 'fbl flash ' + dirCl(fb.dir) }, fb.prima ? ic('flag') : dirIc(fb.dir), h('span', { text: `${nome ? nome + ' · ' : ''}Serie ${S.live.fb.i + 1}` }), h('b', { text: fbTxt(fb) + (fb.rec ? ' · record' : '') }));

function serieFatta(e, i) {
  unlockAudio();
  const L = S.live, x = e.serie[i];
  if (L.cron && L.cron.ex === e.id && L.cron.i === i) { // fermo il cronometro se sta andando
    const sec = (Date.now() - L.cron.t0) / 1000; if (P.tipoDi(e) === 'tempo') x.sec = Math.round(sec); else x.min = Math.round((sec / 60) * 10) / 10; L.cron = null;
  }
  for (const [k] of P.TIPI[P.tipoDi(e)].campi) x[k] = num(x[k]) ?? 0;
  x.ok = Date.now();
  const { ok, ...val } = x;
  for (const y of e.serie.slice(i + 1)) if (!y.ok) Object.assign(y, val); // la serie dopo parte da questa
  L.fb = { ex: e.id, i };
  const finito = isDone(e), dopo = passoIn(bloccoDi(e));
  L.focus = dopo ? dopo.id : null;
  const next = activeEx(), rec = Number(e.rec) || 0;
  const subito = next && dopo === next && next !== e && primaLibera(next) === i; // superserie: niente pausa nel giro
  L.riposo = rec > 0 && next && !subito ? { fine: Date.now() + rec * 1000, tot: rec } : null;
  if (L.riposo) N.programma(rec, 'Recupero finito', `${next.nome} · serie ${primaLibera(next) + 1}`); else N.annulla();
  try { navigator.vibrate && navigator.vibrate(15); } catch (er) { /* niente */ }
  commit();
  if (L.vista === 'guida') { scrollTo(0, 0); return; }
  const a = finito ? activeEx() : e, el = document.getElementById('ex-' + (finito ? e.id : a && a.id));
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function editSet(e, i) {
  const x = e.serie[i], v = { ...x };
  sheet(h('h2', { text: `${e.nome} · serie ${i + 1}` }),
    h('div', { style: 'margin:6px 0 18px' }, steppers(e, v, () => {})),
    h('div', { class: 'acts' },
      h('button', { class: 'btn sec2', onclick: () => { x.ok = null; if (S.live.fb && S.live.fb.ex === e.id) S.live.fb = null; S.live.focus = e.id; commit(); close(); } }, 'Da rifare'),
      h('button', { class: 'btn', onclick: () => { const { ok, ...val } = v; Object.assign(x, val); commit(); close(); } }, 'Salva')));
}

/* =====================================================================
   GUIDA: una schermata alla volta — serie da fare, recupero, prossima
   ===================================================================== */
function renderGuida(v) {
  const L = S.live, e = activeEx(), R = L.riposo;
  $('#top').replaceChildren();
  const tot = L.esercizi.reduce((a, x) => a + x.serie.length, 0), fatte = L.esercizi.reduce((a, x) => a + x.serie.filter((y) => y.ok).length, 0);
  const el = h('small', { class: 'num' });
  onTick(() => { el.textContent = `${mmss((Date.now() - L.t0) / 1000)} · ${fatte}/${tot} serie`; });
  const head = h('div', { class: 'live-top' }, h('div', { class: 't' }, h('b', { text: L.nome }), el),
    h('button', { class: 'ib', 'aria-label': 'Elenco', onclick: () => { L.vista = 'lista'; commit(); } }, ic('list')),
    h('button', { class: 'btn', onclick: esci }, ic('pause'), 'Esci'));
  const bar = h('div', { class: 'gbar' }, h('i', { style: `width:${tot ? (fatte / tot) * 100 : 0}%` }));
  let body;
  if (R && R.fine > Date.now()) body = guidaRiposo(e, R);
  else if (e) body = guidaLavoro(e);
  else body = h('div', { class: 'gdone' }, h('span', { class: 'big-ic' }, ic(L.esercizi.length ? 'trophy' : 'dumb')),
    h('b', { text: L.esercizi.length ? 'Tutto fatto' : 'Aggiungi il primo esercizio' }),
    h('div', { class: 'acts' }, h('button', { class: 'btn sec2', onclick: addEsercizio }, ic('plus'), 'Esercizio'), L.esercizi.length ? h('button', { class: 'btn', onclick: finish }, 'Fine') : null));
  v.replaceChildren(head, bar, body);
}
function guidaLavoro(e) {
  const L = S.live, cur = e.serie.findIndex((x) => !x.ok), u = P.ultima(e);
  const prec = u ? u.serie.filter((x) => x.ok) : [], pu = prec.length ? prec[Math.min(cur, prec.length - 1)] : null;
  const fx = L.fb && L.esercizi.find((y) => y.id === L.fb.ex), fb = fx ? P.confrontoSerie(fx, L.fb.i) : null;
  const chips = e.serie.map((x, i) => (x.ok ? chip(e, i) : null)).filter(Boolean);
  const idx = L.esercizi.indexOf(e), blk = bloccoDi(e);
  return h('div', { class: 'glav' },
    h('div', { class: 'gpos num' }, `Esercizio ${idx + 1} di ${L.esercizi.length}`, blk.length > 1 ? h('span', { class: 'chip acc' }, ic('link'), `Superserie ${blk.indexOf(e) + 1}/${blk.length}`) : null),
    h('div', { class: 'gname', text: e.nome }),
    h('div', { class: 'gsub' }, h('span', { class: 'num', text: [obiettivo(e), pu ? `l’ultima volta ${setTxt(e, pu)}` : 'prima volta'].filter(Boolean).join(' · ') }), nSerie(e)),
    chips.length ? h('div', { class: 'chips2' }, chips) : null,
    fb ? fbLine(fb, fx !== e ? fx.nome : null) : null,
    editorSerie(e, cur),
    h('div', { class: 'glinks' },
      h('button', { class: 'mini', onclick: () => { const nx = L.esercizi.find((y) => !blk.includes(y) && !isDone(y) && L.esercizi.indexOf(y) > idx) || L.esercizi.find((y) => !blk.includes(y) && !isDone(y)); if (nx) { L.focus = nx.id; commit(); } else toast('È l’ultimo esercizio'); } }, ic('skip'), 'Salta'),
      h('button', { class: 'mini', onclick: elencoEsercizi }, ic('list'), 'Esercizi'),
      L.esercizi.length > 1 ? h('button', { class: 'mini' + (blk.length > 1 ? ' on' : ''), onclick: () => sceltaSuperserie(L.esercizi, e, () => { close(); commit(); }) }, ic('link'), 'Superserie') : null,
      h('button', { class: 'mini', onclick: addEsercizio }, ic('plus'), 'Aggiungi')));
}
function guidaRiposo(e, R) {
  const L = S.live, rr = 110, C = 2 * Math.PI * rr;
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 260 260'); svg.setAttribute('class', 'ring');
  svg.innerHTML = `<circle cx="130" cy="130" r="${rr}" stroke="var(--soft)" stroke-width="14" fill="none"/><circle class="arc" cx="130" cy="130" r="${rr}" stroke="var(--acc)" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="${C}" transform="rotate(-90 130 130)"/>`;
  const arc = svg.querySelector('.arc'), tm = h('div', { class: 'rt num' });
  let fatto = false;
  onTick(() => {
    const left = (R.fine - Date.now()) / 1000;
    tm.textContent = mmss(Math.max(0, Math.ceil(left)));
    arc.setAttribute('stroke-dashoffset', C * (1 - Math.max(0, Math.min(1, left / R.tot))));
    if (left <= 0 && !fatto) { fatto = true; beep(); L.riposo = null; save(); render(); }
  });
  const fb = !R.via && L.fb ? (() => { const x = L.esercizi.find((y) => y.id === L.fb.ex); return x ? P.confrontoSerie(x, L.fb.i) : null; })() : null;
  const dopo = (() => { // cosa viene dopo
    if (!e) return null;
    const cur = e.serie.findIndex((x) => !x.ok);
    return h('div', { class: 'next' }, h('small', { text: R.via ? 'Si comincia con' : 'Prossima' }), h('b', { text: e.nome }),
      h('span', { class: 'num', text: `Serie ${cur + 1} di ${e.serie.length} · ${setTxt(e, e.serie[cur])}` }));
  })();
  const avvisa = () => { if (!R.via && e) N.programma((R.fine - Date.now()) / 1000, 'Recupero finito', `${e.nome} · serie ${primaLibera(e) + 1}`); };
  const sposta = (d) => { R.fine = Math.max(Date.now() + 1000, R.fine + d * 1000); R.tot = Math.max(R.tot + d, 1); save(); avvisa(); };
  return h('div', { class: 'grip' },
    h('div', { class: 'glab', text: R.via ? 'Si parte' : 'Recupero' }),
    h('div', { class: 'ringbox' }, svg, tm),
    h('div', { class: 'rbtn' },
      h('button', { class: 'btn sec2', onclick: () => sposta(-15) }, '−15'),
      h('button', { class: 'btn', onclick: () => { L.riposo = null; N.annulla(); commit(); } }, R.via ? 'Inizia ora' : 'Salta'),
      h('button', { class: 'btn sec2', onclick: () => sposta(15) }, '+15')),
    fb ? h('div', { style: 'margin-top:16px' }, fbLine(fb, L.esercizi.find((y) => y.id === L.fb.ex).nome)) : null,
    dopo);
}
function elencoEsercizi() {
  const L = S.live;
  sheet(h('h2', { text: 'Esercizi' }), h('div', { class: 'list' }, L.esercizi.map((e) => h('button', { class: 'li', onclick: () => { L.focus = e.id; if (isDone(e)) { const { ok, ...val } = e.serie[e.serie.length - 1]; e.serie.push({ ...val, ok: null }); } commit(); close(); } },
    h('div', { class: 't' }, h('b', { text: e.nome }), h('small', { class: 'num', text: e.serie.filter((x) => x.ok).map((x) => setTxt(e, x)).join(' · ') || exInfo({ ...e, serie: e.serie.length }) })),
    h('span', { class: 'prog num' + (isDone(e) ? ' ok' : ''), text: isDone(e) ? '' : `${e.serie.filter((x) => x.ok).length}/${e.serie.length}` }, isDone(e) ? ic('check') : null)))),
  h('button', { class: 'add', onclick: addEsercizio }, ic('plus'), 'Aggiungi esercizio'));
}

/* ---------- libreria esercizi ---------- */
const norm = (x) => (x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
function syncLib() {
  if (!Array.isArray(S.libreria)) S.libreria = [];
  const has = new Set(S.libreria.map((e) => norm(e.nome)));
  const add = (e) => { if (e && e.nome && !has.has(norm(e.nome))) { has.add(norm(e.nome)); S.libreria.push({ id: uid('l'), nome: e.nome, tipo: P.tipoDi(e), serie: e.serie || 3, reps: e.reps || '', rec: e.rec ?? 90, passo: e.passo, note: e.note || '' }); } };
  S.scheda.giorni.forEach((g) => g.esercizi.forEach(add));
  S.sessioni.forEach((x) => x.esercizi.forEach((e) => add({ nome: e.nome, tipo: e.tipo, serie: e.serie.length, reps: e.reps, rec: e.rec })));
  const PRESET = [ // esercizi già pronti: [versione, nome, tipo, serie, obiettivo, recupero]
    [1, 'Corsa', 'cardio', 1, '30', 0], [1, 'Cyclette', 'cardio', 1, '30', 0], [1, 'Tapis roulant', 'cardio', 1, '20', 0], [1, 'Ellittica', 'cardio', 1, '20', 0], [1, 'Vogatore', 'cardio', 1, '15', 0],
    [1, 'Plank', 'tempo', 3, '45', 60], [1, 'Piegamenti', 'corpo', 3, '15', 60], [2, 'Allungamento', 'tempo', 1, '300', 0]];
  PRESET.filter(([v]) => v > (S.preset || 0)).forEach(([, nome, tipo, serie, reps, rec]) => add({ nome, tipo, serie, reps, rec }));
  S.preset = 2;
}
function libUpsert(x) {
  syncLib();
  const e = S.libreria.find((l) => norm(l.nome) === norm(x.nome));
  if (e) Object.assign(e, { nome: x.nome, tipo: x.tipo || e.tipo, serie: x.serie, reps: x.reps, rec: x.rec, passo: x.passo || e.passo }); else S.libreria.push({ id: uid('l'), note: '', ...x });
  return e || S.libreria[S.libreria.length - 1];
}
const lastUsed = (nome) => { for (let k = S.sessioni.length - 1; k >= 0; k--) if (S.sessioni[k].esercizi.some((e) => norm(e.nome) === norm(nome))) return S.sessioni[k].data; return ''; };
const searchBox = (q) => h('div', { class: 'searchbox' }, ic('search'), q);
const exInfo = (e) => {
  const t = P.tipoDi(e), r = e.reps || '–';
  if (t === 'cardio') return `Cardio · ${r} min`;
  if (t === 'tempo') return `${e.serie} × ${P.lowReps(r) >= 60 ? mmss(P.lowReps(r)) : r + ' s'}${e.rec ? ` · ${e.rec}s` : ''}`;
  return `${e.serie} × ${r}${t === 'corpo' ? ' · corpo libero' : ''} · ${e.rec}s`;
};
/* Scelta del tipo in un modulo: Pesi, Corpo libero, A tempo, Cardio. */
function tipoSel(t0, onCh) {
  let t = t0;
  const box = h('div', { class: 'seg tipi' });
  const draw = () => box.replaceChildren(...Object.entries(P.TIPI).map(([k, d]) => h('button', { type: 'button', class: k === t ? 'on' : '', onclick: () => { t = k; draw(); onCh(k); } }, d.n)));
  draw(); return box;
}

/* Elenco degli esercizi con ricerca: tocca per scegliere, oppure creane uno nuovo. */
function pickEsercizio({ titolo, multi = false, gia = [], onPick }) {
  syncLib();
  const scelti = new Set(gia.map(norm));
  const q = h('input', { type: 'search', placeholder: 'Cerca o crea', autocomplete: 'off', enterkeyhint: 'done' });
  const list = h('div', { class: 'list' });
  const ok = multi ? h('button', { class: 'btn wide', style: 'margin-top:14px', onclick: () => onPick(S.libreria.filter((e) => scelti.has(norm(e.nome)))) }) : null;
  const riapri = () => pickEsercizio({ titolo, multi, gia: [...scelti], onPick });
  const crea = () => nuovoEsercizio(q.value.trim(), (e) => { if (multi) { scelti.add(norm(e.nome)); riapri(); } else onPick(e); });
  function draw() {
    const k = norm(q.value), exact = S.libreria.some((e) => norm(e.nome) === k);
    const L = S.libreria.filter((e) => !k || norm(e.nome).includes(k))
      .sort((a, b) => lastUsed(b.nome).localeCompare(lastUsed(a.nome)) || a.nome.localeCompare(b.nome, 'it'));
    list.replaceChildren(...[
      !exact ? h('button', { class: 'li new', onclick: crea }, h('span', { class: 'badge' }, ic('plus')), h('div', { class: 't' }, h('b', { text: k ? `Crea «${q.value.trim()}»` : 'Crea nuovo esercizio' }))) : null,
      ...L.map((e) => {
        const on = scelti.has(norm(e.nome));
        return h('button', { class: 'li' + (on ? ' sel' : ''), onclick: () => { if (!multi) return onPick(e); if (on) scelti.delete(norm(e.nome)); else scelti.add(norm(e.nome)); draw(); } },
          h('div', { class: 't' }, h('b', { text: e.nome }), h('small', { class: 'num', text: exInfo(e) })), multi ? h('span', { class: 'tick' }, ic('check')) : h('span', { class: 'r' }, ic('plus')));
      }),
    ].filter(Boolean));
    if (ok) ok.textContent = scelti.size ? `Aggiungi ${scelti.size}` : 'Fatto';
  }
  q.addEventListener('input', draw);
  sheet(h('h2', { text: titolo }), searchBox(q), list, ok);
  draw();
}
function nuovoEsercizio(nome, cb) {
  const i = { nome: h('input', { value: nome || '', placeholder: 'Panca piana' }), serie: h('input', { inputmode: 'numeric', value: 3 }),
    reps: h('input', { value: '8-10' }), rec: h('input', { inputmode: 'numeric', value: 90 }), passo: h('input', { inputmode: 'decimal', value: '2,5' }) };
  let tipo = P.tipoDi({ nome });
  const lab = h('span', {}), fp = field('Passo kg (frecce)', i.passo);
  const adatta = (t) => { lab.textContent = P.TIPI[t].obiettivo; fp.hidden = t !== 'pesi'; i.serie.value = P.TIPI[t].serie; i.reps.value = { pesi: '8-10', corpo: '12', tempo: '45', cardio: '30' }[t]; i.rec.value = t === 'cardio' ? 0 : 90; };
  sheet(h('h2', { text: 'Nuovo esercizio' }), field('Nome', i.nome), tipoSel(tipo, (t) => { tipo = t; adatta(t); }),
    h('div', { class: 'fg3' }, field('Serie', i.serie), h('label', { class: 'f' }, lab, i.reps), field('Recupero (s)', i.rec)), fp,
    h('div', { class: 'acts' }, h('button', { class: 'btn', onclick: () => {
      const x = { nome: i.nome.value.trim(), tipo, serie: Math.max(1, num(i.serie.value) || 3), reps: i.reps.value.trim(), rec: Math.max(0, num(i.rec.value) ?? 90), passo: num(i.passo.value) || 2.5 };
      if (!x.nome) return;
      const e = libUpsert(x); save(); cb(e);
    } }, 'Salva')));
  adatta(tipo);
  if (!nome) setTimeout(() => i.nome.focus(), 250);
}
/* Aggiungi esercizio: entra nell'allenamento in corso, o ne apre uno libero di oggi. */
function addEsercizio() {
  pickEsercizio({ titolo: 'Esercizio', onPick: (e) => {
    close();
    if (S.live && S.live.pausa) { toast('Prima riprendi o termina l’allenamento in pausa'); return; }
    if (!S.live) S.live = { id: uid('s'), data: today(), giorno: null, nome: 'Libero', t0: Date.now(), riposo: null, vista: 'guida', esercizi: [] };
    const x = liveEx(e); S.live.esercizi.push(x); S.live.focus = x.id; TAB = 'oggi'; commit();
    setTimeout(() => scrollTo(0, document.body.scrollHeight), 60);
  } });
}
/* Aggiungi allenamento: i pacchetti creati, con ricerca, o uno nuovo. */
function addAllenamento() {
  const q = h('input', { type: 'search', placeholder: 'Cerca allenamento o esercizio', autocomplete: 'off', enterkeyhint: 'done' });
  const list = h('div', { class: 'list' });
  function draw() {
    const k = norm(q.value), G = S.scheda.giorni.filter((g) => !k || norm(g.nome).includes(k) || g.esercizi.some((e) => norm(e.nome).includes(k)));
    list.replaceChildren(
      h('button', { class: 'li new', onclick: () => builder({ nome: k && !G.length ? q.value.trim() : '', esercizi: [] }) }, h('span', { class: 'badge' }, ic('plus')),
        h('div', { class: 't' }, h('b', { text: 'Crea nuovo allenamento' }), h('small', { text: 'scegli gli esercizi' }))),
      ...G.map((g) => h('button', { class: 'li', onclick: () => { close(); startLive(g); } }, h('span', { class: 'badge', text: LETT[S.scheda.giorni.indexOf(g)] }),
        h('div', { class: 't' }, h('b', { text: g.nome }), h('small', { text: g.esercizi.map((e) => e.nome).join(' · ') || 'vuoto' })), h('span', { class: 'r' }, ic('play')))));
  }
  q.addEventListener('input', draw);
  sheet(h('h2', { text: 'Allenamento' }), searchBox(q), list);
  draw();
}
function builder(b) {
  const nome = h('input', { value: b.nome, placeholder: 'Push, Gambe, Full body…', oninput: (e) => { b.nome = e.target.value; } });
  const salva = () => {
    const g = { id: uid('g'), nome: b.nome.trim() || `Allenamento ${LETT[S.scheda.giorni.length]}`, esercizi: b.esercizi.map((e) => ({ id: uid('e'), ss: e.ss || null, nome: e.nome, tipo: P.tipoDi(e), serie: e.serie, reps: e.reps, rec: e.rec, passo: e.passo, note: e.note || '' })) };
    S.scheda.giorni.push(g); return g;
  };
  const vuoto = () => { if (b.esercizi.length) return false; toast('Aggiungi almeno un esercizio'); return true; };
  sheet(h('h2', { text: 'Nuovo allenamento' }), field('Nome', nome),
    b.esercizi.length ? h('div', { class: 'list' }, b.esercizi.map((e, i) => h('div', { class: 'li' + (inSS(b.esercizi, i) ? ' ss' : '') }, h('div', { class: 't' }, h('b', { text: e.nome }), h('small', { class: 'num', text: exInfo(e) })),
      h('button', { class: 'mini', 'aria-label': 'Togli', onclick: () => { b.esercizi.splice(i, 1); builder(b); } }, ic('x'))))) : null,
    b.esercizi.length > 1 ? h('button', { class: 'add', style: 'color:var(--amb)', onclick: () => sceltaSuperserie(b.esercizi, null, () => builder(b)) }, ic('link'), 'Superserie') : null,
    h('button', { class: 'add', onclick: () => pickEsercizio({ titolo: 'Esercizi', multi: true, gia: b.esercizi.map((e) => e.nome), onPick: (arr) => {
      const prima = b.esercizi.filter((e) => arr.some((a) => norm(a.nome) === norm(e.nome)));
      b.esercizi = [...prima, ...arr.filter((a) => !prima.some((e) => norm(e.nome) === norm(a.nome))).map((a) => ({ ...a, ss: null }))]; builder(b);
    } }) }, ic('plus'), 'Esercizi'),
    h('div', { class: 'acts' },
      h('button', { class: 'btn sec2', onclick: () => { if (vuoto()) return; salva(); commit(); close(); toast('Allenamento salvato'); } }, 'Salva'),
      h('button', { class: 'btn', onclick: () => { if (vuoto()) return; const g = salva(); close(); startLive(g); } }, ic('play'), 'Inizia')));
}
function finish() {
  const L = S.live, fatte = L.esercizi.reduce((a, e) => a + e.serie.filter((x) => x.ok).length, 0);
  if (!fatte) { if (confirm('Nessuna serie segnata. Chiudo senza salvare?')) { S.live = null; commit(); } return; }
  const s = { ...L, t1: L.pausa || Date.now(), esercizi: L.esercizi.map((e) => ({ ...e, serie: e.serie.filter((x) => x.ok) })).filter((e) => e.serie.length) };
  delete s.riposo; delete s.fb; delete s.focus; delete s.vista; delete s.cron; delete s.pausa;
  if (!s.giorno) { const n = s.esercizi.map((e) => e.nome); s.nome = n.slice(0, 2).join(' · ') + (n.length > 2 ? ` +${n.length - 2}` : ''); }
  // confronti calcolati prima di salvare, contro gli allenamenti precedenti
  const prec = s.giorno ? [...S.sessioni].reverse().find((x) => x.giorno === s.giorno) : null;
  const blocchi = s.esercizi.map((e) => h('div', { class: 'ex done' }, h('div', { class: 'ex-h' }, h('div', { class: 't' }, h('b', { text: e.nome }))),
    h('div', { class: 'chips2' }, e.serie.map((x, i) => chip(e, i))), h('div', { class: 'fb' }, riepilogoEs(e))));
  const rec = s.esercizi.filter((e) => P.confrontoEsercizio(e).rec).length;
  const vol = volume(s), dv = prec && volume(prec) ? Math.round(((vol - volume(prec)) / volume(prec)) * 100) : null;
  S.sessioni.push(s); S.live = null; S.prossimo = null; N.annulla(); commit();
  sheet(h('h2', { text: s.nome }),
    h('div', { class: 'tot' },
      h('div', {}, h('small', { text: 'Durata' }), h('b', { class: 'num', text: `${Math.round((s.t1 - s.t0) / 60000)} min` })),
      h('div', {}, h('small', { text: 'Volume' }), h('b', { class: 'num', text: `${Math.round(vol).toLocaleString('it')}` }), dv != null ? h('span', { class: 'num ' + dirCl(Math.sign(dv)), text: `${dv > 0 ? '+' : ''}${dv}%` }) : null),
      h('div', {}, h('small', { text: 'Record' }), h('b', { class: 'num', text: rec || '–' }))),
    ...blocchi,
    h('div', { class: 'acts' }, h('button', { class: 'btn wide', onclick: close }, 'Fatto')));
}
/* Uscire dall'allenamento: pausa (si riprende dopo) o termina (salva e riepilogo). */
function esci() {
  sheet(h('h2', { text: 'Esci dall’allenamento' }),
    h('div', { class: 'list' },
      h('button', { class: 'li', onclick: () => { close(); pausa(); } }, h('span', { class: 'badge' }, ic('pause')), h('div', { class: 't' }, h('b', { text: 'Pausa' }), h('small', { text: 'Esci e riprendi quando vuoi' }))),
      h('button', { class: 'li', onclick: () => { close(); finish(); } }, h('span', { class: 'badge acc' }, ic('stop')), h('div', { class: 't' }, h('b', { text: 'Termina allenamento' }), h('small', { text: 'Salva e vedi il riepilogo' })))),
    h('div', { style: 'text-align:center;margin-top:14px' }, h('button', { class: 'btn danger', onclick: () => { close(); discard(); } }, 'Annulla senza salvare')));
}
function pausa() {
  const L = S.live; L.pausa = Date.now(); L.riposo = null; N.annulla();
  if (L.cron) { const e = L.esercizi.find((x) => x.id === L.cron.ex); if (e) { const x = e.serie[L.cron.i], sec = (Date.now() - L.cron.t0) / 1000; if (P.tipoDi(e) === 'tempo') x.sec = Math.round(sec); else x.min = Math.round((sec / 60) * 10) / 10; } L.cron = null; }
  commit(); toast('Allenamento in pausa');
}
function riprendi() { const L = S.live; if (!L || !L.pausa) return; L.t0 += Date.now() - L.pausa; L.pausa = null; TAB = 'oggi'; history.replaceState(null, '', '#oggi'); commit(); scrollTo(0, 0); }
/* Barra «Riprendi allenamento» sulle altre schermate quando l'allenamento è in pausa. */
function renderRiprendi() {
  const b = $('#resume'), L = S.live;
  if (!L || !L.pausa || TAB === 'oggi') { b.hidden = true; return; }
  b.hidden = false;
  b.replaceChildren(ic('pause'), h('div', { class: 't' }, h('b', { text: L.nome }), h('small', { text: 'In pausa' })), h('button', { class: 'btn', onclick: riprendi }, ic('play'), 'Riprendi'));
}
function discard() { if (!confirm('Annullo l’allenamento in corso?')) return; S.live = null; N.annulla(); commit(); }

/* ---------- recupero ---------- */
let restInt = null, ac = null;
function unlockAudio() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { /* niente */ } }
function beep() {
  try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) { /* niente */ }
  if (!ac) return;
  [0, 0.22, 0.44].forEach((t) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(0.0001, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(0.3, ac.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t + 0.18); o.connect(g).connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.2); });
}
function renderRest() {
  const box = $('#rest'), R = S.live && S.live.riposo;
  clearInterval(restInt);
  if (!R || S.live.pausa || (S.live.vista === 'guida' && TAB === 'oggi')) { box.hidden = true; return; }
  box.hidden = false; box.classList.remove('fine');
  const tm = h('div', { class: 'tm num' }), bar = h('i');
  box.replaceChildren(h('div', { class: 'bar' }, bar), ic('clock'), tm,
    h('button', { 'aria-label': 'Più 15 secondi', onclick: () => { R.fine += 15000; R.tot += 15; save(); const nx = activeEx(); if (nx) N.programma((R.fine - Date.now()) / 1000, 'Recupero finito', nx.nome); } }, '+15'),
    h('button', { 'aria-label': 'Chiudi', onclick: () => { S.live.riposo = null; N.annulla(); save(); renderRest(); } }, ic('x')));
  let suonato = false;
  const upd = () => {
    const left = (R.fine - Date.now()) / 1000;
    tm.textContent = left > 0 ? mmss(Math.ceil(left)) : 'Vai';
    bar.style.width = Math.max(0, Math.min(100, (left / R.tot) * 100)) + '%';
    if (left <= 0 && !suonato) { suonato = true; box.classList.add('fine'); beep(); }
    if (left < -20) { S.live.riposo = null; save(); renderRest(); }
  };
  upd(); restInt = setInterval(upd, 250);
}

/* ---------- riepilogo di un allenamento ---------- */
function openSessione(s, pr = []) {
  sheet(h('h2', { text: s.nome }),
    h('div', { class: 'note num', text: `${fmtD(s.data)} · ${Math.round((s.t1 - s.t0) / 60000)} min · ${sessTxt(s)}` }),
    pr.length ? h('div', { class: 'card', style: 'margin-bottom:10px' }, h('div', { class: 'row' }, h('span', { class: 'chip acc' }, ic('trophy'), 'Record'), h('span', { text: pr.join(', ') }))) : null,
    h('div', { class: 'list' }, s.esercizi.map((e) => h('div', { class: 'li' }, h('div', { class: 't' }, h('b', { text: e.nome }),
      h('small', { class: 'num', text: e.serie.map((x) => setTxt(e, x)).join('   ') }))))),
    h('div', { class: 'acts' }, h('button', { class: 'btn sec2', onclick: () => { const s0 = snap(); S.sessioni = S.sessioni.filter((x) => x.id !== s.id); commit(); close(); undo('Allenamento eliminato', s0); } }, ic('trash')),
      h('button', { class: 'btn', onclick: close }, 'Ok')));
}

/* =====================================================================
   SCHEDA
   ===================================================================== */
function renderScheda(v) {
  top('Scheda', S.scheda.giorni.length ? `${S.scheda.giorni.length} giorni in rotazione` : null);
  const kids = [];
  const nx = P.prossimoIdx();
  S.scheda.giorni.forEach((g, i) => {
    kids.push(h('div', { class: 'card' },
      h('button', { class: 'day-h', style: 'width:100%;text-align:left', onclick: () => editDay(g, i) },
        h('div', { class: 'badge', text: LETT[i] }), h('div', { class: 't' }, h('b', { text: g.nome })),
        i === nx ? h('span', { class: 'chip acc' }, 'Prossimo') : null, ic('edit')),
      h('div', { class: 'exl' }, g.esercizi.map((e, k) => h('button', { class: inSS(g.esercizi, k) ? 'ss' : '', onclick: () => editEx(g, e) },
        h('span', {}, inSS(g.esercizi, k) ? ic('link') : null, e.nome), h('small', { class: 'num', text: exInfo(e) }))),
        g.esercizi.length > 1 ? h('button', { onclick: () => sceltaSuperserie(g.esercizi, null, () => { close(); commit(); }), style: 'color:var(--amb);font-weight:600;justify-content:flex-start;gap:6px' }, ic('link'), 'Superserie') : null,
        h('button', { onclick: () => pickEsercizio({ titolo: 'Esercizio', onPick: (e) => { g.esercizi.push({ id: uid('e'), nome: e.nome, tipo: P.tipoDi(e), serie: e.serie, reps: e.reps, rec: e.rec, passo: e.passo, note: e.note || '' }); commit(); close(); } }), style: 'color:var(--acc);font-weight:600;justify-content:flex-start;gap:6px' }, ic('plus'), 'Esercizio'))));
  });
  if (!S.scheda.giorni.length) kids.push(h('div', { class: 'empty' }, ic('cal'), h('div', { text: 'Ancora nessun giorno' })));
  kids.push(h('button', { class: 'add', onclick: () => editDay(null) }, ic('plus'), 'Giorno'));

  kids.push(h('div', { class: 'sec' }, 'Quando mi alleno'));
  const R = ritmo.R;
  kids.push(h('div', { class: 'card' },
    h('div', { class: 'wk' }, [1, 2, 3, 4, 5, 6, 0].map((d) => h('button', { class: S.pref.giorni.includes(d) ? 'on' : '', 'aria-label': GG[d], onclick: () => {
      S.pref.giorni = S.pref.giorni.includes(d) ? S.pref.giorni.filter((x) => x !== d) : [...S.pref.giorni, d]; commit();
    } }, 'LMMGVSD'[[1, 2, 3, 4, 5, 6, 0].indexOf(d)]))),
    h('div', { class: 'row', style: 'margin-top:12px' }, ic('clock'), h('input', { type: 'time', value: S.pref.ora, style: 'border:0;background:var(--soft);border-radius:10px;height:38px;padding:0 10px', onchange: (e) => { S.pref.ora = e.target.value; commit(); } }),
      h('span', { style: 'flex:1' }),
      h('button', { class: 'chip' + (R.via ? ' ok' : ''), onclick: openSettings }, ic('link'), R.via ? 'Ritmo' : 'Ritmo spento')),
    R.via && ritmo.haPalestra(today(), addDays(today(), 28)) ? h('div', { class: 'note', style: 'margin:10px 0 0', text: 'Seguo le palestre che hai in Ritmo.' }) : null));
  v.replaceChildren(...kids);
}
function editDay(g, i) {
  const nome = h('input', { value: g ? g.nome : '', placeholder: 'Push, Gambe, A…' });
  const G = S.scheda.giorni;
  sheet(h('h2', { text: g ? 'Giorno' : 'Nuovo giorno' }), field('Nome', nome),
    g ? h('div', { class: 'row', style: 'margin-bottom:12px' },
      i > 0 ? h('button', { class: 'btn sec2', onclick: () => { [G[i - 1], G[i]] = [G[i], G[i - 1]]; commit(); close(); } }, ic('up')) : null,
      i < G.length - 1 ? h('button', { class: 'btn sec2', onclick: () => { [G[i + 1], G[i]] = [G[i], G[i + 1]]; commit(); close(); } }, ic('down')) : null,
      h('button', { class: 'btn sec2', onclick: () => { S.prossimo = g.id; commit(); close(); toast('Sarà il prossimo'); } }, 'Fai il prossimo')) : null,
    h('div', { class: 'acts' },
      g ? h('button', { class: 'btn sec2', 'aria-label': 'Elimina', onclick: () => { const s0 = snap(); S.scheda.giorni = G.filter((x) => x.id !== g.id); commit(); close(); undo('Giorno eliminato', s0); } }, ic('trash')) : null,
      h('button', { class: 'btn', onclick: () => {
        const n = nome.value.trim() || `Giorno ${LETT[G.length]}`;
        if (g) g.nome = n; else G.push({ id: uid('g'), nome: n, esercizi: [] });
        commit(); close();
      } }, 'Salva')));
  setTimeout(() => nome.focus(), 250);
}
function editEx(g, e) {
  const i = { nome: h('input', { value: e ? e.nome : '', placeholder: 'Panca piana' }), serie: h('input', { inputmode: 'numeric', value: e ? e.serie : 3 }),
    reps: h('input', { value: e ? e.reps : '8-10', placeholder: '8-10' }), rec: h('input', { inputmode: 'numeric', value: e ? e.rec : 90 }), passo: h('input', { inputmode: 'decimal', value: kgf(e && e.passo ? e.passo : 2.5) }), note: h('input', { value: e ? e.note || '' : '', placeholder: '' }) };
  const idx = e ? g.esercizi.indexOf(e) : -1;
  let tipo = P.tipoDi(e || {});
  const lab = h('span', { text: P.TIPI[tipo].obiettivo }), fp = field('Passo kg', i.passo);
  fp.hidden = tipo !== 'pesi';
  sheet(h('h2', { text: e ? 'Esercizio' : 'Nuovo esercizio' }), field('Nome', i.nome), tipoSel(tipo, (t) => { tipo = t; lab.textContent = P.TIPI[t].obiettivo; fp.hidden = t !== 'pesi'; }),
    h('div', { class: 'fg3' }, field('Serie', i.serie), h('label', { class: 'f' }, lab, i.reps), field('Recupero (s)', i.rec)), h('div', { class: 'fg' }, fp, field('Note', i.note)),
    e ? h('div', { class: 'row', style: 'margin-bottom:12px' },
      ssBtn(g.esercizi, idx, () => { commit(); editEx(g, e); }),
      idx > 0 ? h('button', { class: 'btn sec2', onclick: () => { [g.esercizi[idx - 1], g.esercizi[idx]] = [g.esercizi[idx], g.esercizi[idx - 1]]; commit(); close(); } }, ic('up')) : null,
      idx < g.esercizi.length - 1 ? h('button', { class: 'btn sec2', onclick: () => { [g.esercizi[idx + 1], g.esercizi[idx]] = [g.esercizi[idx], g.esercizi[idx + 1]]; commit(); close(); } }, ic('down')) : null) : null,
    h('div', { class: 'acts' },
      e ? h('button', { class: 'btn sec2', 'aria-label': 'Elimina', onclick: () => { const s0 = snap(); g.esercizi = g.esercizi.filter((x) => x !== e); commit(); close(); undo('Esercizio tolto', s0); } }, ic('trash')) : null,
      h('button', { class: 'btn', onclick: () => {
        const x = { id: e ? e.id : uid('e'), nome: i.nome.value.trim(), tipo, serie: Math.max(1, num(i.serie.value) || 3), reps: i.reps.value.trim(), rec: Math.max(0, num(i.rec.value) ?? 90), passo: num(i.passo.value) || 2.5, note: i.note.value.trim() };
        if (!x.nome) return;
        if (e) Object.assign(e, x); else g.esercizi.push(x);
        libUpsert({ nome: x.nome, tipo, serie: x.serie, reps: x.reps, rec: x.rec, passo: x.passo });
        commit(); close();
      } }, 'Salva')));
  if (!e) setTimeout(() => i.nome.focus(), 250);
}

/* =====================================================================
   PROGRESSI
   ===================================================================== */
const MIS = [['peso', 'Peso', 'kg'], ['grasso', 'Grasso', '%'], ['muscolo', 'Muscolo', 'kg'], ['acqua', 'Acqua', '%'], ['visc', 'Viscerale', ''], ['ossa', 'Ossa', 'kg'], ['bmr', 'Metabolismo', 'kcal']];
let EXSEL = null;
function renderProgressi(v) {
  top('Progressi');
  const seg = h('div', { class: 'seg' }, [['corpo', 'Corpo'], ['forza', 'Esercizi'], ['foto', 'Foto']].map(([k, l]) => h('button', { class: SUB === k ? 'on' : '', onclick: () => { SUB = k; render(); } }, l)));
  const body = h('div');
  v.replaceChildren(seg, body);
  if (SUB === 'corpo') corpo(body); else if (SUB === 'forza') forza(body); else fotoView(body);
}
function corpo(el) {
  const M = [...S.misure].sort((a, b) => (a.data < b.data ? -1 : 1));
  const last = M[M.length - 1], conPeso = M.filter((m) => m.peso != null);
  const kids = [];
  if (!last) kids.push(h('div', { class: 'empty' }, ic('scale'), h('div', { text: 'Nessuna pesata' })));
  else {
    const p0 = conPeso.length > 1 ? conPeso[conPeso.length - 2].peso : null, pl = conPeso.length ? conPeso[conPeso.length - 1].peso : null;
    const d = p0 != null && pl != null ? Math.round((pl - p0) * 10) / 10 : null;
    kids.push(h('div', { class: 'card' },
      h('div', { class: 'stat' }, h('b', { class: 'num', text: kgf(pl) }), h('span', { text: 'kg' }),
        d ? h('span', { class: 'delta num', style: `color:var(--${d < 0 ? 'ok' : 'acc'})`, text: (d > 0 ? '+' : '') + kgf(d) }) : null),
      h('div', { class: 'note', style: 'margin:2px 0 0', text: fmtD(last.data) }),
      conPeso.length > 1 ? lineChart(conPeso.map((m) => ({ d: m.data, v: m.peso })), 'kg') : null,
      h('div', { class: 'grid2' }, MIS.slice(1).filter(([k]) => last[k] != null).map(([k, l, u]) => h('div', {}, h('small', { text: l }), h('b', { class: 'num', text: kgf(last[k]) }), h('small', { style: 'display:inline;margin-left:3px', text: u }))))));
  }
  kids.push(h('button', { class: 'add', onclick: () => editMisura(null) }, ic('plus'), 'Pesata'));
  if (M.length) {
    kids.push(h('div', { class: 'sec' }, 'Storico'));
    kids.push(h('div', { class: 'list' }, M.slice().reverse().slice(0, 30).map((m) => h('button', { class: 'li', onclick: () => editMisura(m) },
      h('div', { class: 't' }, h('b', { class: 'num', text: m.peso != null ? `${kgf(m.peso)} kg` : '—' }), h('small', { text: fmtD(m.data) })),
      h('div', { class: 'r num', text: m.grasso != null ? `${kgf(m.grasso)}%` : '' })))));
  }
  el.replaceChildren(...kids);
}
function editMisura(m) {
  const inp = Object.fromEntries(MIS.map(([k]) => [k, h('input', { inputmode: 'decimal', value: m && m[k] != null ? kgf(m[k]) : '' })]));
  const data = h('input', { type: 'date', value: m ? m.data : today() });
  sheet(h('h2', { text: 'Pesata' }), field('Data', data), field('Peso (kg)', inp.peso),
    h('div', { class: 'fg' }, MIS.slice(1).map(([k, l, u]) => field(`${l}${u ? ` (${u})` : ''}`, inp[k]))),
    h('div', { class: 'acts' },
      m ? h('button', { class: 'btn sec2', onclick: () => { const s0 = snap(); S.misure = S.misure.filter((x) => x.id !== m.id); commit(); close(); undo('Pesata eliminata', s0); } }, ic('trash')) : null,
      h('button', { class: 'btn', onclick: () => {
        const x = { id: m ? m.id : uid('m'), data: data.value || today() };
        for (const [k] of MIS) x[k] = num(inp[k].value);
        if (MIS.every(([k]) => x[k] == null)) return;
        if (m) Object.assign(m, x); else S.misure.push(x);
        commit(); close();
      } }, 'Salva')));
  if (!m) setTimeout(() => inp.peso.focus(), 250);
}
function forza(el) {
  const nomi = P.eserciziFatti();
  if (!nomi.length) { el.replaceChildren(h('div', { class: 'empty' }, ic('trophy'), h('div', { text: 'Qui vedrai i tuoi carichi crescere' }))); return; }
  if (!EXSEL || !nomi.includes(EXSEL)) EXSEL = nomi[0];
  const st = P.storia(EXSEL), best = st.reduce((a, b) => (b.v > a.v ? b : a), st[0]), t = best.t, ex = { tipo: t, nome: EXSEL };
  const u = { pesi: 'kg', corpo: 'rip', tempo: 's', cardio: best.s.km ? 'km' : 'min' }[t], lab = { pesi: 'kg massimale stimato', corpo: 'ripetizioni, serie migliore', tempo: 'secondi, serie migliore', cardio: u === 'km' ? 'km, uscita più lunga' : 'minuti, uscita più lunga' }[t];
  el.replaceChildren(
    h('div', { class: 'chips' }, nomi.map((n) => h('button', { class: n === EXSEL ? 'on' : '', onclick: () => { EXSEL = n; render(); } }, n))),
    h('div', { class: 'card', style: 'margin-top:10px' },
      h('div', { class: 'stat' }, h('b', { class: 'num', text: kgf(best.v) }), h('span', { text: lab })),
      h('div', { class: 'note', style: 'margin:2px 0 0', text: `migliore: ${setTxt(ex, best.s)} · ${fmtD(best.data)}` }),
      st.length > 1 ? lineChart(st.map((x) => ({ d: x.data, v: x.v, t: setTxt(ex, x.s) })), u) : null),
    h('div', { class: 'sec' }, 'Allenamenti'),
    h('div', { class: 'list' }, S.sessioni.slice().reverse().slice(0, 20).map((s) => h('button', { class: 'li', onclick: () => openSessione(s) },
      h('div', { class: 'd' }, h('small', { text: GG[pd(s.data).getDay()] }), h('b', { class: 'num', text: pd(s.data).getDate() })),
      h('div', { class: 't' }, h('b', { text: s.nome }), h('small', { class: 'num', text: `${MM[pd(s.data).getMonth()]} · ${sessTxt(s)}` }))))));
}

/* Grafico a linea, una serie, con tocco per leggere i valori. */
function lineChart(pts, u) {
  const W = 320, H = 150, pad = { l: 4, r: 4, t: 22, b: 4 };
  const lp = pts[pts.length - 1], vs = pts.map((p) => p.v), lo = Math.min(...vs), hi = Math.max(...vs), span = hi - lo || 1;
  const t0 = pd(pts[0].d).getTime(), t1 = pd(pts[pts.length - 1].d).getTime(), ts = t1 - t0 || 1;
  const X = (p) => pad.l + ((pd(p.d).getTime() - t0) / ts) * (W - pad.l - pad.r), Y = (v) => pad.t + (1 - (v - lo) / span) * (H - pad.t - pad.b);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p).toFixed(1)},${Y(p.v).toFixed(1)}`).join('');
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('preserveAspectRatio', 'none');
  svg.innerHTML = `<defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--acc)" stop-opacity=".18"/><stop offset="1" stop-color="var(--acc)" stop-opacity="0"/></linearGradient></defs>
    <line x1="0" x2="${W}" y1="${H - pad.b}" y2="${H - pad.b}" stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>
    <path d="${d}L${X(pts[pts.length - 1]).toFixed(1)},${H - pad.b}L${X(pts[0]).toFixed(1)},${H - pad.b}Z" fill="url(#gr)" stroke="none"/>
    <path d="${d}" fill="none" stroke="var(--acc)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
    <line class="cx" x1="0" x2="0" y1="${pad.t}" y2="${H - pad.b}" stroke="var(--mute)" stroke-width="1" vector-effect="non-scaling-stroke" opacity="0"/>
`;
  const dot = document.createElementNS(ns, 'circle'); dot.setAttribute('r', 5); dot.setAttribute('fill', 'var(--acc)'); dot.setAttribute('stroke', 'var(--card)'); dot.setAttribute('stroke-width', 2);
  dot.setAttribute('cx', X(lp)); dot.setAttribute('cy', Y(lp.v)); svg.append(dot);
  const lab = (p) => `${pd(p.d).getDate()} ${MM[pd(p.d).getMonth()]}`;
  const tip = h('div', { class: 'tip', hidden: true }), cx = svg.querySelector('.cx');
  const box = h('div', { class: 'chart' }, svg, tip, h('div', { class: 'axis num' }, h('span', { text: lab(pts[0]) }), h('span', { text: `${kgf(lo)}–${kgf(hi)} ${u}` }), h('span', { text: lab(lp) })));
  const show = (ev) => {
    const r = svg.getBoundingClientRect(), x = ((ev.clientX - r.left) / r.width) * W;
    const p = pts.reduce((a, b) => (Math.abs(X(b) - x) < Math.abs(X(a) - x) ? b : a));
    dot.setAttribute('cx', X(p)); dot.setAttribute('cy', Y(p.v)); cx.setAttribute('x1', X(p)); cx.setAttribute('x2', X(p)); cx.setAttribute('opacity', 1);
    tip.hidden = false; tip.textContent = `${kgf(p.v)} ${u}${p.t ? ' · ' + p.t : ''} · ${fmtD(p.d)}`; tip.style.left = Math.min(Math.max((X(p) / W) * r.width, 60), r.width - 60) + 'px';
  };
  const hide = () => { tip.hidden = true; cx.setAttribute('opacity', 0); dot.setAttribute('cx', X(lp)); dot.setAttribute('cy', Y(lp.v)); };
  svg.addEventListener('pointermove', show); svg.addEventListener('pointerdown', show); svg.addEventListener('pointerleave', hide);
  return box;
}

let URLS = [];
async function fotoView(el) {
  const list = await foto.all();
  URLS.forEach((u) => URL.revokeObjectURL(u)); URLS = [];
  const url = (f) => { const u = URL.createObjectURL(f.blob); URLS.push(u); return u; };
  const inp = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true, onchange: async (e) => {
    const files = [...e.target.files]; if (!files.length) return;
    toast('Salvo…');
    for (const f of files) await foto.put({ id: uid('f'), data: today(), blob: await shrink(f) });
    toast(files.length > 1 ? `${files.length} foto salvate` : 'Foto salvata'); render();
  } });
  const kids = [inp, h('button', { class: 'add', style: 'margin-top:0;margin-bottom:12px', onclick: () => inp.click() }, ic('cam'), 'Foto')];
  if (!list.length) kids.push(h('div', { class: 'empty' }, ic('cam'), h('div', { text: 'Una foto ogni tanto, stessa luce e stessa posa' })));
  else {
    if (list.length > 1) {
      const a = list[list.length - 1], b = list[0];
      kids.push(h('div', { class: 'card', style: 'margin-bottom:12px' }, h('div', { class: 'cmp' },
        h('div', {}, h('img', { src: url(a), alt: '' }), h('small', { text: fmtD(a.data) })), h('div', {}, h('img', { src: url(b), alt: '' }), h('small', { text: fmtD(b.data) })))));
    }
    kids.push(h('div', { class: 'photos' }, list.map((f) => { const u = url(f); return h('button', { style: `background-image:url(${u})`, onclick: () => openFoto(f, u) }, h('small', { text: fmtD(f.data) })); })));
  }
  el.replaceChildren(...kids);
}
function openFoto(f, u) {
  const data = h('input', { type: 'date', value: f.data, onchange: async (e) => { f.data = e.target.value; await foto.put(f); render(); } });
  sheet(h('div', { class: 'viewer' }, h('img', { src: u, alt: '' })), h('div', { style: 'margin-top:12px' }, field('Data', data)),
    h('div', { class: 'acts' }, h('button', { class: 'btn sec2', onclick: async () => { if (!confirm('Elimino la foto?')) return; await foto.del(f.id); close(); render(); } }, ic('trash')), h('button', { class: 'btn', onclick: close }, 'Ok')));
}

/* =====================================================================
   IMPOSTAZIONI: Ritmo e copia di sicurezza
   ===================================================================== */
function openSettings() {
  const R = ritmo.R, pass = h('input', { type: 'password', placeholder: 'Parola chiave di Ritmo', autocomplete: 'off' });
  const gist = h('input', { placeholder: 'gist.github.com/…', autocomplete: 'off' });
  const stato = { locale: 'Collegato: leggo i tuoi impegni da Ritmo.', gist: 'Collegato: piano e impegni di Ritmo.', file: 'Collegato al piano di Ritmo.' }[R.via] || 'Non trovo Ritmo su questo telefono.';
  sheet(h('h2', { text: 'Impostazioni' }),
    h('div', { class: 'sec', style: 'margin-top:0' }, 'Ritmo'),
    h('div', { class: 'card' }, h('div', { class: 'row' }, h('span', { class: 'chip' + (R.via ? ' ok' : '') }, ic('link')), h('span', { text: stato })),
      R.via ? h('div', { class: 'note', style: 'margin:10px 0 0', text: `${R.eventi.length} impegni · palestre in programma: ${R.eventi.filter((e) => e.data >= today() && ritmo.palestraIl(e.data) === e).length}` }) : null,
      !R.via ? h('div', { style: 'margin-top:12px' }, field('Parola chiave', pass), field('Gist di Ritmo (facoltativo)', gist), h('button', { class: 'btn wide', onclick: async () => {
        try { await ritmo.collegaConParola(pass.value, gist.value); commit(); openSettings(); toast('Ritmo collegato'); } catch (e) { toast('Parola chiave sbagliata o Ritmo non raggiungibile'); }
      } }, 'Collega')) : null,
      h('div', { class: 'row', style: 'margin-top:12px' }, h('a', { class: 'btn sec2', href: '../ritmo/', style: 'text-decoration:none;flex:1' }, 'Apri Ritmo'),
        R.via === 'file' || R.via === 'gist' ? h('button', { class: 'btn sec2', onclick: () => { ritmo.scollega(); boot(); close(); } }, 'Scollega') : null)),
    h('div', { class: 'sec' }, 'Notifiche e orologio'),
    notifCard(),
    h('div', { class: 'sec' }, 'Copia di sicurezza'),
    h('div', { class: 'card' }, h('div', { class: 'note', style: 'margin-top:0', text: 'Scheda, allenamenti e pesate in un file. Le foto restano sul telefono.' }),
      h('div', { class: 'row' }, h('button', { class: 'btn sec2', style: 'flex:1', onclick: esporta }, 'Esporta'),
        h('button', { class: 'btn sec2', style: 'flex:1', onclick: importa }, 'Importa'))),
    h('div', { class: 'acts' }, h('button', { class: 'btn wide', onclick: close }, 'Fatto')));
}
function notifCard() {
  if (!N.attive()) return h('div', { class: 'card' },
    h('div', { class: 'note', style: 'margin-top:0', text: 'A fine recupero ti arriva una notifica anche a schermo spento, e lo smartwatch vibra.' }),
    h('button', { class: 'btn wide', onclick: () => { N.attiva(); openSettings(); } }, ic('bell'), 'Attiva'));
  const topic = S.notif.topic;
  return h('div', { class: 'card notif' },
    h('ol', {},
      h('li', {}, 'Installa ', h('b', { text: 'ntfy' }), ' dall’App Store.'),
      h('li', {}, 'In ntfy tocca ', h('b', { text: '+' }), ' e iscriviti a questo canale:',
        h('div', { class: 'topic' }, h('code', { class: 'num', text: topic }), h('button', { class: 'mini', onclick: async () => { try { await navigator.clipboard.writeText(topic); toast('Copiato'); } catch (e) { toast(topic); } } }, 'Copia'))),
      h('li', {}, 'Nell’app dello smartwatch lascia attive le notifiche di ntfy.'),
      h('li', {}, 'Prova: deve arrivarti una notifica.')),
    h('div', { class: 'row' }, h('button', { class: 'btn', style: 'flex:1', onclick: () => { N.prova(); toast('Inviata'); } }, ic('bell'), 'Prova'),
      h('button', { class: 'btn sec2', onclick: () => { N.spegni(); openSettings(); } }, 'Spegni')));
}
function esporta() {
  const blob = new Blob([JSON.stringify({ app: 'carico', t: Date.now(), dati: S }, null, 1)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `carico-${today()}.json` }); document.body.append(a); a.click(); a.remove();
}
function importa() {
  const i = h('input', { type: 'file', accept: 'application/json,.json', onchange: async (e) => {
    try { const x = JSON.parse(await e.target.files[0].text()); if (x.app !== 'carico' || !x.dati) throw 0; const s0 = snap(); replaceAll(x.dati); close(); render(); undo('Dati importati', s0); }
    catch (er) { toast('Questo file non è una copia di Carico'); }
  } });
  i.click();
}

/* ---------- salvataggio e avvio ---------- */
function commit() { save(); P.aggiornaRitmo(); render(); }
async function boot() { syncLib(); await ritmo.leggi(); P.aggiornaRitmo(); render(); }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') boot(); });
window.addEventListener('storage', (e) => { if (e.key && e.key.startsWith('ritmo:')) boot(); });
render(); boot();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
