# Motorbike Vercelli — rapporto di redesign

Revisione del 14 ottobre 2026. Aggiornamento del repository GitHub autorizzato
dall’utente al termine delle correzioni. Nessun cambiamento al sito ufficiale.
Anteprima locale su http://127.0.0.1:4176/motorbike-vercelli/.


## Correzione richiesta: card e animazioni

Correzione successiva della serranda: su richiesta esplicita dell’utente, la scena
resta fissata quando la fotografia è interamente visibile. Lo scroll alza soltanto
la serranda, senza apertura automatica; quando è completamente aperta, il pin
termina e la pagina prosegue. Il tratto richiede 400–800 px di scroll, adattati
all’altezza disponibile. L’intera composizione rimane ferma a ogni larghezza,
incluso `workshop-copy`: testo e fotografia condividono lo stesso pin, anche su
mobile e finestre basse. La foto è dimensionata tra testata e barra contatti.
Il movimento ridotto rimuove pin e spaziatori e lascia
la foto visibile. Screenshot e risultati della verifica corrente sono in
`.design/previews/shutter/`. Le altre animazioni restano attive.

Verifica corrente della serranda: **171/171 controlli** su home e officina a
320/375/390/768/1280/1920 px e 844×390. Verificati foto intera e ferma e testo
fermo durante l’apertura, ripresa dello scroll di entrambi a completa apertura,
rotella e PageDown, menu durante il pin,
ancora diretta al modulo, ridimensionamento, movimento ridotto e assenza di
errori JavaScript. Corretto anche lo spostamento delle ancore dirette causato
dallo spazio del pin. La precedente revisione ha superato **117/117 controlli
card/motion**; due analisi
axe WCAG A/AA sulla scena aperta (home desktop e officina mobile) senza violazioni.
Confermati anche i link diretti `index.html#visita` e `officina.html#richiesta` su
mobile. Audit locale: 35 pagine, 1970 riferimenti, zero errori; sintassi JS valida.
Le misure Lighthouse e le suite generali riportate sotto risalgono alla revisione
precedente; non sono state rieseguite per questa correzione della serranda.

La prima semplificazione aveva ridotto eccessivamente la presenza del movimento.
Le card usavano lo stesso trattamento per fotografie, prodotti e loghi, lasciando
cornici bianche non curate. Entrambi gli aspetti sono stati rivisti direttamente:

- Foto contenute in una cornice con misure stabili, senza il precedente problema
  delle altezze percentuali. Ritagli pertinenti, loghi senza deformazione e
  pantaloni con proporzioni intere. Corpo antracite, spaziature coerenti, CTA
  allineate alla stessa altezza nella riga e hover senza spostare il layout.
- Hero con titoli coordinati su tutte le pagine, card animate al loro ingresso
  nel viewport, feedback animato dei filtri, movimento delle foto editoriali e
  del footer. Tornano una composizione dei cinque tipi di casco e la serranda
  dell’officina, adattate allo scroll naturale.
- GSAP e ScrollTrigger sono locali; quest’ultimo è caricato dopo il paint della
  hero. Reduced motion rimuove le scene e rivela la foto officina; anche il cambio
  della preferenza dopo aver usato un filtro lascia il contenuto pienamente visibile.
- `verify_motion_cards.cjs`: **117/117** controlli. Geometria card alle sei larghezze
  su otto pagine rappresentative, allineamento CTA, accessibilità dei quattro
  reparti, hover, animazioni effettive durante lo scroll, filtri, shutter, fallback.
  Restano **662/662** verifiche generali, **118/118** premium e **17/17** contatti.
- Screenshot aggiornati in `.design/previews/card-motion/`. Nessuna pubblicazione
  remota. La riduzione del movimento resta una preferenza di accessibilità,
  non la modalità predefinita del sito.

## Analisi e priorità

Base: HTML/CSS/JavaScript statici, 35 pagine, generatore Python senza dipendenze per
gli HTML, GSAP/ScrollTrigger/Lenis locali, fotografie e categorie già disponibili.
Nessuna migrazione a framework, e-commerce, catalogo simulato o backend nuovo.

Consultate le 29 pagine ufficiali accessibili e le 35 pagine della demo: HTTP 200
per tutte. Confrontati reparti, categorie, servizi e contatti. Fonti e incongruenze
sono documentate in CONTENT-SOURCES.md; gli archivi sono in `.design/research/`.
Il link N-Com originale ritorna alla home. Accessori vari e scarichi riutilizzano
testi sui caschi off-road. Gli orari ufficiali sono pubblicati, senza eccezioni per
festività. Promozioni, quantità, stock e diritti delle foto richiedono conferma.

