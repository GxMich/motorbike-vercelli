"""Generate portable HTML pages. Run from the repository root; no dependencies."""
from pathlib import Path
from html import escape
import json
import re
from conversion_content import home_paths, helmet_guide, moto_paths, workshop_navigation

ROOT = Path(__file__).resolve().parent.parent
MAP = 'https://www.google.com/maps/dir/?api=1&amp;destination=Motorbike+Vercelli+Via+Trino+200+13100+Vercelli'
NAV = [('negozio','Il negozio'),('moto','Moto'),('caschi','Caschi'),('abbigliamento','Abbigliamento'),('interfoni','Interfoni'),('cross','Cross'),('accessori','Accessori'),('officina','Officina'),('club','Aquile Vercellesi'),('contatti','Contatti')]
TITLE = dict(NAV)

def link(slug, label=None, cls=''):
    return f'<a href="{slug}.html" class="{cls}">{label or TITLE.get(slug, slug)}</a>'

def header(current):
    primary = [('caschi','Caschi'),('abbigliamento','Abbigliamento'),('moto','Moto'),('officina','Officina'),('contatti','Contatti')]
    links = ''.join(f'<a href="{s}.html"'+ (' aria-current="page"' if s == current else '') +f'>{n}</a>' for s,n in primary)
    menu = ''.join(f'<li><a href="{s}.html"'+ (' aria-current="page"' if s == current else '') +f'>{n}</a></li>' for s,n in [('index','Home')]+NAV)
    return f'''<header class="top" id="top"><div class="wrap">
      <a class="logo" href="index.html" aria-label="Motorbike Vercelli, home"><img src="assets/img/logo-mark-light.png" alt="" width="400" height="347"><span>Motorbike<small>VERCELLI</small></span></a>
      <nav class="header-nav" aria-label="Navigazione principale">{links}</nav>
      <a class="search-button" href="ricerca.html" aria-label="Cerca nel sito"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></a>
      <button class="btn btn-ghost menu-btn" type="button" id="menu-open" aria-expanded="false" aria-controls="menu"><svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg><span>Menu</span></button>
    </div></header>
    <div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Esplora Motorbike" inert>
      <div class="menu-head wrap"><span>Fai un giro da noi</span><button class="btn btn-ghost menu-btn menu-close" type="button" id="menu-close"><svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg><span>Chiudi</span></button></div>
      <nav class="wrap" aria-label="Tutte le pagine"><ol>{menu}</ol></nav>
      <div class="menu-foot wrap"><span class="status" data-status>Via Trino 200, Vercelli</span><a href="tel:+390161294987">0161 294987</a><a href="ricerca.html">Cerca un reparto</a></div>
    </div>'''

def footer():
    return f'''<footer class="foot" aria-label="Informazioni e collegamenti"><div class="wrap">
      <div class="foot-invite"><p>Moto, abbigliamento e officina.<br><strong>Ci vediamo in Via Trino.</strong></p>{link('contatti','Organizza la tua visita','text-link')}</div>
      <a class="foot-brand" href="index.html" aria-label="Motorbike Vercelli, home"><span class="foot-word">Motorbike</span><span class="foot-city">Vercelli</span></a>
      <div class="foot-grid">
        <div class="foot-column"><h2>Esplora il negozio</h2><ul>{''.join('<li>'+link(s,n)+'</li>' for s,n in NAV[0:4])}</ul></div>
        <div class="foot-column"><h2>Per la tua moto</h2><ul>{''.join('<li>'+link(s,n)+'</li>' for s,n in NAV[4:8])}</ul></div>
        <div class="foot-column"><h2>Passa a trovarci</h2><address>Via Trino 200<br>13100 Vercelli (VC)</address><ul><li><a href="tel:+390161294987">0161 294987</a></li><li><a href="mailto:motorbikevercelli@gmail.com">motorbikevercelli<wbr>@gmail.com</a></li><li>{link('contatti','Orari e indicazioni')}</li></ul></div>
        <div class="foot-column"><h2>La nostra community</h2><ul><li>{link('club')}</li><li><a href="https://www.instagram.com/motorbikevercelli/" target="_blank" rel="noopener">Instagram</a></li><li><a href="https://www.facebook.com/motorbikevercelli" target="_blank" rel="noopener">Facebook</a></li><li>{link('privacy','Privacy e servizi esterni')}</li></ul></div>
      </div><div class="foot-legal"><span>© <span data-year>2026</span> Motorbike Vercelli di Franco Simone · P.IVA 02496910023</span><span>Proposta di nuovo sito · versione dimostrativa</span><a class="foot-back" href="#main">Torna in cima ↑</a></div>
    </div></footer>
    <nav class="mobile-actions" aria-label="Contatti rapidi"><a href="tel:+390161294987">Chiama il negozio</a><a class="mobile-directions" href="{MAP}" target="_blank" rel="noopener">Indicazioni</a></nav>'''

def image(file, alt, cls='', eager=False):
    return f'<img class="{cls}" src="assets/img/{file}" alt="{escape(alt)}" width="1200" height="1000" '+('fetchpriority="high"' if eager else 'loading="lazy"')+'>'

def hero(slug, heading, copy, photo, alt, badge='', product=False, parent=None):
    crumb = link('index','Home') + '<span aria-hidden="true">/</span>'
    if parent:
        crumb += link(parent) + '<span aria-hidden="true">/</span>'
    crumb += f'<span aria-current="page">{TITLE.get(slug, slug)}</span>'
    request = '#richiesta' if slug == 'officina' else '#messaggio' if slug == 'contatti' else f'contatti.html?reparto={slug}#messaggio'
    action = 'Prepara una richiesta' if slug == 'officina' else 'Scrivi al negozio' if slug == 'contatti' else 'Chiedi informazioni'
    if slug == 'caschi': request,action = '#scegli','Trova il tuo tipo di casco'
    if slug == 'moto': request,action = '#proposte','Nuova o usata?'
    return f'''<section class="page-hero {'product-hero' if product else ''}"><div class="wrap">
      <nav class="breadcrumb" aria-label="Percorso">{crumb}</nav>
      <div class="page-hero-grid"><div class="page-hero-copy"><h1 class="display">{heading}</h1><p class="lead">{copy}</p><div class="content-actions"><a class="btn btn-red" href="{request}">{action}</a><a class="text-link" href="#scopri">{'Orari e indicazioni' if slug == 'contatti' else 'Esplora il reparto'}</a></div></div>
      <figure class="page-hero-media">{image(photo,alt,eager=True)}{f'<figcaption>{badge}</figcaption>' if badge else ''}</figure></div>
    </div></section>'''

