# Motorbike Vercelli — sistema grafico premium

Grafite #17191b, antracite #222528, bianco caldo #f5f3ee, grigio testo #bdc1c4,
rosso racing #c9232b. Barlow Condensed Bold per titoli, Barlow per testi e azioni,
Barlow Condensed ExtraBold Italic per il marchio. Tutti i caratteri sono locali.

La fotografia del negozio apre la homepage; i tre percorsi rispondono a esigenze
reali. I reparti hanno due immagini principali e quattro accessi compatti. Officina
e prova in negozio sono due composizioni editoriali alternate. Community breve,
contatti conclusivi e footer operativo completano la pagina.

Spaziature basate su 8 px, contenitore massimo 1600 px, margini adattivi 20–88 px.
Raggio 2 px solo sui controlli. Nessuna texture, glow o pannello in vetro. Contrasti
uniformi e testi di lettura con lunghezza controllata. Foto dei prodotti presentano
le categorie, senza prezzi, disponibilità o schede commerciali simulate.

Il mobile riduce i quattro reparti secondari a righe fotografiche, usa menu a due
colonne e moduli a colonna singola. I contatti fissi riservano spazio a fondo pagina.
Titoli e immagini hanno misure stabili. Focus visibile, HTML semantico, menu inert e
riduzione del movimento fanno parte dei componenti condivisi.

Il CSS attivo è assets/css/premium.css. Il linguaggio motion corrente è descritto
in PROJECT-MOTION-BRIEF.md; lo storico è conservato nella cartella locale .design/archive/.

Correzione card e motion: le category-card hanno fotografia a piena cornice,
testo su antracite e azioni allineate. I loghi degli interfoni e il pantalone su
fondo neutro mantengono una cornice adatta alla loro forma; nessuna deformazione.
GSAP e ScrollTrigger animano hero e card su tutte le pagine, il ventaglio di
caschi e la serranda dell’officina, senza introduzione obbligatoria. Su richiesta
dell’utente, testo e fotografia della scena officina restano fissati insieme
a ogni larghezza mentre lo scroll alza la serranda;
la pagina riprende a scorrere a completa apertura. Nessun altro elemento è fissato.