Funzioni utili conservate: pagine categoria, ricerca locale, filtri con URL e
cronologia, breadcrumb, FAQ, richieste precompilate, moduli con riepilogo e copia,
contatti rapidi, mappa su richiesta e navigazione senza JavaScript.

Problemi della base: introduzione obbligatoria, scene bloccate durante lo scroll,
stesso assortimento ripetuto, quantità storiche presentate come attuali,
recensioni sintetiche, troppa enfasi sull’effetto rispetto al percorso commerciale.
La priorità è passare dalla fotografia reale a scelta del reparto, contatto e visita.

## Modifiche implementate

- Homepage ridotta da 10 a 7 sezioni: hero del negozio, tre esigenze rapide,
  sei reparti, officina, prova in negozio, community e visita. I due reparti principali
  hanno fotografie ampie; i quattro secondari diventano righe compatte su smartphone.
- Titoli Barlow Condensed, testo Barlow, palette grafite/bianco caldo/rosso racing,
  griglie editoriali, footer operativo e un unico CSS attivo `premium.css`.
  Card di categoria con foto a piena cornice, testo su antracite, CTA allineate
  e trattamento specifico per loghi e immagini scontornate.
- Hero con CTA immediatamente disponibili. Foto mobile ritagliata dallo stesso
  originale verificato, per mantenere nitidezza senza scaricare una grande immagine
  orizzontale. Nessun materiale AI.
- GSAP e ScrollTrigger su tutte le pagine: ingressi coordinati dei titoli, reveal
  delle card, ventaglio di cinque immagini caschi, profondità fotografica e serranda
  officina in home e pagina dedicata. Scroll nativo, nessuna intro obbligatoria;
  soltanto la scena serranda resta fissata durante l’apertura richiesta dall’utente.
- Navigazione condivisa: focus nel menu, Escape, ritorno al pulsante, resto della
  pagina inert durante l’apertura. Barra contatti mobile con spazio riservato.
- Reparti con consigli specifici, categorie e percorsi distinti. Dettagli categoria
  mostrano al massimo tre reparti correlati, riducendo ripetizioni e lunghezza.
- Modulo moto dedicato: nuovo/usato, marca o modello, budget facoltativo e recapito.
  Lo stesso contesto si precompila nel modulo contatti dai collegamenti dei marchi.
- Moduli officina/contatti/moto con validazione, bozza locale, copia e invalidazione
  del riepilogo dopo una modifica. Nessuna conferma di invio o prenotazione fittizia.
- Rimossi stock storici, rating, sintesi di recensioni e stato “aperto ora”.
- Font locali WOFF2; immagini WebP responsive, lazy loading, dimensioni intrinseche
  corrette e priorità della fotografia LCP. Originali preservati.
- Title e description univoci, un H1 per pagina, canonical e Open Graph della demo,
  schema WebPage con attività verificata come oggetto della proposta, sitemap di
  32 pagine di contenuto. Disclaimer e noindex/nofollow restano attivi.
- Fonte di una panoramica non ricostruita: immagine esclusa dalla nuova versione.

## Pagine aggiornate

Home, negozio, moto, caschi, abbigliamento, interfoni, cross, accessori, officina,
Aquile Vercellesi e contatti; tutte le 21 pagine di categoria; ricerca, privacy e 404.
Totale: 35 pagine. `proposta.html` e PITCH.md sono materiale locale escluso da Git;
non sono pagine pubbliche e non fanno parte del redesign né dei 35 test di pagina.

## Verifiche effettive

- `audit_site.py`: 35 pagine, 1.970 riferimenti locali, zero file/ancore mancanti
  e zero ID duplicati. Source responsive mobile controllato anche nel browser.
- `verify_site.cjs`: **662/662 controlli**. Tutte le pagine a **320, 375, 390, 768,
  1280 e 1920 px**, sotto `/motorbike-vercelli/`. Zero overflow, errori JavaScript
  o risposte 404 per asset locali. Menu, ricerca, filtri/cronologia, form, mappa,
  riduzione del movimento, fallback senza JavaScript e navigazione dalla home.
- `verify_contact.cjs`: **17/17 controlli**, inclusi recapito invalido, richiesta
  con solo telefono, precompilazione e allineamento del menu. Endpoint futuro
  testato tramite intercettazioni: successo, HTTP 429, rifiuto con HTTP 200 e
  errore di rete. **Nessun messaggio inviato realmente**.
- `verify_premium.cjs`: **118/118 controlli**. Tutte le immagini caricate e
  decodificate, anche lazy; tutte le destinazioni del menu percorse; campi moto,
  budget e copia reale negli appunti; dati vuoti/spazi/messaggio breve/data passata;
  focus ciclico, Escape, GSAP assente, reduced motion cambiata a runtime.