def section(title, content, light=False, id='scopri'):
    return f'<section class="page-section {"light" if light else ""}" id="{id}"><div class="wrap"><h2 class="display section-title">{title}</h2>{content}</div></section>'

def faq(items):
    return section('Prima di passare in negozio', '<div class="faq-items">'+''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q,a in items)+'</div>', id='domande')

def cta(title='Il prossimo passo è in negozio.', copy='Prova, confronta, chiedi. Ti aspettiamo in Via Trino 200 a Vercelli.'):
    return f'<section class="page-cta"><div class="wrap"><div><h2 class="display">{title}</h2><p>{copy}</p></div><a class="btn btn-red" href="contatti.html">Vieni a trovarci</a><a class="btn btn-ghost" href="tel:+390161294987">0161 294987</a></div></section>'

def textgrid(items):
    return '<div class="editorial-grid">'+''.join(f'<article><h3>{t}</h3><p>{p}</p></article>' for t,p in items)+'</div>'

# Each detail has original, concise editorial copy. Images depict categories, not stock availability.
DATA = {
'caschi': [
 ('integrali','Integrali','Una calotta chiusa, un mondo aperto.','Per strada, turismo e guida sportiva. Confronta forme, materiali e ventilazione, poi prova la taglia con noi.','Strada','Airoh, Grex, HJC, LS2 e Nolan sono tra i marchi del reparto integrali. Confronta la calzata e verifica con noi la disponibilità del singolo modello.',['La vestibilità senza punti di pressione','La visibilità e i comandi della visiera','Lo spazio per il tuo eventuale interfono']),
 ('modulari','Modulari','Praticità, a ogni sosta.','Una mentoniera apribile per chi cerca versatilità nei viaggi e negli spostamenti di ogni giorno.','Turismo','Il reparto comprende caschi modulari in policarbonato, fibre composite e carbonio. Vieni a confrontare peso, meccanismo di apertura e calzata.',['Il movimento della mentoniera','Il comfort con occhiali e interfono','Le indicazioni d’uso del singolo modello']),
 ('jet','Jet','La città, sulle due ruote.','Caschi aperti e compatti da confrontare per i tuoi tragitti urbani e in scooter.','Città','Nel reparto trovi caschi jet e demi jet. Porta con te le tue esigenze di ingombro e di comfort: vediamo insieme quale modello provarci.',['La copertura della visiera','La stabilità della calzata','L’ingombro nel vano del tuo scooter']),
 ('crossover','Crossover','Più strade. Un solo casco.','Modelli versatili con frontino e visiera: una scelta da esplorare se alterni percorsi diversi.','Adventure','I caschi crossover del reparto permettono, in base al modello, di cambiare configurazione di frontino e visiera. Confrontali pensando alle strade che percorri.',['La configurazione di frontino e visiera','La ventilazione per il tuo utilizzo','Il comfort nelle uscite più lunghe']),
 ('off-road','Off-road','Quando finisce l’asfalto.','Il reparto dedicato a cross ed enduro, con caschi da abbinare al resto dell’equipaggiamento.','Fuoristrada','Per il casco off-road, la prova va fatta insieme agli accessori che utilizzi. Porta la maschera, se ne hai già una, e confronta la calzata in negozio.',['La compatibilità con la maschera','La forma del frontino','L’equilibrio con il tuo equipaggiamento'])],
'abbigliamento': [
 ('giacche','Giacche','La tua stagione. La tua giacca.','Tessuto e pelle, capi estivi, invernali e per la mezza stagione.','Parte superiore','Il reparto giacche comprende proposte estive, invernali, di mezza stagione e quattro stagioni. Spidi e Ixon sono tra i marchi di abbigliamento trattati.',['La posizione delle protezioni quando sei in sella','La libertà di movimento delle braccia','Gli strati che indosserai sotto']),
 ('pantaloni','Pantaloni e jeans','Comodi anche dopo la sosta.','Pantaloni tecnici e jeans moto: materiali e vestibilità da provare in camerino.','Parte inferiore','In negozio trovi pantaloni tecnici e jeans pensati per la moto. Il taglio e la posizione delle protezioni vanno valutati anche piegando le gambe come in sella.',['La posizione delle protezioni sul ginocchio','La lunghezza in posizione di guida','L’abbinamento con giacca e calzature']),
 ('guanti','Guanti','Il contatto con la tua moto.','Estivi, invernali, di mezza stagione e racing. Provali pensando ai tuoi comandi.','Mani','Il reparto comprende guanti per diverse stagioni e utilizzi, anche racing. Confronta mobilità delle dita, lunghezza e chiusura prima di scegliere.',['La sensibilità sui comandi','La vestibilità sulle dita','La chiusura sul polso']),
 ('scarpe','Scarpe','Dalla moto alla città.','Calzature dal taglio urbano e tecnico per i tragitti di tutti i giorni.','Piedi','Sneakers moto e scarpe basse si affiancano ai modelli più tecnici. Vieni con le calze che usi abitualmente per confrontare taglia e comfort.',['La tenuta sul tallone','La comodità quando cammini','Lo spazio per muovere la caviglia']),
 ('stivali','Stivali','Pronti per andare lontano.','Sport, turismo e adventure: trova la calzata adatta alla tua posizione di guida.','Piedi','Gli stivali si scelgono anche in funzione di moto e percorso. In negozio puoi confrontare altezza, chiusure e flessibilità.',['La comodità della chiusura','La libertà sul cambio e sul freno','L’abbinamento con i pantaloni']),
 ('tute','Tute','Il tuo prossimo giro, in pelle.','Intere e divisibili, da provare per la guida sportiva.','Completo','Il reparto presenta tute in pelle intere e a due pezzi. La prova serve a valutare come il capo si adatta alla tua posizione di guida.',['La vestibilità in posizione raccolta','Lo spazio per le protezioni che utilizzi','L’abbinamento con guanti e stivali'])],
'accessori': [
 ('accessori-vari','Accessori e ricambi','I dettagli fanno il viaggio.','Navigatori, action cam e componenti da abbinare alla tua moto.','Accessori','Marca, modello e anno aiutano a individuare accessori e ricambi compatibili. Scrivici cosa cerchi o porta il componente in negozio.',['Marca, modello e anno della moto','Il componente o accessorio che cerchi','Le tue esigenze di montaggio']),
 ('lubrificanti','Lubrificanti','Cura, a ogni chilometro.','Prodotti per la manutenzione e la cura della moto.','Manutenzione','Motul ed Elf sono tra i prodotti disponibili per la manutenzione. Per scegliere il prodotto adatto, porta le indicazioni del manuale della tua moto.',['Le specifiche riportate nel manuale','La destinazione d’uso del prodotto','La quantità necessaria per l’intervento']),
 ('pneumatici','Pneumatici','La strada comincia da qui.','Gomme per utilizzi diversi, con servizio di cambio pneumatici in officina.','Pneumatici','In negozio puoi chiedere informazioni sugli pneumatici; l’officina è attrezzata con smontagomme. Concorda il cambio indicando moto e misure.',['Le misure dei tuoi pneumatici','I percorsi che fai più spesso','Il giorno da concordare con l’officina']),
 ('scarichi','Scarichi','Un dettaglio della tua moto.','Informazioni su scarichi e compatibilità, partendo dal tuo modello.','Componenti','Per uno scarico servono riferimenti precisi della moto e del componente. Contattaci per verificare proposta e disponibilità.',['Marca, modello e anno','Il riferimento del componente','Le caratteristiche e la documentazione del prodotto'])],
'interfoni': [
 ('cardo','Cardo','Le conversazioni viaggiano con te.','Scopri le proposte Cardo e confrontale con il tuo casco e il tuo gruppo.','Interfoni','Esplora le proposte Cardo, compresa la famiglia Freecom. Chiedi in negozio i modelli attuali e verifica la compatibilità con i dispositivi che usate.',['Il modello del tuo casco','Gli interfoni dei compagni di viaggio','L’uso in coppia oppure in gruppo']),
 ('hjc','SMART HJC','Pensato insieme al casco.','Sistemi di comunicazione da verificare con il modello HJC che utilizzi.','Interfoni','Confronta i sistemi SMART HJC partendo dal tuo casco. Indica il modello completo: l’abbinamento si verifica sul prodotto specifico.',['Il modello e la generazione del casco','La predisposizione presente','Le funzioni che utilizzi di più']),
 ('interphone','Interphone','La tua voce, in viaggio.','Una famiglia di sistemi da confrontare per i tuoi tragitti e le tue uscite.','Interfoni','Esplora la famiglia U-COM e le proposte Interphone. Per conoscere la gamma attuale e gli abbinamenti, parla con il negozio.',['La comunicazione pilota e passeggero','I dispositivi che vuoi collegare','La compatibilità con il tuo casco']),
 ('midland','Midland','Condividi la prossima curva.','Soluzioni di comunicazione per chi parte in coppia o con gli amici.','Interfoni','Confronta le proposte Midland, comprese le famiglie Rush e BT. Verifica con il negozio la soluzione adatta al gruppo e ai caschi utilizzati.',['Il numero di persone con cui viaggi','I modelli già usati dal gruppo','I comandi e il montaggio sul casco']),
 ('sena','Sena','Più connessi, sulla strada.','Confronta le proposte Sena per comunicazione e collegamento ai tuoi dispositivi.','Interfoni','Esplora le famiglie Sena, inclusa la serie 50. Modello, funzioni e disponibilità attuali si verificano direttamente in negozio.',['I dispositivi dei tuoi compagni','Le funzioni che ti servono','L’abbinamento con casco e navigatore']),
 ('n-com','N-Com','Il sistema giusto per il tuo casco.','Parti dal modello del casco per chiedere informazioni sul sistema di comunicazione.','Interfoni','Per le proposte N-Com, comunicaci il modello preciso del casco. Verifichiamo insieme il sistema compatibile e la disponibilità.',['Il nome completo del casco','L’eventuale sistema già installato','I dispositivi da collegare'])]
}

