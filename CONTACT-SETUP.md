# Attivare le richieste dirette

La demo attuale prepara bozze email: `assets/js/site-config.js` ha endpoint vuoti. Nessun messaggio viene inviato a un server in questa configurazione.

Il frontend è predisposto per Formspree, compatibile con hosting statico e GitHub Pages. Per attivarlo:

1. Il titolare crea un modulo nel proprio account Formspree e verifica l'indirizzo destinatario del negozio.
2. Inserire l'endpoint pubblico `https://formspree.io/f/ID_MODULO` in `contactEndpoint` in `assets/js/site-config.js`. Non inserire password o chiavi API nel progetto.
3. Se officina e contatti devono usare moduli diversi, impostare anche `workshopEndpoint`. Se resta vuoto, l'officina usa `contactEndpoint`.
4. Configurare nell'account il dominio consentito, i filtri antispam e l'eventuale CAPTCHA compatibile. L'integrazione gestisce le risposte di errore; un CAPTCHA richiesto dal provider va integrato prima dell'attivazione.
5. Aggiornare l'informativa della versione ufficiale per descrivere il provider e il trattamento delle richieste. I moduli indicano il servizio quando attivato.
6. Verificare un invio effettivo concordato con il titolare: conferma sul sito, presenza della richiesta nel servizio e ricezione nella casella destinataria. I test locali intercettano le richieste e **non inviano email reali**.

Il pulsante passa automaticamente da “Prepara la bozza email” a “Invia la richiesta”. Durante l'invio i campi sono disabilitati; la conferma appare soltanto dopo una risposta positiva del servizio. In caso di errore la richiesta resta nei campi e si può usare la bozza email. La data dell'officina rimane una preferenza, non un appuntamento confermato.

Riferimento: [Formspree, invio AJAX](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax).

## Misurare le azioni

Il sito emette eventi locali `motorbike:conversion` con `detail.action` e `detail.page`:

- `phone_click`: clic sul telefono, non prova di una telefonata completata.
- `directions_click`: clic sulle indicazioni, non prova di una visita.
- `email_click`: apertura della bozza/client, non prova di un'email inviata.
- `request_draft`: bozza preparata, non richiesta ricevuta.
- `request_submitted`: richiesta accettata dal servizio, non appuntamento confermato.

Gli eventi non contengono dati dei moduli, non vengono salvati e non vengono trasmessi dal progetto. Un sistema di misurazione scelto dal titolare può ascoltarli; prima dell'attivazione vanno predisposti informativa e gestione delle preferenze appropriate.
