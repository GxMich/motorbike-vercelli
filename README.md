# Motorbike Vercelli

Demo di aggiornamento del sito Motorbike Vercelli. Il percorso presenta negozio, caschi, abbigliamento, moto e officina, con fotografie reali e animazioni di ispirazione motociclistica.

**Demo:** https://gxmich.github.io/motorbike-vercelli/

Non è il sito ufficiale dell'attività. La demo mantiene `noindex, nofollow`. Il modulo officina è dimostrativo e non invia dati; telefono, email e indicazioni sono collegamenti diretti.

## Sviluppo

Sito statico in HTML, CSS e JavaScript, senza build.

```sh
python -m http.server 4175
```

Aprire http://localhost:4175/.

## Struttura

- `index.html`: contenuti e struttura della pagina.
- `assets/css/style.css`: layout e scene animate.
- `assets/css/bike.css`: colori, materiali e tipografia.
- `assets/css/content.css`: navigazione, contenuti ampliati e footer.
- `assets/js/site.js`: animazioni, menu, orari e modulo dimostrativo.
- `assets/img/`: fotografie e marchi.
- `assets/fonts/`: Barlow Condensed ExtraBold Italic, con licenza SIL OFL inclusa.
- `assets/vendor/`: GSAP, ScrollTrigger e Lenis.

GSAP 3.12.5 e Lenis 1.1.13 sono inclusi localmente. I font Anybody e Barlow e la mappa usano servizi esterni. La modalità con movimento ridotto presenta i contenuti senza scene bloccate durante lo scroll.

## Pubblicazione

GitHub Pages pubblica il ramo `main` dalla cartella principale. `.nojekyll` consente di servire direttamente i file statici. I percorsi degli asset sono relativi e funzionano anche sotto `/motorbike-vercelli/`.

## Fonti e materiali

I servizi sono tratti dal [sito ufficiale](https://www.motorbikevercelli.com/chi-siamo). La galleria usa lo scatto reale dell'officina già presente sul sito, un dettaglio dello stesso scatto e una [foto pubblica dell'ingresso](https://tytanu.com/annuncio/negozi-abbigliamento-moto/piemonte/motorbike-vercelli/).

Prima di trasformare la demo nel sito ufficiale: confermare servizi, foto e orari con il titolare, collegare il modulo a un servizio di invio, aggiornare i metadati per il dominio definitivo e rimuovere le indicazioni di demo e `noindex`.
