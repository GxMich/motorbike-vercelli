# Motorbike Vercelli

Proposta completa di sito statico multipagina per Motorbike Vercelli. **35 pagine**, 22 nuove immagini del sito originale ottimizzate in WebP, home cinematografica e navigazione dedicata ai reparti.

La demo aggiornata è pubblicata su https://gxmich.github.io/motorbike-vercelli/. Il progetto mantiene `noindex, nofollow` e non è il sito ufficiale dell’attività.

## Avvio

```sh
python -m http.server 4175 --bind 127.0.0.1
```

Aprire http://127.0.0.1:4175/. Nessuna build o dipendenza è necessaria per servire il sito.

## Pagine e funzioni

- Home con avviamento, faro, composizione dei caschi, corsie orizzontali, marchi e serranda dell’officina.
- Negozio, moto, caschi, abbigliamento, interfoni, cross, accessori, officina, club e contatti.
- 21 pagine di categoria: 5 caschi, 6 abbigliamento, 4 accessori, 6 interfoni.
- Ricerca locale, filtri con URL condivisibile, breadcrumb, menu accessibile, FAQ e pagina 404.
- Tre percorsi rapidi in home, guida caschi, richieste moto nuova/usata precompilate e selezione dei servizi officina.
- Stato aperto/chiuso calcolato nel fuso Europe/Rome, orari, telefono, email, indicazioni e mappa attivabile.
- Moduli officina e contatti con validazione, riepilogo, link alla bozza email e copia del messaggio. **Non inviano messaggi dal sito**: l’utente deve inviare la bozza dal proprio client email. Un appuntamento si conferma direttamente con l’officina.
- Un solo recapito obbligatorio, telefono oppure email. Invio diretto predisposto tramite endpoint Formspree verificato: configurazione e limiti in `CONTACT-SETUP.md`. Endpoint vuoti nella demo, nessun invio automatico attivo.
- Privacy della demo, fallback senza JavaScript e modalità movimento ridotto.

## Manutenzione

`scripts/build_site.py` contiene i dati delle categorie e i componenti condivisi. Modificare qui le pagine interne e rigenerare:

```sh
python scripts/build_site.py
```

La home resta in `index.html`; il generatore aggiorna navigazione e footer condivisi, mantenendo le scene originali. I file HTML generati sono inclusi nel repository e funzionano direttamente anche su GitHub Pages, sotto una sottocartella.

| File | Funzione |
|---|---|
| `assets/css/style.css`, `bike.css`, `content.css` | Design e scene della home |
| `assets/css/pages.css` | Layout e componenti multipagina |
| `assets/js/site.js` | GSAP, ScrollTrigger, Lenis e modulo guidato della home |
| `assets/js/pages.js` | Menu, orari, filtri, ricerca, moduli e mappa |
| `assets/js/search-index.js` | Indice di ricerca generato |
| `assets/js/site-config.js` | Endpoint pubblici per l'invio diretto, vuoti nella demo |
| `scripts/conversion_content.py` | Guide e percorsi specifici dei reparti |
| `assets/img/reparti/SOURCES.json` | Provenienza e dimensioni delle nuove immagini |
| `CONTENT-SOURCES.md` | Verifica editoriale e fonti |
| `DESIGN-SYSTEM.md` | Identità e composizione |

Le immagini, GSAP 3.12.5, Lenis 1.1.13 e il font del marchio sono locali. Anybody e Barlow usano Google Fonts; la mappa usa Google Maps quando attivata.

## Verifica

```sh
python scripts/audit_site.py
node --check assets/js/site.js
node --check assets/js/pages.js
node scripts/verify_site.cjs
node scripts/verify_contact.cjs
```

La verifica browser usa Playwright e Chrome: cerca Playwright installato localmente, oppure nell’ambiente di verifica già preparato in `%TEMP%/motorbike-design-tools`. Per prepararlo in un nuovo ambiente: `npm install --no-save playwright`. Il server deve essere in ascolto sulla porta 4175.

Controlli: tutte le pagine a 360, 768, 1024 e 1440 px; immagini, overflow, menu e focus, ricerca, filtri e cronologia, bozze email, mappa, navigazione dalla home, animazioni originali, fallback senza JS. Screenshot e report sono in `.design/previews/multipage/`, esclusi da Git.

## Pubblicazione

Sito statico compatibile con GitHub Pages e hosting statici. Non richiede variabili d’ambiente o backend. I collegamenti relativi mantengono il funzionamento sotto `/motorbike-vercelli/`.

Prima di trasformarlo nel sito ufficiale: confermare contenuti e diritti delle foto con il titolare, aggiornare dominio e metadati, completare l’informativa privacy per l’hosting scelto e rimuovere le indicazioni di demo e `noindex`. Per l’invio diretto dei moduli dal sito serve un servizio email/backend da configurare.

La revisione conversione conserva le scene originali, accorciando l'intro e i pin di caschi/officina. Le azioni della hero restano visibili durante l'entrata del marchio. Sono disponibili eventi locali per misurare azioni; nessuno strumento di tracciamento è attivato.
