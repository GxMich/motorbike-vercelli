"""Homepage — "Paddock Racing" composition. Shared chrome and media come from build_site.py.

The shop is presented as a race box: start (hero), racing line (paths), the six
departments as numbered race cards, the starting grid of brands, the pit stop
(workshop with its shutter), the fitting test, the club and the finish line.
"""

BRANDS = [('honda','Honda',True),('kawasaki','Kawasaki',True),('suzuki','Suzuki',True),('motoguzzi','Moto Guzzi',False),
          ('piaggio','Piaggio',False),('beta','Beta',False),('fantic','Fantic',False),('cfmoto','CFMOTO',False),
          ('kymco','Kymco',False),('mondial','F.B Mondial',False),('klmotors','KL Motors',False)]

DEPARTMENTS = [
    ('caschi','Caschi','Integrali, modulari, jet, crossover e off-road. La calzata si trova provandoli.','caschi.webp','Caschi esposti nel negozio Motorbike'),
    ('abbigliamento','Abbigliamento','Giacche, pantaloni, guanti, scarpe, stivali e tute. Spidi e Ixon tra i marchi.','ixon-racing.webp','Dettaglio dell’abbigliamento tecnico Ixon'),
    ('moto','Moto','Nuove e usate. La prossima si sceglie da vicino.','hero-rider.webp','Motociclista su strada, fotografia dal sito ufficiale'),
    ('interfoni','Interfoni','Cardo, Sena, Midland, Interphone, SMART HJC e N-Com.','reparti/cardo.webp','Sistema interfono Cardo, immagine di categoria'),
    ('cross','Cross','Abbigliamento Fox e caschi per il fuoristrada.','reparti/cross.webp','Immagine del reparto cross Fox dal sito ufficiale'),
    ('accessori','Accessori','Pneumatici, lubrificanti, scarichi e ricambi.','reparti/pneumatici.webp','Pneumatici moto, immagine di categoria'),
]

TICKER = ['Moto nuove e usate','Caschi','Abbigliamento','Interfoni','Cross Fox','Accessori','Officina','Tagliandi ufficiali','Cambio pneumatici','Ricambi originali']

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'


def ticker(items, cls=''):
    row = ''.join(f'<span>{item}</span><i aria-hidden="true"></i>' for item in items)
    # The second copy only makes the loop seamless and is hidden from assistive technology.
    return f'<div class="ticker {cls}"><div class="ticker-track"><div class="ticker-row">{row}</div><div class="ticker-row" aria-hidden="true">{row}</div></div></div>'


