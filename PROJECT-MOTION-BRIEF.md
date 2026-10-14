# Motorbike Vercelli — identità e movimento

## Redesign premium, 14 ottobre 2026 — decisioni correnti

Correzione richiesta dall’utente: le category-card vanno riprogettate e il movimento
deve tornare percepibile, recuperando il carattere della versione precedente.
Homepage più breve, fotografia autentica, CTA immediate e scroll naturale restano.

Grafite #17191b, antracite #222528, bianco caldo #f5f3ee, rosso #c9232b.
Titoli Barlow Condensed, testi Barlow, marchio locale Barlow Condensed italic.

- GSAP locale e ScrollTrigger su tutte le pagine. Ingresso coordinato delle righe
  hero, 850 ms, power3.out; titoli 28 px, fotografie 24 px. CTA sempre disponibili.
- Fotografia hero statica: scelta affinata dopo la misura Lighthouse per non
  ritardare il Largest Contentful Paint.
- Reveal leggibili di titoli, fotografie e gruppi di card durante lo scroll:
  650–850 ms, stagger 80 ms. Il contenuto rimane visibile in partenza.
- Composizione caschi recuperata in home: cinque fotografie delle tipologie si
  aprono a ventaglio al passaggio della sezione. Nessuna quantità di magazzino.
- Serranda officina: l’ultima richiesta autorizza esplicitamente il pin della
  scena. Quando la foto è interamente visibile, resta ferma mentre lo scroll alza
  soltanto la serranda. A completa apertura il pin termina e la pagina prosegue.
  Ferma sempre l’intera composizione, incluso `workshop-copy`, anche su mobile
  e finestre basse. Quando testo e foto non entrano insieme, la foto rimane
  interamente visibile e il testo conserva la sua posizione durante il pin.
  Altezza della foto adattata allo spazio tra testata e barra
  contatti, scrub diretto senza ritardo e nessuna apertura automatica. Durante
  il ridimensionamento la foto rimane centrata; le ancore dirette mantengono
  la posizione del modulo anche dopo l’inserimento dello spazio del pin.
- Fotografie editoriali: profondità verticale contenuta (24 px desktop, 12 mobile).
- Hover card fotografici con puntatore fine: scala 1.055, 550 ms, freccia 3 px,
  bordo rosso. Nessun cambio delle dimensioni esterne della card.
- Pulsanti: colore 180 ms, pressione 1 px. Menu 240 ms, voci senza ritardo.
- Scroll nativo, con un solo tratto fissato per la serranda richiesto dall’utente.
  Nessun Lenis o intro obbligatoria. Parallax solo nelle fotografie editoriali.
- Reduced motion: ingressi e zoom disattivati, menu immediato.
- Senza JS/GSAP: contenuto completo e link; contatti diretti sostituiscono i moduli.
- Verifica richiesta: 320/375/390/768/1280/1920 px, menu e tastiera,
  CTA, moduli, asset e console. Esiti della revisione in REDESIGN-REPORT.md.

Lo storico delle revisioni precedenti è conservato in `.design/archive/motion-brief-history.md`.
Le decisioni correnti derivano dalla richiesta di redesign premium e dalle misure Lighthouse.
