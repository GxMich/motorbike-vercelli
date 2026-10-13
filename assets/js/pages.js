/* Multipage interactions, with progressive enhancement and no personal-data storage. */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const inner = document.body.classList.contains('inner-page');
  const menu = $('#menu'), open = $('#menu-open'), close = $('#menu-close');
  // Home delegates its existing menu to site.js; inner pages use the same contract.
  if (inner && menu && open && close) {
    const setMenu = (active) => {
      menu.inert = !active;
      menu.classList.toggle('open', active);
      document.body.classList.toggle('menu-open', active);
      open.setAttribute('aria-expanded', String(active));
      $('#main').inert = active;
      $('.foot').inert = active;
      if (active) requestAnimationFrame(() => { if (menu.classList.contains('open')) close.focus({ preventScroll: true }); });
      else open.focus({ preventScroll: true });
    };
    open.addEventListener('click', () => setMenu(true));
    close.addEventListener('click', () => setMenu(false));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (!menu.classList.contains('open')) return;
      if (e.key === 'Escape') setMenu(false);
      if (e.key === 'Tab') {
        const list = $$('button,a[href]',menu), first=list[0],last=list.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    const paintHeader = () => {
      $('#top').classList.toggle('scrolled', window.scrollY > 40);
      document.body.classList.toggle('has-mobile-actions',window.scrollY > 180);
    };
    window.addEventListener('scroll', paintHeader,{passive:true});
    paintHeader();
    $$('[data-year]').forEach(el => {el.textContent = new Date().getFullYear();});
    function paintHours() {
      const parts = {};
      new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).forEach(p => {parts[p.type]=p.value;});
      const day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(parts.weekday), minute=+parts.hour*60 + +parts.minute;
      const hours=[[],[[930,1170]],[[540,720],[930,1170]],[[540,720],[930,1170]],[[540,720],[930,1170]],[[540,720],[930,1170]],[[540,720],[930,1170]]];
      const fmt = n => `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;
      const current=hours[day].find(([a,b])=>minute>=a&&minute<b);
      let text, isOpen=Boolean(current);
      if (current) text=`Aperto ora, fino alle ${fmt(current[1])}`;
      else {
        const next=hours[day].find(([a])=>a>minute);
        if (next) text=`Chiuso, riapre alle ${fmt(next[0])}`;
        else for(let step=1;step<=7;step++) {
          const nextDay=(day+step)%7;
          if(hours[nextDay].length) {text=`Chiuso, riapre ${step===1?'domani':['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'][nextDay]} alle ${fmt(hours[nextDay][0][0])}`;break;}
        }
      }
      $$('[data-status]').forEach(el=>{el.textContent=text;el.dataset.open=String(isOpen);});
      $$('.hours-row').forEach(el=>el.classList.toggle('today',+el.dataset.day===day));
    }
    paintHours(); setInterval(paintHours,60000);
  }

  const filters = $('[data-filters]');
  if (filters) {
    filters.hidden=false;
    const buttons=$$('[data-filter]',filters), cards=$$('[data-category]');
    const select = (key,changeUrl) => {
      if(!buttons.some(b=>b.dataset.filter===key)) key='all';
      buttons.forEach(b=>{const selected=b.dataset.filter===key;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
      let count=0;
      cards.forEach(c=>{c.hidden=key!=='all'&&c.dataset.category!==key;if(!c.hidden)count++;});
      $('[data-filter-status]').textContent=`${count} categorie visualizzate`;
      if(changeUrl) {const url=new URL(location.href);if(key==='all')url.searchParams.delete('categoria');else url.searchParams.set('categoria',key);history.pushState(null,'',url);}
    };
    filters.addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b) select(b.dataset.filter,true);});
    window.addEventListener('popstate',()=>select(new URLSearchParams(location.search).get('categoria')||'all',false));
    select(new URLSearchParams(location.search).get('categoria')||'all',false);
  }

  $$('[data-request-form]').forEach(form => {
    const workshop = form.dataset.workshop === 'true';
    const config = window.MOTORBIKE_CONFIG || {};
    const configured = workshop ? (config.workshopEndpoint || config.contactEndpoint) : config.contactEndpoint;
    const endpoint = /^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(configured || '') ? configured : '';
    const send = $('[data-send]', form), status = $('[data-form-status]', form);
    let busy = false;
    if (endpoint) {
      send.textContent = 'Invia la richiesta';
      $('[data-form-intro]',form).textContent = 'Lascia un recapito e raccontaci cosa cerchi. Il messaggio arriva direttamente al negozio.';
      $('[data-form-note]',form).textContent = 'La richiesta verrà inviata al negozio attraverso Formspree.';
    }
    const params=new URLSearchParams(location.search);
    const department=params.get('reparto')||'';
    const labels={caschi:'Caschi',abbigliamento:'Abbigliamento',moto:'Moto',interfoni:'Interfoni',accessori:'Accessori',cross:'Cross',club:'Club'};
    const group=Object.keys(labels).find(key=>department===key||department.startsWith(key+'-'));
    if(group) form.elements.argomento.value=labels[group];
    const brand=params.get('marca');
    if(brand||department.includes('-')) form.elements.messaggio.value=`Vorrei informazioni su ${brand||department.replace(/-/g,' ')}. `;
    const need=params.get('esigenza');
    if (need) form.elements.messaggio.value=`Cerco una ${need.toLocaleLowerCase('it')}. La userò per… `;
    const date=form.elements.giorno;
    if(date) {const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const find=t=>parts.find(p=>p.type===t).value;date.min=`${find('year')}-${find('month')}-${find('day')}`;}
    const showStatus = (text, kind) => {
      status.hidden = false; status.textContent = text; status.dataset.kind = kind;
      status.focus({preventScroll:true});
    };
    const draft = (body, subject) => {
      const preview=$('[data-preview]',form);
      $('[data-email-preview]',form).textContent=body;
      $('[data-email-link]',form).href=`mailto:motorbikevercelli@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      preview.hidden=false;preview.focus({preventScroll:true});preview.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
      $('[data-copy-status]',form).textContent='';
    };
    form.elements.recapito.addEventListener('input',()=>form.elements.recapito.setCustomValidity(''));
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      if (busy) return;
      ['nome','messaggio','recapito'].forEach(name=>{form.elements[name].value=form.elements[name].value.trim();});
      const contact=form.elements.recapito.value;
      const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
      const phone=/^\+?[\d\s().-]+$/.test(contact) && contact.replace(/\D/g,'').length>=7 && contact.replace(/\D/g,'').length<=15;
      form.elements.recapito.setCustomValidity(email||phone?'':'Inserisci un numero di telefono oppure un indirizzo email valido.');
      if(!form.reportValidity())return;
      const data=new FormData(form);
      const lines=[`Richiesta: ${data.get('argomento')}`,`Nome: ${String(data.get('nome')).trim()}`,`${email?'Email':'Telefono'}: ${contact}`];
      if(workshop) {lines.push(`Moto: ${data.get('moto')}`);if(data.get('giorno'))lines.push(`Giorno preferito (da concordare): ${data.get('giorno')}`);}
      lines.push('',String(data.get('messaggio')).trim());
      const body=lines.join('\n'), subject=`${workshop?'Officina':'Informazioni'} Motorbike — ${data.get('argomento')}`;
      status.hidden = true;
      if (!endpoint) { draft(body, subject); record('request_draft'); return; }
      if (data.get('_gotcha')) { showStatus('Controlla i campi della richiesta e riprova.','error'); return; }
      busy=true;send.disabled=true;send.textContent='Invio in corso…';form.setAttribute('aria-busy','true');
      $$('input,select,textarea',form).forEach(field=>{field.disabled=true;});
      const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),15000);
      try {
        const response=await fetch(endpoint,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({name:data.get('nome'),email:email?contact:undefined,phone:phone?contact:undefined,message:body,_subject:subject,_gotcha:data.get('_gotcha')||''}),signal:controller.signal});
        const result=await response.json();
        if(!response.ok || result.ok!==true) throw new Error('Request not accepted');
        form.reset();$('[data-preview]',form).hidden=true;
        showStatus(workshop?'Richiesta inviata. L’officina ti contatterà al recapito indicato per concordare l’intervento.':'Richiesta inviata. Il negozio ti contatterà al recapito indicato.','success');
        record('request_submitted');
      } catch {
        draft(body,subject);
        showStatus('Non abbiamo ricevuto la conferma di invio. Prima di riprovare, puoi chiamare il negozio o inviare la bozza qui sotto.','error');
      } finally {clearTimeout(timeout);busy=false;send.disabled=false;send.textContent='Invia la richiesta';$$('input,select,textarea',form).forEach(field=>{field.disabled=false;});form.removeAttribute('aria-busy');}
    });
    // Any edit invalidates the previous draft, avoiding stale contact details.
    form.addEventListener('input',()=>{$('[data-preview]',form).hidden=true;if(!busy)status.hidden=true;});
    $('[data-copy]',form).addEventListener('click',async()=>{
      const status=$('[data-copy-status]',form), body=$('[data-email-preview]',form).textContent;
      try {await navigator.clipboard.writeText(body);status.textContent='Messaggio copiato. Puoi incollarlo nella tua email.';}
      catch {status.textContent='Non è stato possibile copiare. Seleziona il riepilogo e copialo manualmente.';}
    });
  });

  $$('[data-service]').forEach(link=>link.addEventListener('click',()=>{
    const form=$('[data-request-form][data-workshop="true"]');
    if(form) {form.elements.argomento.value=link.dataset.service;form.elements.argomento.dispatchEvent(new Event('input',{bubbles:true}));}
  }));

  // No storage, cookies or network: a deployment may attach its chosen analytics.
  function record(action) { window.dispatchEvent(new CustomEvent('motorbike:conversion',{detail:{action,page:location.pathname}})); }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');if(!a)return;
    if(a.getAttribute('href').startsWith('tel:'))record('phone_click');
    else if(a.href.includes('google.com/maps/dir'))record('directions_click');
    else if(a.getAttribute('href').startsWith('mailto:'))record('email_click');
  });

  $$('[data-load-map]').forEach(button=>button.addEventListener('click',()=>{
    const container=button.closest('[data-map]'), frame=document.createElement('iframe');
    frame.title='Mappa: Motorbike Vercelli, Via Trino 200';
    frame.src='https://maps.google.com/maps?q=Motorbike%20Vercelli%2C%20Via%20Trino%20200%2C%2013100%20Vercelli&z=15&output=embed';
    frame.referrerPolicy='no-referrer-when-downgrade';
    frame.tabIndex=0;
    container.replaceChildren(frame);container.classList.add('loaded');frame.focus();
  }));

  const searchForm=$('[data-search-form]');
  if(searchForm&&window.MOTORBIKE_SEARCH) {
    const input=$('input',searchForm), results=$('[data-search-results]'), status=$('[data-search-status]');
    const normalize=s=>s.toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const render=()=>{
      const query=normalize(input.value.trim()).slice(0,100), tokens=query.split(/\s+/).filter(Boolean);
      const matches=window.MOTORBIKE_SEARCH.filter(x=>tokens.every(t=>normalize(x.text).includes(t)));
      results.replaceChildren();
      (query?matches:window.MOTORBIKE_SEARCH.slice(0,10)).forEach(x=>{
        const a=document.createElement('a');a.className='search-result';a.href=x.url;a.textContent=x.title;
        const span=document.createElement('span');span.textContent='Esplora la pagina';a.appendChild(span);results.appendChild(a);
      });
      status.textContent=query?(matches.length?`${matches.length} risultati per “${input.value.trim()}”`:'Nessun risultato. Prova una categoria come “caschi”, “guanti” o “officina”.'):'Esplora i reparti oppure scrivi cosa cerchi.';
    };
    input.value=new URLSearchParams(location.search).get('q')||'';render();
    input.addEventListener('input',render);
    searchForm.addEventListener('submit',e=>{e.preventDefault();const url=new URL(location.href);if(input.value.trim())url.searchParams.set('q',input.value.trim());else url.searchParams.delete('q');history.pushState(null,'',url);render();});
    window.addEventListener('popstate',()=>{input.value=new URLSearchParams(location.search).get('q')||'';render();});
  }
})();
