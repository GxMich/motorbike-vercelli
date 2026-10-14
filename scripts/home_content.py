"""Homepage editorial content. Shared chrome and media come from build_site.py."""

def homepage(image, maps, portrait=None):
    hero = image('showroom.webp', 'Moto, caschi e abbigliamento nello showroom di Motorbike Vercelli', 'home-hero-photo', True, '100vw')
    if portrait:
        sources = ', '.join(f'assets/img/{v["src"]} {v["width"]}w' for v in portrait)
        hero = f'<picture class="home-hero-picture"><source media="(max-width: 760px)" srcset="{sources}" sizes="100vw">{hero}</picture>'
    departments = [
        ('caschi', 'Caschi', 'Cinque tipologie. La calzata si trova provandoli.', 'caschi.webp', 'Caschi esposti nel negozio Motorbike'),
        ('abbigliamento', 'Abbigliamento', 'Dalla giacca ai guanti. Equipaggiati per la tua strada.', 'ixon-racing.webp', 'Dettaglio dell’abbigliamento tecnico Ixon'),
        ('moto', 'Moto', 'Nuove e usate. La prossima si sceglie da vicino.', 'hero-rider.webp', 'Motociclista su strada, fotografia dal sito ufficiale'),
        ('interfoni', 'Interfoni', 'Con il passeggero o in gruppo. Parti dal tuo casco.', 'reparti/cardo.webp', 'Sistema interfono Cardo, immagine di categoria'),
        ('cross', 'Cross', 'Equipaggiamento Fox e caschi per il fuoristrada.', 'reparti/cross.webp', 'Immagine del reparto cross Fox dal sito ufficiale'),
        ('accessori', 'Accessori', 'Pneumatici, lubrificanti, scarichi e ricambi.', 'reparti/pneumatici.webp', 'Pneumatici moto, immagine di categoria'),
    ]
    cards = ''
    for slug,title,copy,photo,alt in departments:
        sizes = '(max-width: 600px) 100vw, 50vw' if slug in ['caschi','abbigliamento'] else '(max-width: 480px) 120px, (max-width: 900px) 50vw, 25vw'
        media = image(photo,alt,sizes=sizes)
        scene = ''
        if slug == 'caschi':
            panels = ''.join('<span class="helmet-panel">'+image('reparti/'+kind+'.webp','',sizes='(max-width: 760px) 120px, 200px')+'</span>' for kind in ['integrali','modulari','jet','crossover','off-road'])
            media += '<span class="helmet-fan" aria-hidden="true">'+panels+'</span>'
            scene = ' helmet-scene'
        cards += f'''<a class="department-tile tile-{slug}" href="{slug}.html">
          <div class="tile-media{scene}">{media}</div>
          <div class="tile-copy"><h3>{title}</h3><p>{copy}</p><span class="tile-arrow" aria-hidden="true">↗</span></div>
        </a>'''
    return f'''
    <section class="home-hero" aria-labelledby="home-title">
      {hero}<div class="hero-shade" aria-hidden="true"></div>
      <div class="wrap home-hero-inner">
        <p class="hero-location">Motorbike Vercelli <span>Via Trino 200</span></p>
        <h1 class="display" id="home-title"><span class="hero-title-line">La tua moto.</span><span class="hero-title-line">Il tuo mondo.</span></h1>
        <p class="hero-description">Moto nuove e usate, caschi, abbigliamento e officina.<br class="desktop-break"> Tutta la tua passione, in un vero negozio a Vercelli.</p>
        <div class="content-actions"><a class="btn btn-red" href="{maps}" target="_blank" rel="noopener">Vieni in negozio <span aria-hidden="true">↗</span></a><a class="btn btn-ghost" href="#reparti">Esplora i reparti</a></div>
      <div class="hero-bottomline"><p>Two wheels, endless fun.</p><small>Proposta dimostrativa non ufficiale</small><a href="tel:+390161294987">Parliamone: 0161 294987</a></div>
      </div>
    </section>

    <section class="home-paths" aria-labelledby="path-title"><div class="wrap">
      <div class="section-heading"><h2 id="path-title">Da dove vuoi partire?</h2><p>Il percorso giusto, subito.</p></div>
      <div class="path-grid">
        <a class="path-card" href="abbigliamento.html">{image('caschi.webp','Il reparto caschi del negozio', sizes='(max-width: 600px) 40vw, 33vw')}<div><h3>Caschi e abbigliamento</h3><p>Trova il tuo equipaggiamento.</p><span>Esplora e prova in negozio <b aria-hidden="true">↗</b></span></div></a>
        <a class="path-card" href="moto.html">{image('hero-rider.webp','Motociclista su strada, fotografia dal sito ufficiale', sizes='(max-width: 600px) 40vw, 33vw')}<div><h3>Cerco una moto</h3><p>Parliamo di nuovo e usato.</p><span>Raccontaci cosa cerchi <b aria-hidden="true">↗</b></span></div></a>
        <a class="path-card" href="officina.html">{image('officina.webp','Intervento su una moto nell’officina Motorbike', sizes='(max-width: 600px) 40vw, 33vw')}<div><h3>Mi serve l’officina</h3><p>La tua moto, in buone mani.</p><span>Scopri i servizi <b aria-hidden="true">↗</b></span></div></a>
      </div>
    </div></section>

    <section class="home-departments light" id="reparti" aria-labelledby="department-title"><div class="wrap">
      <div class="section-heading"><div><p class="section-kicker">Il negozio</p><h2 class="display" id="department-title">Ogni strada ha<br>il suo equipaggiamento.</h2></div><p>Sei reparti, un unico punto di riferimento.<br>Confronta, prova, scegli con noi.</p></div>
      <div class="department-grid">{cards}</div>
      <p class="catalogue-note">Le immagini raccontano i reparti. Modelli e disponibilità si verificano direttamente in negozio.</p>
    </div></section>

    <section class="home-workshop" aria-labelledby="workshop-title"><div class="wrap workshop-grid">
      <figure class="workshop-photo photo-reveal"><div class="workshop-scene">{image('officina.webp','Un intervento sulla moto nell’officina di Motorbike Vercelli')}<div class="workshop-shutter" aria-hidden="true"><span class="shutter-label">Motorbike<span>Officina</span></span><span class="shutter-handle"></span></div></div><figcaption>Il lavoro vero, nella nostra officina.</figcaption></figure>
      <div class="workshop-copy"><p class="section-kicker">L’officina</p><h2 class="display" id="workshop-title">La tua moto.<br>Chi se ne<br>prende cura.</h2><p>Non solo la prossima moto. Anche il posto a cui affidare la sua manutenzione, qui in Via Trino.</p>
        <ul class="service-list"><li>Tagliandi ufficiali</li><li>Cambio pneumatici</li><li>Ricambi originali</li></ul>
        <div class="content-actions"><a class="btn btn-red" href="officina.html">Scopri l’officina</a><a class="text-link" href="tel:+390161294987">Chiama: 0161 294987</a></div>
        <p class="small-note">Interventi e appuntamenti si concordano direttamente con l’officina.</p>
      </div>
    </div></section>

    <section class="home-store light" aria-labelledby="store-title"><div class="wrap store-grid">
      <div class="store-copy"><p class="section-kicker">Da vicino è un’altra cosa</p><h2 class="display" id="store-title">Una foto aiuta.<br>La prova fa<br>la differenza.</h2><p>La calzata di un casco. La taglia di una giacca. La posizione su una moto. In negozio puoi confrontare quello che cerchi e parlarne con chi conosce il mondo delle due ruote.</p><a class="text-link" href="negozio.html">Entra nel mondo Motorbike <span aria-hidden="true">↗</span></a></div>
      <figure class="store-photo photo-reveal"><div class="store-photo-frame">{image('caschi.webp','Caschi nel negozio di Via Trino 200')}</div><figcaption>Motorbike Vercelli. Il negozio, dall’interno.</figcaption></figure>
    </div></section>

    <section class="home-community" aria-labelledby="community-title"><div class="wrap community-row"><img src="assets/img/aquile.png" alt="Logo del Moto Guzzi Club Aquile Vercellesi" width="250" height="250" loading="lazy"><div><p class="section-kicker">Compagni di strada</p><h2 id="community-title">Una passione che si incontra.</h2><p>Motorbike è sede del Moto Guzzi Club Aquile Vercellesi.<br>Passa per conoscere il club e le sue attività.</p></div><a class="text-link" href="club.html">Le Aquile Vercellesi <span aria-hidden="true">↗</span></a></div></section>

    <section class="home-visit" id="visita" aria-labelledby="visit-title"><div class="wrap visit-grid">
      <div><p class="section-kicker">Ci vediamo in negozio</p><h2 class="display" id="visit-title">La prossima sosta?<br>Via Trino 200.</h2><address>13100 Vercelli (VC)</address><div class="content-actions"><a class="btn btn-red" href="{maps}" target="_blank" rel="noopener">Ottieni indicazioni <span aria-hidden="true">↗</span></a><a class="btn btn-ghost" href="tel:+390161294987">0161 294987</a></div><a class="visit-email" href="mailto:motorbikevercelli@gmail.com">motorbikevercelli@gmail.com</a></div>
      <div class="visit-hours"><h3>Orari pubblicati</h3><dl><div><dt>Lunedì</dt><dd>15:30 – 19:30</dd></div><div><dt>Martedì – sabato</dt><dd>09:00 – 12:00<br>15:30 – 19:30</dd></div><div><dt>Domenica</dt><dd>Chiuso</dd></div></dl><p>Per festività o variazioni, chiama prima di partire.</p><a class="text-link" href="contatti.html">Tutti i contatti e la mappa <span aria-hidden="true">↗</span></a></div>
    </div></section>'''