def homepage(image, maps, portrait=None):
    hero = image('hero-rider.webp', 'Motociclista in piega su una strada di campagna', 'home-hero-photo', True, '100vw')

    cards = ''
    for index, (slug, title, copy, photo, alt) in enumerate(DEPARTMENTS, 1):
        cards += f'''<a class="race-card race-{slug}" href="{slug}.html">
          <span class="race-media">{image(photo, alt, sizes='(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 34vw')}</span>
          <span class="race-number" aria-hidden="true">{index:02d}</span>
          <span class="race-copy"><span class="race-kicker">Reparto {index:02d}</span><h3>{title}</h3><span class="race-text">{copy}</span><span class="race-go">Entra nel reparto {ARROW}</span></span>
        </a>'''

    brands = ''.join(
        f'<a class="grid-slot" href="contatti.html?reparto=moto&amp;marca={name}#messaggio"><span class="grid-pos" aria-hidden="true">P{i:02d}</span>'
        f'{image("brand/"+slug+".png", name, sizes="160px")}<span class="grid-name">{name}</span>'
        + ('<span class="grid-badge">Autorizzato</span>' if official else '') + '</a>'
        for i, (slug, name, official) in enumerate(BRANDS, 1))

    helmets = ''.join('<span class="helmet-panel">'+image('reparti/'+kind+'.webp','',sizes='(max-width: 760px) 120px, 220px')+'</span>' for kind in ['integrali','modulari','jet','crossover','off-road'])

    return f'''
    <section class="home-hero" aria-labelledby="home-title">
      <div class="hero-media">{hero}<div class="hero-shade" aria-hidden="true"></div></div>
      <div class="home-hero-inner wrap">
        <p class="hero-tag"><span class="hero-dot" aria-hidden="true"></span>Motorbike Vercelli <span>Via Trino 200</span></p>
        <h1 class="hero-title" id="home-title"><span class="hero-title-line">Two wheels,</span><span class="hero-title-line hero-title-right">endless <em class="hl">fun.</em></span></h1>
        <div class="hero-foot">
          <p class="hero-description">Moto nuove e usate, caschi, abbigliamento, accessori e officina. Tutta la tua passione in un unico box, a Vercelli.</p>
          <div class="content-actions"><a class="btn btn-red" href="{maps}" target="_blank" rel="noopener">Vieni in negozio <span aria-hidden="true">↗</span></a><a class="btn btn-ghost" href="#reparti">Esplora i reparti <span aria-hidden="true">↓</span></a></div>
        </div>
      </div>
      <div class="hero-band"><div class="kerb" aria-hidden="true"></div>{ticker(TICKER)}</div>
    </section>

    <section class="home-manifesto" aria-labelledby="manifesto-title"><div class="wrap">
      <p class="eyebrow">Il box di Via Trino</p>
      <h2 class="manifesto" id="manifesto-title">Un casco si prova. Una giacca si indossa. Una moto si guarda da vicino. Qui trovi il negozio, l’officina e chi parla la tua lingua: quella delle due ruote.</h2>
      <dl class="stats">
        <div><dt>Reparti</dt><dd data-count="6">06</dd></div>
        <div><dt>Marchi moto</dt><dd data-count="11">11</dd></div>
        <div><dt>Marchi autorizzati<sup>*</sup></dt><dd data-count="3">03</dd></div>
        <div><dt>Ponti in officina</dt><dd data-count="2">02</dd></div>
      </dl>
      <p class="stats-note"><sup>*</sup> Honda, Kawasaki e Suzuki, come dichiarato sul sito ufficiale dell’attività.</p>
    </div></section>

    <section class="home-lines" aria-labelledby="lines-title"><div class="wrap">
      <div class="section-head"><p class="eyebrow">Da dove vuoi partire?</p><h2 class="display" id="lines-title">Scegli<br>la tua linea.</h2></div>
      <div class="line-panels">
        <a class="line-panel" href="abbigliamento.html">{image('caschi.webp','Il reparto caschi del negozio', sizes='(max-width: 760px) 100vw, 50vw')}<span class="line-pos" aria-hidden="true">P1</span><span class="line-copy"><span class="line-kicker">Equipaggiamento</span><h3>Caschi e abbigliamento</h3><span class="line-text">Trova il tuo equipaggiamento e provalo in negozio.</span><span class="line-go">Esplora {ARROW}</span></span></a>
        <a class="line-panel" href="moto.html">{image('showroom.webp','Moto nello showroom di Motorbike Vercelli', sizes='(max-width: 760px) 100vw, 50vw')}<span class="line-pos" aria-hidden="true">P2</span><span class="line-copy"><span class="line-kicker">Nuovo e usato</span><h3>Cerco una moto</h3><span class="line-text">Raccontaci come la userai, la scegliamo da vicino.</span><span class="line-go">Raccontaci cosa cerchi {ARROW}</span></span></a>
        <a class="line-panel" href="officina.html">{image('officina.webp','Intervento su una moto nell’officina Motorbike', sizes='(max-width: 760px) 100vw, 50vw')}<span class="line-pos" aria-hidden="true">P3</span><span class="line-copy"><span class="line-kicker">Assistenza</span><h3>Mi serve l’officina</h3><span class="line-text">Tagliandi, gomme e ricambi. La tua moto, in buone mani.</span><span class="line-go">Scopri i servizi {ARROW}</span></span></a>
      </div>
    </div></section>

    <section class="home-departments" id="reparti" aria-labelledby="department-title"><div class="wrap">
      <div class="section-head"><p class="eyebrow">Il negozio</p><h2 class="display" id="department-title">Sei reparti.<br>Un solo box.</h2><p class="section-lead">Confronta, prova, scegli con noi. Modelli e disponibilità si verificano in negozio.</p></div>
      <div class="hscroll-meta" aria-hidden="true"><span class="hscroll-count"><b>01</b> / 06</span><span class="hscroll-bar"><i></i></span><span class="hscroll-hint">Scorri</span></div>
      <div class="race-track">{cards}</div>
    </div></section>

    <section class="home-grid light" aria-labelledby="grid-title"><div class="wrap">
      <div class="section-head"><p class="eyebrow">Moto nuove e usate</p><h2 class="display" id="grid-title">In griglia<br>di partenza.</h2><p class="section-lead">Undici marchi presentati sul sito ufficiale. Scegli il tuo e chiedi modelli e disponibilità: nuovo o usato, ne parliamo da vicino.</p></div>
      <div class="starting-grid">{brands}</div>
      <div class="content-actions grid-actions"><a class="btn btn-dark" href="moto.html">Tutto sulle moto <span aria-hidden="true">↗</span></a><a class="text-link" href="moto.html#richiesta">Raccontaci quale cerchi</a></div>
    </div></section>

    <section class="home-workshop pit" aria-labelledby="workshop-title"><div class="kerb kerb-top" aria-hidden="true"></div><div class="wrap workshop-grid">
      <figure class="workshop-photo photo-reveal"><div class="workshop-scene">{image('officina.webp','Un intervento sulla moto nell’officina di Motorbike Vercelli')}<div class="workshop-shutter" aria-hidden="true"><span class="shutter-label">Motorbike<span>Officina</span></span><span class="shutter-handle"></span></div></div><figcaption>Il lavoro vero, nella nostra officina.</figcaption></figure>
      <div class="workshop-copy"><p class="eyebrow">L’officina</p><h2 class="display" id="workshop-title">Pit<br>stop.</h2><p>Non solo la prossima moto: anche il posto a cui affidarla. Due ponti sollevatori e smontagomme, qui in Via Trino.</p>
        <ol class="pit-board"><li><span>01</span>Tagliandi ufficiali</li><li><span>02</span>Cambio pneumatici</li><li><span>03</span>Ricambi originali</li></ol>
        <div class="content-actions"><a class="btn btn-light" href="officina.html">Scopri l’officina <span aria-hidden="true">↗</span></a><a class="text-link" href="tel:+390161294987">Chiama: 0161 294987</a></div>
        <p class="small-note">Interventi e appuntamenti si concordano direttamente con l’officina.</p>
      </div>
    </div></section>

    <section class="home-store light" aria-labelledby="store-title"><div class="wrap store-grid">
      <div class="store-copy"><p class="eyebrow">Da vicino è un’altra cosa</p><h2 class="display" id="store-title">La prova<br>fa la <em class="hl">differenza.</em></h2><p>La calzata di un casco. La taglia di una giacca. La posizione su una moto. In negozio confronti quello che cerchi e ne parli con chi conosce il mondo delle due ruote.</p><a class="text-link" href="negozio.html">Entra nel mondo Motorbike <span aria-hidden="true">↗</span></a></div>
      <figure class="store-photo"><div class="store-photo-frame helmet-scene">{image('caschi.webp','Caschi nel negozio di Via Trino 200', sizes='(max-width: 760px) 100vw, 55vw')}<span class="helmet-fan" aria-hidden="true">{helmets}</span></div><figcaption>Integrali, modulari, jet, crossover e off-road: cinque modi di partire.</figcaption></figure>
    </div></section>

    <section class="home-community" aria-labelledby="community-title"><div class="wrap community-row"><img src="assets/img/aquile.png" alt="Logo del Moto Guzzi Club Aquile Vercellesi" width="250" height="250" loading="lazy"><div><p class="eyebrow">Compagni di strada</p><h2 id="community-title">Sede del Moto Guzzi Club Aquile Vercellesi.</h2><p>Una passione che si incontra. Passa a conoscere il club e le sue attività.</p></div><a class="text-link" href="club.html">Le Aquile Vercellesi <span aria-hidden="true">↗</span></a></div></section>

    <section class="home-visit" id="visita" aria-labelledby="visit-title"><div class="checker" aria-hidden="true"></div><div class="wrap visit-grid">
      <div><p class="eyebrow">Traguardo</p><h2 class="display" id="visit-title">Via Trino<br>200.</h2><address>13100 Vercelli (VC)</address><div class="content-actions"><a class="btn btn-red" href="{maps}" target="_blank" rel="noopener">Ottieni indicazioni <span aria-hidden="true">↗</span></a><a class="btn btn-ghost" href="tel:+390161294987">0161 294987</a></div><a class="visit-email" href="mailto:motorbikevercelli@gmail.com">motorbikevercelli@gmail.com</a></div>
      <div class="visit-hours timing"><h3>Orari pubblicati</h3><dl><div><dt>Lunedì</dt><dd>15:30 – 19:30</dd></div><div><dt>Martedì – sabato</dt><dd>09:00 – 12:00<br>15:30 – 19:30</dd></div><div><dt>Domenica</dt><dd>Chiuso</dd></div></dl><p>Per festività o variazioni, chiama prima di partire.</p><a class="text-link" href="contatti.html">Tutti i contatti e la mappa <span aria-hidden="true">↗</span></a></div>
    </div></section>'''
