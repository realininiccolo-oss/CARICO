import { S, save, uid, today, addDays, foto, shrink, replaceAll } from './store.js';
import * as P from './plan.js';
import * as ritmo from './ritmo.js';

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
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>', dumb: '<path d="M3 9.5h2.5m13 0H21M3 14.5h2.5m13 0H21"/><rect x="5.5" y="6.5" width="3.5" height="11" rx="1"/><rect x="15" y="6.5" width="3.5" height="11" rx="1"/><path d="M9 12h6"/>',
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
const snap = () => JSON.stringify(S);
const undo = (msg, s0) => toast(msg, { label: 'Annulla', fn: () => { replaceAll(JSON.parse(s0)); render(); } });

/* ---------- foglio dal basso ---------- */
function sheet(...kids) { const c = $('.sheet-card'); c.replaceChildren(...kids.filter((k) => k != null && k !== false)); $('#sheet').hidden = false; c.scrollTop = 0; }
const close = () => { $('#sheet').hidden = true; };
$('.sheet-bg').addEventListener('click', close);
const field = (label, input) => h('label', { class: 'f' }, h('span', { text: label }), input);

/* ---------- navigazione ---------- */
let TAB = location.hash.slice(1) || 'oggi', SUB = 'corpo';
if (!['oggi', 'scheda', 'progressi'].includes(TAB)) TAB = 'oggi';
document.querySelectorAll('#tabs button').forEach((b) => b.addEventListener('click', () => { TAB = b.dataset.tab; history.replaceState(null, '', '#' + TAB); render(); scrollTo(0, 0); }));

