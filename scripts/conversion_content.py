"""Focused department journeys, using real existing media and verified services."""

def home_paths():
    return '''<section class="intent-section" id="parti" aria-labelledby="intent-title"><div class="wrap">
      <div class="intent-heading"><h2 id="intent-title">Da dove vuoi partire?</h2><p>Tre modi per fare un giro da Motorbike.</p></div>
      <div class="intent-grid">
        <a class="intent-card" href="caschi.html#scegli"><img src="assets/img/caschi.webp" alt="Caschi nel nostro negozio" width="1800" height="1204" loading="lazy"><div><h3>Cerco un casco</h3><p>Confronta le tipologie. Trova la calzata in negozio.</p><span>Trova il tuo tipo di casco</span></div></a>
        <a class="intent-card" href="moto.html#proposte"><img src="assets/img/showroom-alto.webp" alt="Moto in esposizione nel negozio" width="1800" height="1350" loading="lazy"><div><h3>Cerco una moto</h3><p>Nuova o usata, raccontaci la tua prossima strada.</p><span>Chiedi le proposte disponibili</span></div></a>
        <a class="intent-card" href="officina.html#richiesta"><img src="assets/img/officina.webp" alt="Un intervento nella nostra officina" width="1800" height="1204" loading="lazy"><div><h3>Mi serve l’officina</h3><p>Tagliando, pneumatici o ricambi. Parliamone.</p><span>Richiedi un intervento</span></div></a>
      </div>
      <div class="trust-ribbon"><a href="https://tytanu.com/annuncio/negozi-abbigliamento-moto/piemonte/motorbike-vercelli/" target="_blank" rel="noopener"><strong>4,8 / 5</strong><span>195 recensioni riportate da Tytanu</span></a><span>Caschi e capi da provare in negozio</span><a href="contatti.html"><strong>Via Trino 200</strong><span>Negozio e officina, a Vercelli</span></a></div>
    </div></section>'''

def helmet_guide():
    return '''<section class="choice-section light" id="scegli" aria-labelledby="choice-title"><div class="wrap"><div class="choice-heading"><h2 class="display" id="choice-title">Come vivi la moto?</h2><p>Parti dal tuo percorso. La scelta finale si fa provando il casco.</p></div><div class="choice-grid">
      <a href="caschi.html?categoria=Citt%C3%A0#scopri"><span>Tragitti in città</span><h3>Esplora i jet</h3><p>Confronta visiera, calzata e ingombro.</p></a>
      <a href="caschi.html?categoria=Turismo#scopri"><span>Viaggi e weekend</span><h3>Esplora i modulari</h3><p>Guarda apertura, peso e comfort.</p></a>
      <a href="caschi.html?categoria=Adventure#scopri"><span>Percorsi diversi</span><h3>Esplora i crossover</h3><p>Confronta frontino, visiera e configurazioni.</p></a>
    </div><p class="choice-footer">Preferisci un integrale o cerchi un casco off-road? <a href="#scopri">Confronta tutte le tipologie</a>.</p></div></section>'''

def moto_paths():
    return '''<section class="moto-request-section" id="proposte" aria-labelledby="moto-request-title"><div class="wrap"><h2 class="display" id="moto-request-title">Hai già una direzione?</h2><div class="moto-request-grid"><a href="contatti.html?reparto=moto&amp;esigenza=Moto%20nuova#messaggio"><span>Nuovo</span><h3>La moto che hai in mente.</h3><p>Indica un modello o raccontaci come la userai. Verifichiamo le proposte con te.</p><b>Chiedi informazioni sul nuovo</b></a><a href="contatti.html?reparto=moto&amp;esigenza=Moto%20usata#messaggio"><span>Usato</span><h3>La prossima occasione.</h3><p>Le proposte cambiano: dicci categoria e budget, chiedi cosa puoi vedere in negozio.</p><b>Chiedi le proposte usate</b></a></div></div></section>'''

def workshop_navigation():
    return '''<nav class="service-navigation wrap" aria-label="Scegli il servizio officina"><a href="#richiesta" data-service="Tagliando"><strong>Tagliando</strong><span>Marca, modello e chilometri</span></a><a href="#richiesta" data-service="Cambio pneumatici"><strong>Cambio pneumatici</strong><span>Misure e giorno da concordare</span></a><a href="#richiesta" data-service="Ricambi"><strong>Ricambi</strong><span>Verifica il componente</span></a><a href="tel:+390161294987" class="service-call"><strong>0161 294987</strong><span>Parla direttamente con l’officina</span></a></nav>'''
