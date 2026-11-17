# Carico

Scheda d'allenamento viva e progressi in palestra. App web (PWA) senza server: i dati restano sul telefono.

**Indirizzo:** https://realininiccolo-oss.github.io/CARICO/ — aprilo in Safari → Condividi → *Aggiungi alla schermata Home*.

## Cosa fa

- **Oggi** — il prossimo allenamento, pronto da far partire. «Non oggi» lo fa slittare al prossimo giorno utile; ⇄ sceglie un altro giorno della scheda.
- **Allenamento in corso** — per ogni esercizio: serie, kg, ripetizioni. Spunti la serie → parte il recupero (con suono e vibrazione dove il telefono lo consente). Carichi precompilati dall'ultima volta; se hai chiuso tutte le serie al massimo delle ripetizioni propone +2,5 kg. A fine allenamento: durata, volume, record.
- **Scheda** — giorni in rotazione (A → B → C → A…), non legati al giorno della settimana: se salti, si slitta e basta. Esercizi con serie, ripetizioni (`8-10`), recupero, note.
- **Progressi** — pesate e dati della bilancia (grasso, muscolo, acqua, viscerale, ossa, metabolismo), andamento della forza (massimale stimato con Epley), foto con confronto prima/dopo.
- **Copia di sicurezza** — ⚙︎ → Esporta / Importa (le foto restano sul telefono).

## Collegamento con Ritmo

Carico e Ritmo stanno sullo stesso indirizzo (`realininiccolo-oss.github.io`).

**Da Ritmo a Carico** — Carico usa le palestre che hai in Ritmo come giorni di allenamento; dopo l'ultima palestra in Ritmo usa i giorni scelti in *Scheda → Quando mi alleno*. Mostra anche se la giornata in Ritmo è piena.
- Nello stesso browser legge Ritmo direttamente.
- Su iPhone, con le app sulla schermata Home, ogni app ha la sua memoria: in ⚙︎ inserisci la **parola chiave di Ritmo** (legge il piano) e, se vuoi, il link del **gist di Ritmo** (legge anche gli impegni aggiunti a mano).

**Da Carico a Ritmo** — Carico pubblica i suoi allenamenti in `carico:per-ritmo`. Perché Ritmo li mostri serve la piccola modifica in [`docs/ritmo.patch`](docs/ritmo.patch) (non ancora applicata a Ritmo). Funziona quando le due app condividono la memoria (stesso browser).

## File

| File | Cosa |
|---|---|
| `index.html`, `style.css` | guscio e stile (toni caldi, chiaro/scuro automatico) |
| `js/app.js` | schermate |
| `js/plan.js` | rotazione, slittamento, proposte di carico, statistiche |
| `js/ritmo.js` | collegamento con Ritmo |
| `js/store.js` | dati (localStorage) e foto (IndexedDB) |
| `sw.js` | funzionamento senza rete |

## Da fare

- Caricare la scheda vera.
- Pubblicazione su GitHub Pages: Settings → Pages → Branch `main` / root.
