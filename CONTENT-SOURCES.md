# Fonti e verifica editoriale

Verifica effettuata il 13 ottobre 2026. Archivio delle 29 pagine in `.design/research/pages.json` (materiale locale escluso da Git). Tutte le pagine rispondono HTTP 200, compreso il percorso corretto `hjc-interfoni`.

## Fonte primaria: sito dell'attività

Dominio: https://www.motorbikevercelli.com/

| Percorsi consultati | Uso nel nuovo sito |
|---|---|
| `/`, `/chi-siamo` | Identità, assortimento dichiarato, officina, ricambi, club, ragione sociale e P.IVA |
| `/moto` | Nuovo/usato e gli 11 marchi nelle immagini del sito |
| `/caschi`, `/caschi-crossover`, `/integrali`, `/jet`, `/modulari`, `/off-road` | Categorie e immagini caschi |
| `/interfoni`, `/cardo`, `/hjc-interfoni`, `/interphone`, `/midland`, `/sena` | Marchi, famiglie di comunicazione; nessuna promessa tecnica o stock dal vecchio catalogo |
| `/abbigliamento`, `/giacche`, `/pantaloni`, `/guanti`, `/scarpe`, `/stivali`, `/tute` | Categorie, immagini, marchi Spidi/Ixon e verifica magazzini dei marchi |
| `/cross-fox` | Reparto Fox e immagine del brand |
| `/accessori`, `/accessori-vari`, `/lubrificanti`, `/pneumatici`, `/scarichi` | Categorie e immagini; testi riscritti dove il sito originale duplicava il testo off-road |
| `/contatti` | Via Trino 200, email Gmail, telefono, orari |

Il collegamento N-Com del menu originale rimanda alla home: nessuna scheda tecnica dedicata verificabile. La nuova pagina N-Com offre informazioni di contatto e verifica compatibilità, senza dati inventati.

## Riscontri esterni

- [BER Racing, store locator](https://storelocator.berracing.it/): riscontro di telefono, email, indirizzo e ragione sociale.
- [Forma Boots, punti vendita Italia](https://www.formaboots.com/punti-vendita-italia/): riscontro dell'attività in Via Trino 200.
- [Tytanu, scheda Motorbike](https://tytanu.com/annuncio/negozi-abbigliamento-moto/piemonte/motorbike-vercelli/): riporta 4,8 su 195 recensioni. La home attribuisce il dato alla directory e usa sintesi delle opinioni, senza nomi o citazioni individuali non verificabili. Gli orari della directory differiscono da quelli ufficiali: usati gli orari del sito dell'attività.
- [NuovaOpinione](https://www.nuovaopinione.it/vercelli/concessionarie-auto-moto/motorbike-vercelli-1539): riscontro delle opinioni generali; rating e orari meno recenti non utilizzati.

## Immagini

22 immagini importate e ottimizzate in `assets/img/reparti/`. Le URL originali, le dimensioni e i testi alternativi sono conservati in `assets/img/reparti/SOURCES.json`. Fotografie e marchi sono materiali dell'attività e dei brand già presenti sul sito originale. La foto dell'ingresso proviene dalla scheda pubblica Tytanu già usata nella demo precedente. La galleria officina precedente contiene un dettaglio ritagliato della stessa fotografia, dichiarato come tale.

Non sono necessarie immagini generate. Le immagini di categoria non indicano che quel modello sia disponibile oggi. Prima dell'uso ufficiale il titolare deve confermare i diritti dei materiali e i contenuti.

## Scelte editoriali

Nessun prezzo, promozione finanziaria, evento futuro, promessa di permuta, disponibilità in tempo reale o recensione inventata. I numeri dell'assortimento restano quelli presentati dall'attività, non un conteggio di magazzino aggiornato. Modelli degli interfoni riassunti come famiglie da verificare, senza ricopiare specifiche potenzialmente vecchie. Le richieste preparano bozze email e non dichiarano un invio dal sito.
