# Motorbike Vercelli — redesign premium

Sito statico multipagina: 35 pagine HTML, fotografia autentica, navigazione e
componenti condivisi. Compatibile con GitHub Pages sotto `/motorbike-vercelli/`.
Questa è una **proposta dimostrativa non ufficiale**, protetta da `noindex, nofollow`.
Repository della demo: https://github.com/GxMich/motorbike-vercelli.
Il sito ufficiale di Motorbike non viene modificato.

## Anteprima

```sh
python scripts/serve.py --port 4175
```

Aprire http://127.0.0.1:4175/. Per riprodurre la sottocartella GitHub Pages:

```sh
python scripts/serve.py --port 4176 --base /motorbike-vercelli/
```

Aprire http://127.0.0.1:4176/motorbike-vercelli/. Nessuna build, installazione npm o
servizio backend è necessaria per usare il sito.

## Modifica dei contenuti

- `scripts/build_site.py`: layout condivisi, reparti, categorie, moduli, SEO e sitemap.
- `scripts/home_content.py`: composizione "Paddock Racing" della homepage (partenza, manifesto, linee, reparti, griglia marchi, pit stop, prova, club, traguardo).
- `scripts/conversion_content.py`: guide caschi, percorsi nuovo/usato e servizi officina.
- `assets/css/premium.css`: unico CSS attivo per tutte le pagine.
- `assets/js/pages.js`: menu, ricerca, filtri, moduli, copia e mappa.
- `assets/js/site.js`: motion system GSAP (preloader, tendina tra le pagine, titoli a maschera, ticker, reparti orizzontali, serranda officina, cursore e pulsanti magnetici, Lenis solo su desktop).
- `assets/js/site-config.js`: eventuali endpoint pubblici; vuoti nella demo.
- `assets/media-manifest.json`: dimensioni reali e varianti responsive delle immagini.

```sh
python scripts/build_site.py
```

Il generatore non richiede dipendenze. Gli HTML generati sono inclusi nel repository.
I CSS precedenti restano come materiale storico e non vengono caricati.
GSAP e ScrollTrigger locali gestiscono il movimento; Lenis rende morbido lo scroll
con la rotella solo su desktop, mentre su touch lo scroll resta nativo. La scena officina resta
fissata durante l’apertura della serranda richiesta dall’utente, poi lo scroll
prosegue normalmente. Con movimento ridotto la foto è subito visibile, senza pin.
Tutti i font sono locali in WOFF2, con licenza OFL: Barlow per il testo e il logo,
Saira variabile (sottoinsieme latino) per i titoli.

`scripts/prepare_assets.py` è uno strumento facoltativo di manutenzione (Pillow e
requests): preserva gli originali, genera WebP responsive e prepara i font locali.
Non è necessario eseguirlo per avviare o rigenerare il sito. Le fonti dei font sono
in `assets/fonts/SOURCES.json`; le fotografie sono documentate in CONTENT-SOURCES.md.

## Funzionalità

Menu con tastiera, Escape e ritorno del focus; ricerca locale, filtri con URL e
cronologia, guide ai caschi, FAQ, collegamenti telefonici/email, indicazioni Google
Maps e mappa caricata su richiesta. Barra contatti mobile dopo lo scroll con spazio
riservato a fondo pagina. Fallback senza JavaScript e senza GSAP.

I moduli officina, moto e contatti validano i campi, preparano un riepilogo,
aprono una bozza nel programma di posta e consentono di copiare il messaggio.
**Non inviano email dal sito e non confermano prenotazioni.** La richiesta moto
include nuovo/usato, marca o modello e budget facoltativo. Per attivare un invio
diretto autorizzato vedere CONTACT-SETUP.md e aggiornare la privacy prima dell’uso.

## Verifiche

```sh
python scripts/audit_site.py
node --check assets/js/pages.js
node --check assets/js/site.js
node scripts/verify_site.cjs http://127.0.0.1:4176/motorbike-vercelli/
node scripts/verify_contact.cjs
node scripts/verify_premium.cjs
node scripts/verify_motion_cards.cjs
node scripts/verify_shutter.cjs
node scripts/lighthouse_premium.mjs
```

Le verifiche browser usano Playwright e Chrome; `CHROME_PATH` indica un eseguibile
diverso da quello predefinito di Windows. Le verifiche premium richiedono
anche `@axe-core/playwright`; Lighthouse richiede `lighthouse`. Nella sessione QA
gli strumenti sono in `.design/qa-tools`, esclusi da Git. Per prepararli:

```sh
npm install --prefix .design/qa-tools --cache .design/npm-cache --no-save playwright @axe-core/playwright lighthouse
```

Screenshot e report misurati sono in `.design/previews/premium`; i risultati
effettivi della revisione sono in REDESIGN-REPORT.md. Non usare risultati di
revisioni precedenti come misura del sito corrente.

## Pubblicazione

Nessun e-commerce, analytics o backend attivo. Canonical e Open Graph puntano alla
demo, mai al dominio ufficiale. La sitemap contiene le 32 pagine di contenuto;
ricerca, privacy e 404 non sono nella sitemap. Il noindex resta in ogni pagina.

Prima del sito ufficiale confermare contenuti, orari, autorizzazioni commerciali e
diritti delle immagini con il titolare. Aggiornare dominio, metadata, privacy e
integrazioni; rimuovere noindex solo dopo l’autorizzazione. Le possibilità future
sono descritte separatamente in ECOMMERCE-ROADMAP.md.