def card(group, item):
    s,n,h,d,tag,body,tips = item
    url = f'{group}-{s}'
    return f'<article class="category-card" data-category="{escape(tag)}"><a href="{url}.html"><div class="category-image">{image("reparti/"+s+".webp",n)}</div><div class="category-copy"><span class="category-kind">{tag}</span><h3>{n}<span aria-hidden="true">↗</span></h3><p>{d}</p><span class="category-more">Esplora {n.lower()}</span></div></a></article>'

def catalogue(group, title):
    items = DATA[group]
    tags = list(dict.fromkeys(x[4] for x in items))
    controls = '<div class="filter-bar" data-filters aria-label="Filtra le categorie" hidden><button class="filter active" type="button" aria-pressed="true" data-filter="all">Tutte</button>'+''.join(f'<button class="filter" type="button" aria-pressed="false" data-filter="{tag}">{tag}</button>' for tag in tags)+'</div><p class="filter-status sr" role="status" data-filter-status></p>'
    return section(title, controls+'<div class="category-grid">'+''.join(card(group,x) for x in items)+'</div><p class="catalogue-note">Le immagini presentano il reparto. Modelli, taglie, prezzi e disponibilità si verificano direttamente in negozio.</p>',True)

def form(workshop=False):
    options = ['Informazioni generali','Caschi','Abbigliamento','Moto','Interfoni','Accessori','Cross','Club'] if not workshop else ['Tagliando','Cambio pneumatici','Ricambi','Altro intervento']
    return f'''<form class="request-form" data-request-form data-workshop="{str(workshop).lower()}">
      <h3>{'Parlaci della tua moto' if workshop else 'Scrivi al negozio'}</h3>
      <p data-form-intro>Lascia un recapito e raccontaci cosa cerchi. Preparerai un messaggio da inviare al negozio.</p>
      <div class="form-grid"><div class="field"><label for="nome">Nome</label><input id="nome" name="nome" autocomplete="given-name" required maxlength="100"></div><div class="field"><label for="recapito">Telefono oppure email</label><input id="recapito" name="recapito" type="text" autocomplete="off" required maxlength="160" placeholder="Un solo recapito è sufficiente" aria-describedby="recapito-help"><span class="field-help" id="recapito-help">Scegli come preferisci essere ricontattato.</span></div></div>
      <div class="{'form-grid' if workshop else ''}"><div class="field"><label for="argomento">{'Intervento' if workshop else 'Reparto'}</label><select id="argomento" name="argomento">{''.join('<option>'+o+'</option>' for o in options)}</select></div>{'''<div class="field"><label for="request-moto">Marca e modello</label><input id="request-moto" name="moto" placeholder="Es. Honda CB500X, 2022" required maxlength="120"></div>''' if workshop else ''}</div>
      <div class="field"><label for="messaggio-input">{'Chilometri e informazioni utili' if workshop else 'Il tuo messaggio'}</label><textarea id="messaggio-input" name="messaggio" rows="4" required minlength="10" maxlength="1600" placeholder="Raccontaci di cosa hai bisogno."></textarea></div>
      {'''<details class="optional-fields"><summary>Vuoi indicare un giorno? (facoltativo)</summary><div class="field"><label for="giorno">Giorno preferito</label><input id="giorno" name="giorno" type="date"><span class="field-help">La disponibilità si concorda con l’officina.</span></div></details>''' if workshop else ''}
      <div class="form-trap" aria-hidden="true"><label>Lascia vuoto questo campo<input name="_gotcha" tabindex="-1" autocomplete="off"></label></div>
      <p class="form-note"><span data-form-note>La bozza resta sul tuo dispositivo fino all’invio dal tuo programma di posta.</span> <a href="privacy.html">Privacy</a>.</p>
      <button class="btn btn-red" type="submit" data-send>Prepara la bozza email</button>
      <p class="form-status" data-form-status role="status" tabindex="-1" hidden></p>
      <noscript><p>Per contattarci scrivi a <a href="mailto:motorbikevercelli@gmail.com">motorbikevercelli@gmail.com</a> o chiama il <a href="tel:+390161294987">0161 294987</a>.</p></noscript>
      <div class="request-preview" data-preview hidden tabindex="-1"><h4>La tua bozza è pronta</h4><p>Controlla il riepilogo. Apri il programma di posta e invia il messaggio per contattare il negozio.</p><pre data-email-preview></pre><div class="content-actions"><a class="btn btn-red" data-email-link href="mailto:motorbikevercelli@gmail.com">Apri la bozza email</a><button class="btn btn-ghost" data-copy type="button">Copia il messaggio</button></div><p data-copy-status role="status"></p>{'<p class="form-note">La data è una preferenza. L’appuntamento si conferma con l’officina.</p>' if workshop else ''}</div>
    </form>'''

