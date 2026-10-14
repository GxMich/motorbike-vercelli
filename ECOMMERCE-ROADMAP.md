# Possibile evoluzione e-commerce

Questa demo presenta reparti e raccoglie richieste tramite bozze email. Non contiene
catalogo commerciale, prezzi, disponibilità, carrello o pagamenti simulati.

## Primo passo: catalogo reale

Definire con Motorbike chi aggiorna dati, foto, SKU, marchi e disponibilità e come
si collegano al gestionale. Per l’abbigliamento, modellare taglia e colore come
varianti separate; per ricambi e accessori, registrare la compatibilità verificata.
Il nuovo/usato necessita di schede con fotografie, caratteristiche e stato reali.

I dati di reparto oggi sono centralizzati in `scripts/build_site.py`; i componenti
HTML e le classi del design sono riutilizzabili per un futuro catalogo. Non serve
migrare framework per aggiungere pagine prodotto statiche e un CMS, se questo
risponde alle esigenze iniziali.

## Vendita online, dopo una decisione del titolare

Scegliere piattaforma commerciale, gestione ordini e integrazione con il magazzino.
Valutare una soluzione gestita oppure un backend dedicato in base al gestionale e
al numero di prodotti. Servono sincronizzazione stock, prezzi e imposte, varianti,
filtri, carrello persistente, spedizioni, resi e condizioni di vendita.

Il pagamento deve usare un provider autorizzato con checkout sicuro, webhook
verificati e gestione idempotente degli ordini. Le chiavi restano sul server.
Per gli acquisti evitare di accettare come attendibili prezzi e disponibilità
inviati dal browser.

## Richieste e operatività

Prima ancora dell’e-commerce si può attivare un backend per le richieste, con
validazione server, protezione da abuso, recapito email verificato, gestione degli
errori e informativa privacy aggiornata. Un form di officina non diventa un sistema
di prenotazione senza calendario, disponibilità e conferma esplicita.

Prima del sito ufficiale: autorizzazione del titolare, diritti delle fotografie e
dei marchi, contenuti commerciali aggiornati, dominio controllato e canonical
corrette. Solo allora rimuovere disclaimer/noindex e aggiornare sitemap e dati
strutturati. Nessuna di queste integrazioni è attivata nella demo.