function render() {
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === TAB));
  const v = $('#view');
  if (TAB === 'oggi') S.live ? renderLive(v) : renderOggi(v);
  else if (TAB === 'scheda') renderScheda(v);
  else renderProgressi(v);
  renderRest();
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

  if (!G.length) {
    kids.push(h('div', { class: 'hero' }, h('div', { class: 'k' }, 'Oggi'), h('div', { class: 'big', text: 'Giornata libera' }),
      h('div', { class: 'meta' }, 'Crea un allenamento o registra un esercizio')));
  } else if (fatto.length) {
    const s = fatto[fatto.length - 1];
    kids.push(h('div', { class: 'hero' }, h('div', { class: 'k' }, ic('check'), 'Fatto'), h('div', { class: 'big', text: s.nome }),
      h('div', { class: 'meta' }, h('span', { class: 'num', text: `${Math.round((s.t1 - s.t0) / 60000)} min` }), h('span', { class: 'num', text: `${Math.round(volume(s)).toLocaleString('it')} kg` })),
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

  if (!fatto.length) kids.push(h('div', { class: 'tiles' },
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
      h('div', { class: 't' }, h('b', { text: s.nome }), h('small', { class: 'num', text: `${Math.round((s.t1 - s.t0) / 60000)} min · ${Math.round(volume(s)).toLocaleString('it')} kg` }))))));
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
const volume = (s) => s.esercizi.reduce((a, e) => a + e.serie.filter((x) => x.ok).reduce((b, x) => b + (num(x.kg) || 0) * (num(x.reps) || 0), 0), 0);

/* =====================================================================
   ALLENAMENTO IN CORSO
   ===================================================================== */
function startLive(g) {
  S.live = {
    id: uid('s'), data: today(), giorno: g ? g.id : null, nome: g ? g.nome : 'Libero', t0: Date.now(), riposo: null,
    esercizi: (g ? g.esercizi : []).map((e) => liveEx(e)),
  };
  TAB = 'oggi'; commit(); scrollTo(0, 0);
}
function liveEx(e) {
  const p = P.proposta(e), n = Math.max(1, Number(e.serie) || 3);
  return { id: uid('x'), esId: e.id || null, nome: e.nome, reps: e.reps || '', rec: Number(e.rec) || 90, note: e.note || '', su: p.su,
    serie: Array.from({ length: n }, () => ({ kg: p.kg, reps: p.reps, ok: null })) };
}
let tick = null;
function renderLive(v) {
  const L = S.live;
  $('#top').replaceChildren();
  const el = h('small', { class: 'num' });
  const upd = () => { el.textContent = mmss((Date.now() - L.t0) / 1000) + ` · ${L.esercizi.reduce((a, e) => a + e.serie.filter((s) => s.ok).length, 0)} serie`; };
  upd(); clearInterval(tick); tick = setInterval(() => { if (!S.live) return clearInterval(tick); upd(); }, 1000);
  const kids = [h('div', { class: 'live-top' }, h('div', { class: 't' }, h('b', { text: L.nome }), el), h('button', { class: 'btn', onclick: finish }, 'Fine'))];
  L.esercizi.forEach((e, ei) => kids.push(exCard(e, ei)));
  kids.push(h('button', { class: 'add', onclick: addEsercizio }, ic('plus'), 'Esercizio'));
  kids.push(h('div', { style: 'text-align:center;margin-top:18px' }, h('button', { class: 'btn danger', onclick: discard }, 'Annulla allenamento')));
  v.replaceChildren(...kids);
}
function exCard(e, ei) {
  const u = P.ultima(e), done = e.serie.length && e.serie.every((s) => s.ok);
  const last = u ? u.serie.filter((s) => s.ok).map((s) => `${kgf(num(s.kg))}×${s.reps}`).join('  ') : null;
  return h('div', { class: 'ex' + (done ? ' done' : '') },
    h('div', { class: 'ex-h' },
      h('div', { class: 't' }, h('b', { text: e.nome }), h('small', { class: 'num', text: [e.reps ? `${e.serie.length} × ${e.reps}` : null, e.rec ? `${e.rec}s` : null, last ? `ultima ${last}` : null].filter(Boolean).join(' · ') })),
      e.su ? h('span', { class: 'chip acc', title: 'Aumenta il carico' }, ic('up'), '2,5') : null),
    e.serie.map((s, si) => setRow(e, s, si)),
    h('div', { class: 'ex-f' },
      h('button', { class: 'mini', onclick: () => { const l = e.serie[e.serie.length - 1] || {}; e.serie.push({ kg: l.kg ?? '', reps: l.reps ?? '', ok: null }); commit(); } }, ic('plus'), 'Serie'),
      e.serie.length > 1 ? h('button', { class: 'mini', onclick: () => { e.serie.pop(); commit(); } }, ic('minus')) : null,
      h('span', { style: 'flex:1' }),
      ei > 0 ? h('button', { class: 'mini', 'aria-label': 'Su', onclick: () => { const a = S.live.esercizi; [a[ei - 1], a[ei]] = [a[ei], a[ei - 1]]; commit(); } }, ic('up')) : null,
      h('button', { class: 'mini', 'aria-label': 'Togli', onclick: () => { const s0 = snap(); S.live.esercizi.splice(ei, 1); commit(); undo('Esercizio tolto', s0); } }, ic('trash'))));
}
function setRow(e, s, si) {
  const kg = h('input', { inputmode: 'decimal', value: s.kg === '' || s.kg == null ? '' : kgf(num(s.kg)), placeholder: '–', 'aria-label': 'kg', oninput: (ev) => { s.kg = num(ev.target.value) ?? ''; save(); } });
  const rp = h('input', { inputmode: 'numeric', value: s.reps ?? '', placeholder: '–', 'aria-label': 'ripetizioni', oninput: (ev) => { s.reps = num(ev.target.value) ?? ''; save(); } });
  return h('div', { class: 'set' + (s.ok ? ' ok' : '') }, h('div', { class: 'n num', text: si + 1 }),
    h('div', { class: 'u', 'data-u': 'kg' }, kg), h('div', { class: 'u', 'data-u': 'rip' }, rp),
    h('button', { class: 'chk', 'aria-label': 'Serie fatta', onclick: () => {
      unlockAudio();
      if (s.ok) { s.ok = null; } else {
        s.ok = Date.now();
        // la serie successiva parte dagli stessi numeri
        const nx = e.serie[si + 1]; if (nx && !nx.ok && (nx.kg === '' || nx.kg == null)) { nx.kg = s.kg; nx.reps = s.reps; }
        S.live.riposo = { fine: Date.now() + e.rec * 1000, tot: e.rec };
      }
      commit();
    } }, ic('check')));
}
/* ---------- libreria esercizi ---------- */
const norm = (x) => (x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
function syncLib() {
  if (!Array.isArray(S.libreria)) S.libreria = [];
  const has = new Set(S.libreria.map((e) => norm(e.nome)));
  const add = (e) => { if (e && e.nome && !has.has(norm(e.nome))) { has.add(norm(e.nome)); S.libreria.push({ id: uid('l'), nome: e.nome, serie: e.serie || 3, reps: e.reps || '', rec: e.rec ?? 90, note: e.note || '' }); } };
  S.scheda.giorni.forEach((g) => g.esercizi.forEach(add));
  S.sessioni.forEach((x) => x.esercizi.forEach((e) => add({ nome: e.nome, serie: e.serie.length, reps: e.reps, rec: e.rec })));
}
function libUpsert(x) {
  syncLib();
  const e = S.libreria.find((l) => norm(l.nome) === norm(x.nome));
  if (e) Object.assign(e, { nome: x.nome, serie: x.serie, reps: x.reps, rec: x.rec }); else S.libreria.push({ id: uid('l'), note: '', ...x });
  return e || S.libreria[S.libreria.length - 1];
}
const lastUsed = (nome) => { for (let k = S.sessioni.length - 1; k >= 0; k--) if (S.sessioni[k].esercizi.some((e) => norm(e.nome) === norm(nome))) return S.sessioni[k].data; return ''; };
const searchBox = (q) => h('div', { class: 'searchbox' }, ic('search'), q);
const exInfo = (e) => `${e.serie} × ${e.reps || '–'} · ${e.rec}s`;

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
    reps: h('input', { value: '8-10' }), rec: h('input', { inputmode: 'numeric', value: 90 }) };
  sheet(h('h2', { text: 'Nuovo esercizio' }), field('Nome', i.nome),
    h('div', { class: 'fg3' }, field('Serie', i.serie), field('Ripetizioni', i.reps), field('Recupero (s)', i.rec)),
    h('div', { class: 'acts' }, h('button', { class: 'btn', onclick: () => {
      const x = { nome: i.nome.value.trim(), serie: Math.max(1, num(i.serie.value) || 3), reps: i.reps.value.trim(), rec: Math.max(0, num(i.rec.value) ?? 90) };
      if (!x.nome) return;
      const e = libUpsert(x); save(); cb(e);
    } }, 'Salva')));
  if (!nome) setTimeout(() => i.nome.focus(), 250);
}
/* Aggiungi esercizio: entra nell'allenamento in corso, o ne apre uno libero di oggi. */
function addEsercizio() {
  pickEsercizio({ titolo: 'Esercizio', onPick: (e) => {
    close();
    if (!S.live) S.live = { id: uid('s'), data: today(), giorno: null, nome: 'Libero', t0: Date.now(), riposo: null, esercizi: [] };
    S.live.esercizi.push(liveEx(e)); TAB = 'oggi'; commit();
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
    const g = { id: uid('g'), nome: b.nome.trim() || `Allenamento ${LETT[S.scheda.giorni.length]}`, esercizi: b.esercizi.map((e) => ({ id: uid('e'), nome: e.nome, serie: e.serie, reps: e.reps, rec: e.rec, note: e.note || '' })) };
    S.scheda.giorni.push(g); return g;
  };
  const vuoto = () => { if (b.esercizi.length) return false; toast('Aggiungi almeno un esercizio'); return true; };
  sheet(h('h2', { text: 'Nuovo allenamento' }), field('Nome', nome),
    b.esercizi.length ? h('div', { class: 'list' }, b.esercizi.map((e, i) => h('div', { class: 'li' }, h('div', { class: 't' }, h('b', { text: e.nome }), h('small', { class: 'num', text: exInfo(e) })),
      h('button', { class: 'mini', 'aria-label': 'Togli', onclick: () => { b.esercizi.splice(i, 1); builder(b); } }, ic('x'))))) : null,
    h('button', { class: 'add', onclick: () => pickEsercizio({ titolo: 'Esercizi', multi: true, gia: b.esercizi.map((e) => e.nome), onPick: (arr) => {
      const prima = b.esercizi.filter((e) => arr.some((a) => norm(a.nome) === norm(e.nome)));
      b.esercizi = [...prima, ...arr.filter((a) => !prima.some((e) => norm(e.nome) === norm(a.nome)))]; builder(b);
    } }) }, ic('plus'), 'Esercizi'),
    h('div', { class: 'acts' },
      h('button', { class: 'btn sec2', onclick: () => { if (vuoto()) return; salva(); commit(); close(); toast('Allenamento salvato'); } }, 'Salva'),
      h('button', { class: 'btn', onclick: () => { if (vuoto()) return; const g = salva(); close(); startLive(g); } }, ic('play'), 'Inizia')));
}
function finish() {
  const L = S.live, fatte = L.esercizi.reduce((a, e) => a + e.serie.filter((s) => s.ok).length, 0);
  if (!fatte) { if (confirm('Nessuna serie segnata. Chiudo senza salvare?')) { S.live = null; commit(); } return; }
  const prima = Object.fromEntries(L.esercizi.map((e) => [e.nome, Math.max(0, ...P.storia(e.nome).map((x) => x.v))]));
  const s = { ...L, t1: Date.now(), esercizi: L.esercizi.map((e) => ({ ...e, serie: e.serie.filter((x) => x.ok) })).filter((e) => e.serie.length) };
  delete s.riposo;
  if (!s.giorno) { const n = s.esercizi.map((e) => e.nome); s.nome = n.slice(0, 2).join(' · ') + (n.length > 2 ? ` +${n.length - 2}` : ''); }
  S.sessioni.push(s); S.live = null; S.prossimo = null; commit();
  const pr = s.esercizi.filter((e) => { const b = Math.max(0, ...e.serie.map((x) => P.e1rm(num(x.kg) || 0, num(x.reps) || 0))); return prima[e.nome] > 0 && b > prima[e.nome] + 0.01; }).map((e) => e.nome);
  openSessione(s, pr);
}
function discard() { if (!confirm('Annullo l’allenamento in corso?')) return; S.live = null; commit(); }

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
  if (!R) { box.hidden = true; return; }
  box.hidden = false; box.classList.remove('fine');
  const tm = h('div', { class: 'tm num' }), bar = h('i');
  box.replaceChildren(h('div', { class: 'bar' }, bar), ic('clock'), tm,
    h('button', { 'aria-label': 'Più 15 secondi', onclick: () => { R.fine += 15000; R.tot += 15; save(); } }, '+15'),
    h('button', { 'aria-label': 'Chiudi', onclick: () => { S.live.riposo = null; save(); renderRest(); } }, ic('x')));
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
    h('div', { class: 'note num', text: `${fmtD(s.data)} · ${Math.round((s.t1 - s.t0) / 60000)} min · ${Math.round(volume(s)).toLocaleString('it')} kg` }),
    pr.length ? h('div', { class: 'card', style: 'margin-bottom:10px' }, h('div', { class: 'row' }, h('span', { class: 'chip acc' }, ic('trophy'), 'Record'), h('span', { text: pr.join(', ') }))) : null,
    h('div', { class: 'list' }, s.esercizi.map((e) => h('div', { class: 'li' }, h('div', { class: 't' }, h('b', { text: e.nome }),
      h('small', { class: 'num', text: e.serie.map((x) => `${kgf(num(x.kg))}×${x.reps}`).join('   ') }))))),
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
      h('div', { class: 'exl' }, g.esercizi.map((e) => h('button', { onclick: () => editEx(g, e) },
        h('span', { text: e.nome }), h('small', { class: 'num', text: `${e.serie} × ${e.reps || '–'} · ${e.rec}s` }))),
        h('button', { onclick: () => pickEsercizio({ titolo: 'Esercizio', onPick: (e) => { g.esercizi.push({ id: uid('e'), nome: e.nome, serie: e.serie, reps: e.reps, rec: e.rec, note: e.note || '' }); commit(); close(); } }), style: 'color:var(--acc);font-weight:600;justify-content:flex-start;gap:6px' }, ic('plus'), 'Esercizio'))));
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
    reps: h('input', { value: e ? e.reps : '8-10', placeholder: '8-10' }), rec: h('input', { inputmode: 'numeric', value: e ? e.rec : 90 }), note: h('input', { value: e ? e.note || '' : '', placeholder: '' }) };
  const idx = e ? g.esercizi.indexOf(e) : -1;
  sheet(h('h2', { text: e ? 'Esercizio' : 'Nuovo esercizio' }), field('Nome', i.nome),
    h('div', { class: 'fg3' }, field('Serie', i.serie), field('Ripetizioni', i.reps), field('Recupero (s)', i.rec)), field('Note', i.note),
    e ? h('div', { class: 'row', style: 'margin-bottom:12px' },
      idx > 0 ? h('button', { class: 'btn sec2', onclick: () => { [g.esercizi[idx - 1], g.esercizi[idx]] = [g.esercizi[idx], g.esercizi[idx - 1]]; commit(); close(); } }, ic('up')) : null,
      idx < g.esercizi.length - 1 ? h('button', { class: 'btn sec2', onclick: () => { [g.esercizi[idx + 1], g.esercizi[idx]] = [g.esercizi[idx], g.esercizi[idx + 1]]; commit(); close(); } }, ic('down')) : null) : null,
    h('div', { class: 'acts' },
      e ? h('button', { class: 'btn sec2', 'aria-label': 'Elimina', onclick: () => { const s0 = snap(); g.esercizi = g.esercizi.filter((x) => x !== e); commit(); close(); undo('Esercizio tolto', s0); } }, ic('trash')) : null,
      h('button', { class: 'btn', onclick: () => {
        const x = { id: e ? e.id : uid('e'), nome: i.nome.value.trim(), serie: Math.max(1, num(i.serie.value) || 3), reps: i.reps.value.trim(), rec: Math.max(0, num(i.rec.value) ?? 90), note: i.note.value.trim() };
        if (!x.nome) return;
        if (e) Object.assign(e, x); else g.esercizi.push(x);
        libUpsert({ nome: x.nome, serie: x.serie, reps: x.reps, rec: x.rec });
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
  const seg = h('div', { class: 'seg' }, [['corpo', 'Corpo'], ['forza', 'Forza'], ['foto', 'Foto']].map(([k, l]) => h('button', { class: SUB === k ? 'on' : '', onclick: () => { SUB = k; render(); } }, l)));
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
  const st = P.storia(EXSEL), best = st.reduce((a, b) => (b.v > a.v ? b : a), st[0]);
  el.replaceChildren(
    h('div', { class: 'chips' }, nomi.map((n) => h('button', { class: n === EXSEL ? 'on' : '', onclick: () => { EXSEL = n; render(); } }, n))),
    h('div', { class: 'card', style: 'margin-top:10px' },
      h('div', { class: 'stat' }, h('b', { class: 'num', text: kgf(best.v) }), h('span', { text: 'kg massimale stimato' })),
      h('div', { class: 'note', style: 'margin:2px 0 0', text: `migliore: ${kgf(best.kg)} × ${best.reps} · ${fmtD(best.data)}` }),
      st.length > 1 ? lineChart(st.map((x) => ({ d: x.data, v: x.v, t: `${kgf(x.kg)}×${x.reps}` })), 'kg') : null),
    h('div', { class: 'sec' }, 'Allenamenti'),
    h('div', { class: 'list' }, S.sessioni.slice().reverse().slice(0, 20).map((s) => h('button', { class: 'li', onclick: () => openSessione(s) },
      h('div', { class: 'd' }, h('small', { text: GG[pd(s.data).getDay()] }), h('b', { class: 'num', text: pd(s.data).getDate() })),
      h('div', { class: 't' }, h('b', { text: s.nome }), h('small', { class: 'num', text: `${MM[pd(s.data).getMonth()]} · ${Math.round(volume(s)).toLocaleString('it')} kg` }))))));
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
    h('div', { class: 'sec' }, 'Copia di sicurezza'),
    h('div', { class: 'card' }, h('div', { class: 'note', style: 'margin-top:0', text: 'Scheda, allenamenti e pesate in un file. Le foto restano sul telefono.' }),
      h('div', { class: 'row' }, h('button', { class: 'btn sec2', style: 'flex:1', onclick: esporta }, 'Esporta'),
        h('button', { class: 'btn sec2', style: 'flex:1', onclick: importa }, 'Importa'))),
    h('div', { class: 'acts' }, h('button', { class: 'btn wide', onclick: close }, 'Fatto')));
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