def write(slug, title, desc, content, parent=None):
    if slug == 'caschi': content = content.replace('</div></section>', '</div></section>'+helmet_guide(),1)
    if slug == 'moto': content = content.replace('</div></section>', '</div></section>'+moto_paths(),1)
    if slug == 'officina': content = content.replace('</div></section>', '</div></section>'+workshop_navigation(),1)
    schema = {'@context':'https://schema.org','@type':'WebPage','name':title,'description':desc,'inLanguage':'it'}
    html = f'''<!doctype html><html lang="it" class="no-js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>{escape(title)} | Motorbike Vercelli</title><meta name="description" content="{escape(desc)}"><meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#171c21"><meta property="og:title" content="{escape(title)} | Motorbike Vercelli"><meta property="og:description" content="{escape(desc)}"><meta property="og:image" content="assets/img/og-image.jpg"><meta property="og:type" content="website"><link rel="icon" href="assets/img/favicon.png"><link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,400..900&amp;family=Barlow:wght@400;500;600;700&amp;display=swap" rel="stylesheet"><script>document.documentElement.classList.replace('no-js','js');if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reduced');</script><link rel="stylesheet" href="assets/css/style.css"><link rel="stylesheet" href="assets/css/bike.css"><link rel="stylesheet" href="assets/css/content.css"><link rel="stylesheet" href="assets/css/pages.css"><script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script><script src="assets/js/pages.js" defer></script></head><body class="bike-edition inner-page"><a class="skip" href="#main">Vai al contenuto</a>{header(parent or slug)}<main id="main">{content}</main>{footer()}</body></html>'''
    html = html.replace('class="bike-edition inner-page"',f'class="bike-edition inner-page page-{parent or slug}"')
    html = html.replace('<script src="assets/js/pages.js"','<script src="assets/js/site-config.js" defer></script><script src="assets/js/pages.js"')
    (ROOT / f'{slug}.html').write_text(html,encoding='utf-8')