- Axe: **nessuna violazione rilevata** nelle 35 pagine mobile, sei pagine principali
  desktop, menu aperto e riepilogo. Inclusi i controlli WCAG 2.1 A sulle pagine.
  Non equivale a una certificazione: verifica automatica integrata da osservazione
  visiva, tastiera e focus.
- Ultima rifinitura hero: **6/6** controlli alle sei larghezze, variante portrait
  effettivamente selezionata su mobile, zero errori runtime/violazioni axe.
- Telefono/email: URI corretti, verificati senza chiamare o inviare email. I link
  HTTPS esterni attivi rispondono HTTP 200. Google Maps indicazioni presenta il
  consenso Google; il percorso contiene indirizzo e intent corretti. La mappa
  incorporata carica HTTP 200 e visualizza il segnaposto Motorbike in Via Trino 200.
- Generatore idempotente, 35 title univoci, schema JSON valido e 32 URL di sitemap
  corrispondenti a pagine reali. Sintassi JavaScript e `git diff --check` validi.
- Screenshot desktop/mobile prima e dopo e screenshot finali delle pagine principali
  in `.design/previews/`; screenshot completi correnti in `.design/previews/premium/`.

I primi test hanno rilevato l’indice di ricerca non caricato e un disallineamento di
mezzo pixel nel menu: corretti e testati nuovamente. I moduli futuri ripristinano
anche lo stato corretto dei campi moto dopo un reset o un errore.

## Lighthouse mobile misurato

Chrome locale, Lighthouse 13.5.0, profilo mobile con throttling simulato, server
statico Python e noindex mantenuto. I report HTML/JSON sono in
`.design/previews/premium/lighthouse-*.{html,json}`.

| Pagina | Performance | Accessibilità | Best Practices | SEO demo | LCP lab | CLS lab |
|---|---:|---:|---:|---:|---:|---:|
| Homepage | 89 | 100 | 100 | 66 | 3.6 s | 0 |
| Caschi | 91 | 100 | 100 | 66 | 3.4 s | 0 |
| Abbigliamento | 90 | 100 | 100 | 66 | 3.6 s | 0 |
| Moto | 88 | 100 | 100 | 66 | 3.8 s | 0 |
| Officina | 90 | 100 | 100 | 66 | 3.2 s | 0 |
| Contatti | 91 | 100 | 100 | 66 | 3.3 s | 0 |

Il solo audit SEO fallito è il blocco di indicizzazione voluto (`noindex`). Tutti
gli altri controlli SEO automatici applicabili passano. Non è stato disattivato
noindex per ottenere un punteggio maggiore. Questi punteggi sono stati rimisurati
dopo il ripristino del movimento: non sono quelli della prima versione più statica.
Performance mobile: 88–91; l’obiettivo ≥90 non è raggiunto nelle misure correnti di
home (89) e moto (88). Il movimento richiesto è mantenuto. La preparazione delle
scene e il caricamento di ScrollTrigger avvengono dopo il primo paint della foto
hero, preservando CTA immediate e caricamento più leggero della prima schermata.

Sono misure di laboratorio, non dati di traffico reale o garanzie. LCP home resta
sopra 2,5 s nel profilo simulato; eventuali ulteriori miglioramenti dipendono anche
da fotografia finale, compressione/cache dell’hosting e device. INP e prestazioni
su telefoni fisici non sono stati misurati. Nessuna promessa di ranking SEO.

## Informazioni e autorizzazioni ancora necessarie

Confermare con il titolare orari e festività, contatti/ragione sociale, permanenza
dei marchi e delle autorizzazioni dichiarate, servizi officina per marca e attività
del club. Confermare i diritti delle fotografie del negozio, dell’officina, delle
persone e dei brand; la foto ingresso proveniente da Tytanu richiede autorizzazione
o sostituzione con uno scatto fornito dal titolare. Il registro immagini distingue
origine verificata e autorizzazione ancora da ottenere.

Per un miglioramento fotografico servono scatti attuali dello showroom, del
personale consenziente, della prova casco e della strumentazione officina. Una sola
fotografia officina distinta era verificabile: non sono stati creati falsi scatti.

## Lavori che richiedono backend o autorizzazione

Invio email dal sito: endpoint del titolare o backend, validazione server,
protezione da abuso e privacy aggiornata. Prenotazioni reali: calendario e conferma
di disponibilità. Catalogo/prezzi/stock/carrello/pagamenti/ordini: dati reali e
piattaforma gestionale/commerciale autorizzata, descritti in ECOMMERCE-ROADMAP.md.
Per il sito ufficiale servono approvazione, dominio controllato, nuove canonical,
informativa definitiva e rimozione concordata di disclaimer/noindex. Nessuna di
queste operazioni esterne è stata eseguita.