def build():
    write('negozio','Il negozio','Caschi, abbigliamento, moto e officina in Via Trino 200, Vercelli.',
        hero('negozio','Il mondo della moto.<br>Da dentro.','Un casco si prova. Una giacca si indossa. Una moto si guarda da vicino. Qui hai lo spazio e il tempo per scegliere.','showroom-alto.webp','L’esposizione di Motorbike Vercelli','Via Trino 200 · Vercelli')+
        section('Tutto parte da una visita.',textgrid([('Scegli con noi','Raccontaci come usi la moto. Confrontiamo prodotti e taglie, partendo dalle tue abitudini.'),('Prova in negozio','Caschi, capi tecnici e calzature: una foto aiuta, la prova fa la differenza.'),('Continua in officina','Manutenzione, pneumatici e ricambi, allo stesso indirizzo del negozio.')]),True)+
        section('Trova il tuo reparto.','<div class="department-list">'+''.join(f'<a href="{s}.html"><h3>{n}</h3><span>Esplora il reparto ↗</span></a>' for s,n in NAV[1:8])+'</div>',id='reparti')+
        section('Una passione che si incontra.','<div class="story-split">'+image('ingresso-motorbike.jpg','L’ingresso reale di Motorbike Vercelli')+'<div><h3>Negozio, officina, punto di ritrovo.</h3><p>Motorbike è anche sede del club Moto Guzzi Aquile Vercellesi. Passa per conoscere le attività del club e per parlare di moto.</p>'+link('club','Conosci le Aquile Vercellesi','text-link')+'</div></div>',True,id='incontro')+cta())

    configs = {
      'caschi': ('La testa giusta.<br>Il casco giusto.','Integrali, modulari, jet, crossover e off-road. Parti dal tuo modo di guidare, poi trova la calzata in negozio.','caschi.webp','Il reparto caschi di Motorbike','450 caschi. Uno è il tuo.','Cinque modi di partire.'),
      'abbigliamento': ('Vestiti per<br>la prossima strada.','Dalla città al viaggio, dalla mezza stagione alla pista. Giacche, pantaloni, guanti e calzature da provare.','ixon-racing.webp','Abbigliamento Ixon nel negozio','Spidi e Ixon tra i marchi trattati','Il tuo equipaggiamento.'),
      'accessori': ('La tua moto.<br>I suoi dettagli.','Accessori, ricambi e prodotti per la manutenzione. Partiamo da marca e modello, arriviamo al componente giusto.','showroom.webp','Accessori in esposizione nel negozio','Ricambi e cura della moto','Dal viaggio alla manutenzione.'),
      'interfoni': ('Stessa strada.<br>Stessa conversazione.','Con il passeggero, con gli amici, con il navigatore. Trova il sistema da abbinare al tuo casco e ai tuoi dispositivi.','caschi.webp','Caschi in esposizione','Cardo, HJC, Interphone, Midland, Sena e N-Com','Scegli il marchio da esplorare.')
    }
    for group,(h,d,photo,alt,badge,ct) in configs.items():
        content = hero(group,h,d,photo,alt,badge)+catalogue(group,ct)
        content += section('La scelta comincia da te.',textgrid([('Raccontaci come guidi','Tragitti quotidiani, uscite del weekend o viaggi: il punto di partenza sono le tue abitudini.'),('Porta quello che usi','Casco, occhiali o un capo che vuoi abbinare: confrontare gli oggetti insieme aiuta a scegliere.'),('Verifica la disponibilità','Per modelli, colori e taglie, contatta il negozio. Possiamo verificare anche le disponibilità dei magazzini dei marchi di abbigliamento.')]),id='consigli')
        content += faq([('Posso chiedere informazioni prima di venire?','Sì. Scrivici quale categoria ti interessa oppure chiama il 0161 294987. Per un prodotto specifico indica marca e modello.'),('I prodotti mostrati sono disponibili oggi?','Le immagini descrivono le categorie. Disponibilità, taglie, prezzi e versioni dei prodotti si verificano con il negozio.')])+cta()
        write(group,TITLE[group],d,content)

    for group,items in DATA.items():
        for item in items:
            s,n,h,d,tag,body,tips = item
            slug = group+'-'+s
            TITLE[slug] = n
            content = hero(slug,h,d,'reparti/'+s+'.webp',n,'Modelli e disponibilità da confrontare in negozio',True,group)
            content += section(n+', da vicino.',f'<div class="detail-layout"><div><p class="lead">{body}</p><a class="text-link" href="contatti.html?reparto={slug}#messaggio">Chiedi di {n.lower()}</a></div><aside class="choice-note"><h3>Cosa confrontare</h3><ul>'+''.join(f'<li>{t}</li>' for t in tips)+'</ul></aside></div>',True)
            content += section('Puoi esplorare anche…','<div class="category-grid related-grid">'+''.join(card(group,x) for x in items if x[0] != s)+'</div>',id='correlati')+cta('La prova fa la differenza.','Per modelli, taglie e disponibilità, chiedi al negozio o passa in Via Trino 200.')
            write(slug,n,d,content,group)

    brands = [('beta','Beta'),('cfmoto','CFMOTO'),('fantic','Fantic'),('honda','Honda'),('kawasaki','Kawasaki'),('klmotors','KL Motors'),('kymco','Kymco'),('mondial','F.B Mondial'),('motoguzzi','Moto Guzzi'),('piaggio','Piaggio'),('suzuki','Suzuki')]
    write('moto','Moto nuove e usate','Moto nuove e usate: scopri i marchi trattati da Motorbike Vercelli.',
        hero('moto','La prossima moto<br>parte da qui.','Nuova o usata, per la città o per andare lontano. Raccontaci cosa cerchi e vieni a vedere le proposte in negozio.','showroom-alto.webp','Moto nell’esposizione reale di Motorbike','Nuovo e usato · informazioni in negozio')+
        section('Undici marchi. La tua scelta.','<div class="brand-wall">'+''.join(f'<a href="contatti.html?reparto=moto&amp;marca={n}#messaggio">{image("brand/"+s+".png",n)}<span>{n}</span></a>' for s,n in brands)+'</div><p class="catalogue-note">Per modelli e disponibilità, chiedi direttamente al negozio.</p>',True)+
        section('Parliamo della moto che cerchi.',textgrid([('Nuove','Motorbike è autorizzata Honda, Kawasaki e Suzuki. Chiedi informazioni sul modello che ti interessa.'),('Usate','Le proposte cambiano nel tempo. Contatta il negozio indicando tipo di moto, utilizzo e budget.'),('Assistenza','La scelta continua in officina, con tagliandi, ricambi e cambio pneumatici da concordare.')]),id='scelta')+
        section('Tre informazioni per cominciare.','<ol class="journey"><li><h3>Come la userai?</h3><p>Città, viaggi o uscite del weekend. Raccontaci le tue abitudini.</p></li><li><h3>Cosa hai in mente?</h3><p>Un modello preciso, una categoria o un budget di riferimento.</p></li><li><h3>Vieni a vederla.</h3><p>Concorda con il negozio la disponibilità della moto che ti interessa.</p></li></ol>',True,id='percorso')+cta('La prossima strada ti aspetta.','Chiamaci per conoscere le proposte nuove e usate.'))

    write('cross','Cross e off-road','Equipaggiamento cross Fox e caschi off-road da Motorbike Vercelli.',
        hero('cross','Fuori dall’asfalto.<br>Dentro la passione.','Il reparto dedicato al motocross, con abbigliamento Fox e caschi off-road da confrontare in negozio.','reparti/cross.webp','Immagine Fox dal sito originale','Fox · equipaggiamento cross')+
        section('Prepara la tua prossima uscita.',textgrid([('Abbigliamento Fox','Raccontaci cosa cerchi nel reparto cross: verifica con noi capi, taglie e proposte attuali.'),('Caschi off-road','Esplora il reparto caschi dedicato al fuoristrada e porta la maschera per la prova.'),('Completa l’equipaggiamento','Guanti, stivali e accessori: confronta i componenti insieme per la tua uscita.')]),True)+
        section('Completa il tuo percorso.','<div class="category-grid">'+card('caschi',DATA['caschi'][-1])+card('abbigliamento',DATA['abbigliamento'][4])+card('abbigliamento',DATA['abbigliamento'][2])+'</div>',id='equipaggiamento')+cta())

    write('officina','Officina moto','Tagliandi ufficiali, cambio pneumatici e ricambi originali in Via Trino 200.',
        hero('officina','Ci prendiamo cura<br>della tua moto.','Dal tagliando al cambio pneumatici. Parla direttamente con l’officina e concorda il prossimo intervento.','officina.webp','Un intervento sulla moto sul ponte dell’officina','La nostra officina · Via Trino 200')+
        section('Qui il lavoro si fa da vicino.',textgrid([('Tagliandi ufficiali','Indica marca, modello, anno e chilometraggio. L’intervento e i tempi si concordano direttamente con l’officina.'),('Cambio pneumatici','L’officina dispone di smontagomme e due ponti sollevatori. Chiama per concordare il cambio e la disponibilità delle gomme.'),('Ricambi originali','Honda, Suzuki, Kawasaki, Piaggio, HM, Fantic, Kymco e Moto Guzzi: verifica il componente per la tua moto.')]),True)+
        section('Prepariamo il prossimo intervento.','<div class="contact-layout"><div class="contact-aside"><h3>Inizia raccontandoci la moto.</h3><p>Una descrizione del problema, i chilometri e il modello aiutano l’officina a organizzare il lavoro.</p><a class="contact-phone" href="tel:+390161294987">0161 294987</a><p>Preferisci parlarne? Chiamaci negli orari di apertura.</p><div class="materials"><h3>Prodotti per la manutenzione</h3><p>Motul, Elf, filtri Hiflofiltro e Sifam, candele NGK, componenti freno Newfren, Sifam, Brembo e TRW.</p></div></div>'+form(True)+'</div>',id='richiesta')+
        faq([('Come viene confermato l’appuntamento?','La data inserita è una preferenza. L’appuntamento, il lavoro e i tempi vengono concordati direttamente con l’officina dopo il contatto.'),('Non so quale intervento serve. Posso chiamare?','Sì. Descrivi quello che hai notato, senza dover individuare da solo la causa. Indica marca, modello e chilometraggio.'),('Come verifico un ricambio?','Comunica modello e anno della moto e, se possibile, il riferimento del componente. Disponibilità e tempi dipendono dal ricambio richiesto.')])+cta('Torniamo sulla strada.','Per informazioni sui lavori e sugli appuntamenti, parla con l’officina.'))

    write('club','Moto Guzzi Aquile Vercellesi','Motorbike è sede del club Moto Guzzi Aquile Vercellesi: informazioni su incontri e motogiri.',
        hero('club','Una passione.<br>Più compagni di strada.','Motorbike è anche la sede del club Moto Guzzi Aquile Vercellesi. Un punto d’incontro per parlare di moto e condividere la strada.','hero-rider.webp','Moto Guzzi lungo una strada di campagna','Moto Guzzi · Aquile Vercellesi')+
        section('Ci si incontra qui.','<div class="club-feature">'+image('aquile.png','Logo Aquile Vercellesi')+'<div><h3>Aquile Vercellesi</h3><p class="lead">In negozio trovi informazioni su eventi, incontri e motogiri segnalati o organizzati dal club.</p><p>Per conoscere le attività in programma, le modalità di partecipazione e le iscrizioni, contatta il negozio. Gli appuntamenti si confermano direttamente con il club.</p>'+link('contatti','Chiedi informazioni sul club','text-link')+'</div></div>',True)+cta('Ci vediamo in Via Trino.','Una sosta in negozio è anche un’occasione per incontrarsi.'))

    hours = ''.join(f'<div class="hours-row" data-day="{i}"><span>{n}</span><span>{v}</span></div>' for i,n,v in [(1,'Lunedì','15:30 – 19:30'),(2,'Martedì','09:00 – 12:00 / 15:30 – 19:30'),(3,'Mercoledì','09:00 – 12:00 / 15:30 – 19:30'),(4,'Giovedì','09:00 – 12:00 / 15:30 – 19:30'),(5,'Venerdì','09:00 – 12:00 / 15:30 – 19:30'),(6,'Sabato','09:00 – 12:00 / 15:30 – 19:30'),(0,'Domenica','Chiuso')])
    write('contatti','Contatti e orari','Telefono 0161 294987, email motorbikevercelli@gmail.com. Orari e indicazioni per Via Trino 200, Vercelli.',
        hero('contatti','Ci vediamo<br>in Via Trino.','Hai un prodotto in mente, una moto da cercare o un intervento da concordare? Il primo passo è parlarne.','negozio-insegna.webp','L’insegna di Motorbike Vercelli','Via Trino 200 · 13100 Vercelli')+
        section('Fai un salto da noi.',f'<div class="visit-details"><div><span class="status" data-status>Controlla gli orari</span><a class="contact-phone" href="tel:+390161294987">0161 294987</a><a class="contact-email" href="mailto:motorbikevercelli@gmail.com">motorbikevercelli@gmail.com</a><address>Via Trino 200<br>13100 Vercelli (VC)</address><a class="btn btn-red" href="{MAP}" target="_blank" rel="noopener">Ottieni indicazioni</a></div><div class="hours"><h3>Orari di apertura</h3>{hours}<p class="field-help">Per festività o variazioni, chiama prima di partire.</p></div></div>',True)+
        section('Riconosci l’ingresso.','<div class="arrival-grid"><figure>'+image('ingresso-motorbike.jpg','L’ingresso reale del negozio in Via Trino')+'<figcaption>Il nostro ingresso, in Via Trino 200.</figcaption></figure><div class="map-placeholder" data-map><h3>Motorbike Vercelli</h3><p>Via Trino 200, Vercelli</p><button class="btn btn-ghost" type="button" data-load-map>Mostra la mappa Google</button><p class="field-help">La mappa viene caricata da Google solo quando la attivi.</p></div></div>',id='arrivo')+
        section('Parliamone.','<div class="contact-layout"><div class="contact-aside"><h3>Un messaggio è un buon inizio.</h3><p>Per un prodotto indica modello e taglia; per una moto raccontaci cosa cerchi.</p><p>Per la manutenzione, trovi un modulo dedicato nella pagina officina.</p>'+link('officina','Parla con l’officina','text-link')+'</div>'+form()+'</div>',id='messaggio'))

    TITLE['ricerca']='Cerca nel sito'
    write('ricerca','Cerca nel sito','Trova reparti e servizi di Motorbike Vercelli.',
        '<section class="search-page wrap"><nav class="breadcrumb" aria-label="Percorso">'+link('index','Home')+'<span>/</span><span aria-current="page">Ricerca</span></nav><h1 class="display">Dove vuoi fare un giro?</h1><p class="lead">Trova un reparto, una categoria o un servizio.</p><form class="search-form" role="search" data-search-form><label class="sr" for="cerca">Cerca nel sito</label><input id="cerca" name="q" type="search" placeholder="Prova “guanti”, “tagliando”, “Cardo”…" autocomplete="off"><button type="submit" class="btn btn-red">Cerca</button></form><p data-search-status role="status"></p><div class="search-results" data-search-results>'+''.join(link(s,n,'search-result') for s,n in NAV)+'</div><noscript><p>Esplora i reparti con i collegamenti qui sopra.</p></noscript></section>')
    TITLE['privacy']='Privacy e servizi esterni'
    write('privacy','Privacy e servizi esterni','Informazioni sulla versione dimostrativa e sui servizi esterni utilizzati.',
        '<section class="legal-page wrap"><nav class="breadcrumb" aria-label="Percorso">'+link('index','Home')+'<span>/</span><span aria-current="page">Privacy</span></nav><h1 class="display">Privacy e servizi esterni</h1><p class="lead">Informazioni su questa proposta dimostrativa del sito.</p><h2>Moduli e contatti</h2><p>I moduli preparano una bozza email sul dispositivo dell’utente. Il sito non salva i dati del modulo e non li invia a un server. Il messaggio può essere inviato dall’utente attraverso il proprio programma di posta a motorbikevercelli@gmail.com.</p><h2>Servizi esterni</h2><p>I caratteri Anybody e Barlow vengono richiesti a Google Fonts. La mappa Google Maps nelle pagine contatti e home viene caricata soltanto quando si sceglie di visualizzarla. Collegamenti a Google Maps, Instagram e Facebook aprono servizi esterni, soggetti alle rispettive informative.</p><h2>Preferenza locale per l’animazione</h2><p>La home usa sessionStorage per ricordare che l’animazione di avvio è già stata mostrata nella sessione corrente. Non sono inseriti strumenti di analisi o pubblicità dal progetto.</p><h2>Hosting e versione ufficiale</h2><p>Il gestore dell’hosting e i servizi esterni possono trattare dati tecnici necessari a servire le pagine. Questa informativa descrive la demo: prima dell’attivazione come sito ufficiale, va aggiornata dal titolare con hosting definitivo, eventuali nuovi servizi e gestione delle richieste.</p><h2>Riferimenti dell’attività</h2><p>Motorbike Vercelli di Franco Simone, Via Trino 200, 13100 Vercelli (VC). P.IVA 02496910023. Telefono 0161 294987.</p></section>')

    write('404','Pagina non trovata','Ritrova la strada verso i reparti di Motorbike Vercelli.',
        '<section class="search-page wrap"><p class="readout">404</p><h1 class="display">Qui la strada si interrompe.</h1><p class="lead">La pagina che cercavi non è disponibile. Riparti dalla home o cerca un reparto.</p><div class="content-actions">'+link('index','Torna alla home','btn btn-red')+link('ricerca','Cerca nel sito','btn btn-ghost')+'</div></section>')

    # Update only shared chrome and destination links in the existing animated home.
    home = (ROOT/'index.html').read_text(encoding='utf-8')
    if 'intent-section' not in home: home = home.replace('    <section class="store-intro"',home_paths()+'\n    <section class="store-intro"',1)
    else: home = re.sub(r'<section class="intent-section".*?</section>',home_paths(),home,flags=re.S)
    home = re.sub(r'<form class="booking" id="booking".*?</form>','<div id="home-request">'+form(True)+'</div>',home,flags=re.S)
    home = re.sub(r'(<div id="home-request">)<form class="request-form".*?</form>',lambda m:m.group(1)+form(True),home,flags=re.S)
    if 'assets/js/site-config.js' not in home: home = home.replace('  <script src="assets/vendor/gsap','  <script src="assets/js/site-config.js" defer></script>\n  <script src="assets/vendor/gsap',1)
    home = re.sub(r'(?m)^[ \t]*<header class="top".*?(?=  <main id="main">)', header('index')+'\n\n',home,flags=re.S)
    home = re.sub(r'(?m)^[ \t]*<footer class="foot".*?(?=  <script src="assets/vendor/gsap)', footer()+'\n\n',home,flags=re.S)
    if 'assets/css/pages.css' not in home:
        home = home.replace('  <script type="application/ld+json">','  <link rel="stylesheet" href="assets/css/pages.css">\n  <script type="application/ld+json">',1)
    if 'assets/js/pages.js' not in home:
        home = home.replace('</body>','  <script src="assets/js/pages.js" defer></script>\n</body>')
    # Contextual links let the cinematic home lead to the complete departments.
    replacements = {
      'href="#corsie">Guarda i reparti':'href="abbigliamento.html">Guarda i reparti',
      'href="#officina">Scopri l\'officina':'href="officina.html">Scopri l\'officina',
      'href="#visita">Vieni a provarli in negozio':'href="caschi.html">Esplora il reparto caschi',
      'href="#booking">Richiedi un appuntamento':'href="officina.html#richiesta">Prepara una richiesta',
    }
    for old,new in replacements.items(): home=home.replace(old,new)
    # The previous concept used customer quotations without a traceable source.
    # Preserve the word-by-word scene using an explicitly labelled editorial summary.
    home=home.replace('Non ti vende il prodotto che costa di più, ma quello che fa per te.','Chi passa da Motorbike apprezza la scelta, i consigli e l’attenzione.')
    home=home.replace('<figcaption>Carlo, cliente</figcaption>','<figcaption>Sintesi delle opinioni pubbliche sul negozio</figcaption>')
    home=home.replace('media su 195 recensioni online','su 195 recensioni riportate da Tytanu')
    home=home.replace('<figure><blockquote>Negozio con il più grande assortimento della zona.</blockquote><figcaption>Emiliano</figcaption></figure>','<figure><p>Una scelta ampia di moto, abbigliamento e accessori.</p><figcaption>Assortimento</figcaption></figure>')
    home=home.replace('<figure><blockquote>Assistenza, competenza e onestà che a Vercelli difficilmente si trova.</blockquote><figcaption>Danilo</figcaption></figure>','<figure><p>Disponibilità, competenza e consigli nella scelta.</p><figcaption>Esperienza in negozio</figcaption></figure>')
    if 'Leggi le opinioni pubbliche' not in home:
        home=home.replace('su 195 recensioni riportate da Tytanu</span>','su 195 recensioni riportate da Tytanu</span><a class="review-source" href="https://tytanu.com/annuncio/negozi-abbigliamento-moto/piemonte/motorbike-vercelli/" target="_blank" rel="noopener">Leggi le opinioni pubbliche</a>')
    home=home.replace('<blockquote id="big-quote">','<p class="quote-summary" id="big-quote">').replace('l’attenzione.</blockquote>','l’attenzione.</p>')
    home=home.replace('Dal 2006 i guzzisti vercellesi si ritrovano in Via Trino.','I guzzisti vercellesi si ritrovano in Via Trino.')
    if '<noscript><p>Per l’officina' not in home:
        home=home.replace('<form class="booking" id="booking" novalidate>','<form class="booking" id="booking" novalidate><noscript><p>Per l’officina, chiama <a href="tel:+390161294987">0161 294987</a> oppure scrivi a <a href="mailto:motorbikevercelli@gmail.com">motorbikevercelli@gmail.com</a>.</p></noscript>')
    if 'home-departments' not in home:
        home=home.replace('  </main>',section('Il tuo mondo, reparto per reparto.','<div class="home-departments">'+''.join(f'<a href="{s}.html"><h3>{n}</h3><span>Esplora ↗</span></a>' for s,n in NAV[:8])+'</div>',True,id='esplora')+'\n  </main>')
    # Remove stale stock checks and unverified transaction promises from the earlier concept.
    home=home.replace('Moto controllate in officina prima della vendita. Chiamaci per sapere cosa c\'è adesso.','Le proposte cambiano nel tempo. Chiamaci per sapere quali moto puoi vedere in negozio.')
    home=home.replace('<h3>Permuta</h3><p>Porta la tua moto in Via Trino: la valutiamo e la scaliamo dal prezzo della nuova.</p>','<h3>La tua scelta</h3><p>Raccontaci come usi la moto e quale modello cerchi. Confrontiamo insieme le proposte.</p>')
    # Same click-to-load map on home and contacts.
    home=re.sub(r'<iframe title="Mappa: Motorbike.*?</iframe>','<div class="map-placeholder" data-map><h3>Via Trino 200, Vercelli</h3><button class="btn btn-ghost" type="button" data-load-map>Mostra la mappa Google</button><p>La mappa si carica quando la attivi.</p></div>',home,flags=re.S)
    (ROOT/'index.html').write_text(home,encoding='utf-8')
    search = [{'title':n,'url':s+'.html','text':n+' Motorbike Vercelli'} for s,n in NAV]
    for group,items in DATA.items():
        search += [{'title':x[1],'url':group+'-'+x[0]+'.html','text':' '.join([TITLE[group],x[1],x[3],x[5]])} for x in items]
    search += [{'title':'Tagliandi e cambio pneumatici','url':'officina.html#richiesta','text':'officina tagliando manutenzione gomme ricambi appuntamento'}]
    (ROOT/'assets/js/search-index.js').write_text('window.MOTORBIKE_SEARCH = '+json.dumps(search,ensure_ascii=False)+';',encoding='utf-8')
    p=ROOT/'ricerca.html'
    p.write_text(p.read_text(encoding='utf-8').replace('<script src="assets/js/pages.js"','<script src="assets/js/search-index.js" defer></script><script src="assets/js/pages.js"'),encoding='utf-8')
    print(f'Generated {13+sum(map(len,DATA.values()))} pages + animated home')

if __name__ == '__main__': build()
