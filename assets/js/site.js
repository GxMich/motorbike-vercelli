/* Motorbike motion system.
   Layers, in order of dependency:
   1. Page transitions: CSS curtain, works without GSAP.
   2. Homepage preloader and hero intros.
   3. Scroll scenes with ScrollTrigger, loaded after the hero paints.
   4. Smooth wheel scrolling (Lenis), cursor and magnetic buttons: fine pointers only.
   Every essential element is visible without GSAP; touch scrolling stays native
   and reduced motion removes every scene. */
(function () {
  'use strict';
  const root = document.documentElement;
  const scriptURL = document.currentScript.src;
  const vendorURL = name => new URL('../vendor/' + name, scriptURL).href;
  const requests = {};
  const loadScript = (name, global) => {
    if (window[global]) return Promise.resolve();
    if (!requests[name]) requests[name] = new Promise(resolve => {
      const script = document.createElement('script');
      script.src = vendorURL(name);
      script.fetchPriority = 'low';
      script.onload = script.onerror = resolve;
      document.head.appendChild(script);
    });
    return requests[name];
  };
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Page transitions. The entry lift is pure CSS; here we only cover the
     page before an internal navigation, never for new tabs, files or anchors. */
  const curtain = document.querySelector('.page-curtain');
  if (curtain) {
    curtain.addEventListener('animationend', event => {
      if (event.animationName === 'curtain-lift') root.classList.remove('is-entering');
    });
    document.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href]');
      if (!link || reducedMotion() || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      event.preventDefault();
      curtain.classList.add('is-leaving');
      setTimeout(() => { location.href = url.href; }, 480);
    });
    // Returning through the back/forward cache must show the page, not the curtain.
    window.addEventListener('pageshow', event => {
      if (!event.persisted) return;
      curtain.classList.remove('is-leaving');
      root.classList.remove('is-entering');
    });
  }

  const preloader = root.classList.contains('is-preloading') ? document.querySelector('.preloader') : null;
  const endPreloader = () => { root.classList.remove('is-preloading'); preloader?.remove(); };
  if (!window.gsap) { endPreloader(); return; }
  const gsap = window.gsap;

  /* Split a heading into masked lines. Existing title lines are reused; otherwise
     <br> separates lines. A trailing space keeps the accessible text intact. */
  const splitLines = heading => {
    if (heading.dataset.split === 'true') return [...heading.querySelectorAll('.line-inner')];
    heading.dataset.split = 'true';
    const titled = [...heading.querySelectorAll(':scope > .hero-title-line')];
    if (titled.length) {
      titled.forEach((line, index) => {
        const inner = document.createElement('span');
        inner.className = 'line-inner';
        inner.append(...line.childNodes);
        if (index < titled.length - 1) inner.append(' ');
        line.append(inner);
      });
    } else {
      const groups = [[]];
      [...heading.childNodes].forEach(node => {
        if (node.nodeName === 'BR') { node.remove(); groups.push([]); }
        else groups.at(-1).push(node);
      });
      const lines = groups.filter(group => group.some(node => node.textContent.trim()));
      lines.forEach((group, index) => {
        const line = document.createElement('span'), inner = document.createElement('span');
        line.className = 'line';
        inner.className = 'line-inner';
        inner.append(...group);
        if (index < lines.length - 1) inner.append(' ');
        line.append(inner);
        heading.append(line);
      });
    }
    return [...heading.querySelectorAll('.line-inner')];
  };
  const drawHighlights = (targets, timeline, position) => {
    if (targets.length) timeline.fromTo(targets, { backgroundSize: '0% .075em' }, {
      backgroundSize: '100% .075em', duration: 1.1, ease: 'expo.inOut'
    }, position);
  };

  /* 2. Preloader: counts while the hero photograph and fonts get ready,
     never longer than ~1.5 s, then lifts like the page curtain. */
  const intro = new Promise(resolve => {
    if (!preloader) {
      setTimeout(resolve, root.classList.contains('is-entering') ? 380 : 0);
      return;
    }
    preloader.style.animation = 'none';
    const safety = setTimeout(() => { endPreloader(); resolve(); }, 4500);
    const count = preloader.querySelector('.preloader-count'), bar = preloader.querySelector('.preloader-bar i');
    const state = { value: 0 };
    const paint = () => {
      count.textContent = String(Math.round(state.value)).padStart(3, '0');
      bar.style.transform = `scaleX(${state.value / 100})`;
    };
    const climb = gsap.to(state, { value: 88, duration: 1.1, ease: 'power2.out', onUpdate: paint });
    const photo = document.querySelector('.home-hero-photo');
    const ready = Promise.race([
      Promise.all([document.fonts?.ready, photo?.decode?.().catch(() => {})]),
      wait(1500)
    ]);
    Promise.all([ready, wait(700)]).then(() => {
      climb.kill();
      gsap.timeline({ onComplete: () => { clearTimeout(safety); endPreloader(); } })
        .to(state, { value: 100, duration: .3, ease: 'power1.inOut', onUpdate: paint })
        .to(preloader.querySelector('.preloader-inner'), { y: -40, opacity: 0, duration: .45, ease: 'power3.in' })
        .to(preloader, { yPercent: -100, duration: .9, ease: 'expo.inOut' }, '-=.15')
        .call(resolve, null, '-=.55');
    });
  });

  let introPlayed = false, scenesInitialized = false;
  let ScrollTrigger = window.ScrollTrigger;
  const media = gsap.matchMedia();
  media.add({
    desktop: '(min-width: 761px)',
    wide: '(min-width: 1024px) and (min-height: 620px)',
    fine: '(hover: hover) and (pointer: fine)',
    motion: '(prefers-reduced-motion: no-preference)'
  }, context => {
    if (!context.conditions.motion) { endPreloader(); return; }
    const { desktop, wide, fine } = context.conditions;
    const distance = desktop ? 48 : 30;
    const cleanups = [], filterTweens = [];
    let cancelled = false;

    /* Hero intro: orchestrated once per page load, after preloader or curtain. */
    let introDone = Promise.resolve();
    if (!introPlayed) {
      introPlayed = true;
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out', duration: 1.2, clearProps: 'transform,opacity' } });
      const title = document.querySelector('main h1');
      const lines = title ? splitLines(title) : [];
      const homeHero = document.querySelector('.home-hero');
      if (homeHero) {
        tl.fromTo(homeHero.querySelector('.home-hero-photo'), { scale: 1.16 }, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0)
          .from(homeHero.querySelector('.hero-location'), { y: 20, opacity: 0, duration: .9 }, .2)
          .from(lines, { yPercent: 118, rotate: 3, transformOrigin: '0% 100%', duration: 1.3, stagger: .11 }, .15)
          .from(homeHero.querySelector('.hero-description'), { y: 26, opacity: 0, duration: 1 }, .55)
          .from(homeHero.querySelectorAll('.hero-foot .btn'), { y: 26, opacity: 0, duration: 1, stagger: .08 }, .7)
          .from(homeHero.querySelector('.hero-bottomline'), { opacity: 0, duration: 1 }, .95);
        drawHighlights(homeHero.querySelectorAll('.hl'), tl, .8);
      } else if (title) {
        const hero = title.closest('section');
        tl.from(hero.querySelector('.breadcrumb'), { y: -12, opacity: 0, duration: .8 }, 0)
          .from(lines, { yPercent: 118, rotate: 3, transformOrigin: '0% 100%', duration: 1.25, stagger: .1 }, .08)
          .from(hero.querySelectorAll('.page-hero-copy > .lead, :scope > .lead'), { y: 24, opacity: 0, duration: 1 }, .4)
          .from(hero.querySelectorAll('.page-hero-copy .content-actions > *, :scope > .content-actions > *, .search-form'), { y: 24, opacity: 0, duration: 1, stagger: .08 }, .55);
        const frame = hero.querySelector('.page-hero-media');
        if (frame && !frame.querySelector('.workshop-scene')) {
          tl.fromTo(frame, { clipPath: 'inset(0% 0% 0% 100% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, .1)
            .from(frame.querySelector('img'), { scale: 1.25, duration: 1.9 }, .2);
        }
      }
      const header = document.querySelector('#top');
      if (header) tl.from(header, { yPercent: -100, opacity: 0, duration: 1 }, .15);
      introDone = intro.then(() => { if (!cancelled) tl.play(); });
    }

    const reveal = (targets, trigger, vars = {}) => {
      const elements = [...targets].filter(el => el && !el.hidden);
      if (!elements.length) return;
      gsap.from(elements, {
        y: distance, opacity: 0, duration: 1.1, stagger: .08,
        ease: 'expo.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger, start: 'top 88%', once: true }, ...vars
      });
    };
    const revealHeading = heading => {
      const lines = splitLines(heading);
      const tl = gsap.timeline({ scrollTrigger: { trigger: heading, start: 'top 88%', once: true } });
      tl.from(lines, { yPercent: 118, rotate: 2.5, transformOrigin: '0% 100%', duration: 1.25, ease: 'expo.out', stagger: .09, clearProps: 'transform' });
      drawHighlights(heading.querySelectorAll('.hl'), tl, .45);
    };
    const revealImage = (frame, image) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 90%', once: true } });
      tl.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0);
      if (image && image !== frame) tl.from(image, { scale: 1.3, duration: 1.9, ease: 'expo.out', clearProps: 'transform' }, .1);
    };

    const setupScenes = () => {
      /* Hero: on scroll the photograph contracts into a rounded card while the
         next chapter slides over it; on desktop the scene holds still underneath. */
      const homeHero = document.querySelector('.home-hero');
      if (homeHero) {
        const out = gsap.timeline({ scrollTrigger: {
          trigger: homeHero, start: 'top top', end: 'bottom top', scrub: true,
          pin: desktop, pinSpacing: false, refreshPriority: 3, invalidateOnRefresh: true
        } });
        out.to(homeHero.querySelector('.hero-media'), { clipPath: desktop ? 'inset(6% 3% 14% 3% round 32px)' : 'inset(4% 3% 8% 3% round 22px)', ease: 'none' }, 0)
          .to(homeHero.querySelector('.home-hero-inner'), { yPercent: desktop ? -10 : -16, opacity: 0, ease: 'power1.in' }, 0);
        const titleLines = homeHero.querySelectorAll('.hero-title-line');
        if (desktop && titleLines.length === 2) out.to(titleLines[0], { xPercent: -6, ease: 'none' }, 0).to(titleLines[1], { xPercent: 6, ease: 'none' }, 0);
      }

      /* Departments: a pinned horizontal story on wide screens. */
      const departments = document.querySelector('.home-departments');
      const track = departments?.querySelector('.department-grid');
      if (departments && track && wide) {
        departments.classList.add('is-hscroll');
        cleanups.push(() => departments.classList.remove('is-hscroll'));
        const wrap = track.parentElement, tiles = [...track.children];
        const count = departments.querySelector('.hscroll-count b'), bar = departments.querySelector('.hscroll-bar i');
        // Layout offsets ignore transforms, so entrance tweens never skew the distance.
        const travel = () => {
          const style = getComputedStyle(wrap), last = tiles.at(-1);
          return Math.max(0, last.offsetLeft + last.offsetWidth - (wrap.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)));
        };
        const horizontal = gsap.to(track, {
          x: () => -travel(), ease: 'none',
          scrollTrigger: {
            id: 'departments', trigger: departments, start: 'top top', end: () => '+=' + travel(),
            pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 2,
            onUpdate: self => {
              if (bar) bar.style.transform = `scaleX(${self.progress})`;
              if (count) count.textContent = String(1 + Math.round(self.progress * (tiles.length - 1))).padStart(2, '0');
            }
          }
        });
        cleanups.push(() => { if (count) count.textContent = '01'; if (bar) bar.style.removeProperty('transform'); });
        gsap.from(tiles, {
          x: 140, opacity: 0, duration: 1.3, stagger: .07, ease: 'expo.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: departments, start: 'top 65%', once: true }
        });
        // Each photograph drifts inside its frame as the row travels.
        tiles.forEach(tile => {
          const photo = tile.querySelector('.tile-media > img');
          if (photo) gsap.fromTo(photo, { xPercent: -6, scale: 1.16 }, {
            xPercent: 6, scale: 1.16, ease: 'none',
            scrollTrigger: { trigger: tile, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true }
          });
        });
      } else if (track) {
        [...track.children].forEach((tile, index) => {
          reveal([tile.querySelector('.tile-copy')], tile, { delay: (index % 2) * .06 });
          revealImage(tile.querySelector('.tile-media'), tile.querySelector('.tile-media > img'));
        });
      }
      document.querySelectorAll('.helmet-fan').forEach(fan => {
        gsap.from(fan.children, {
          x: 0, rotation: 0, yPercent: 80, opacity: 0,
          duration: 1.3, stagger: .06, ease: 'expo.out', immediateRender: false,
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: fan.closest('.helmet-scene'), start: 'top 85%', once: true }
        });
      });

      /* Dark chapters widen to full bleed as they arrive. */
      document.querySelectorAll('.home-workshop, .home-visit').forEach(section => {
        gsap.fromTo(section, { '--panel-x': (desktop ? 44 : 12) + 'px', '--panel-r': (desktop ? 36 : 22) + 'px' }, {
          '--panel-x': '0px', '--panel-r': '0px', ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 20%', scrub: true }
        });
      });

      // Restore the distinctive workshop entrance in its photographic frame.
      const scenes = [...document.querySelectorAll('.workshop-scene')];
      scenes.forEach(scene => {
        const shutter = scene.querySelector('.workshop-shutter');
        if (!shutter) return;
        scene.classList.add('motion-shutter');
        const insets = () => {
          const top = (document.querySelector('#top')?.offsetHeight || 0) + 16;
          const bottom = desktop ? 24 : (document.querySelector('.mobile-actions')?.offsetHeight || 56) + 20;
          return {top,bottom,usable:Math.max(1,innerHeight-top-bottom)};
        };
        const fitPhoto = () => scene.style.setProperty('--shutter-image-max-height', Math.max(100,insets().usable-44)+'px');
        fitPhoto();
        const composition = scene.closest('.workshop-grid, .page-hero-grid');
        const photograph = scene.closest('figure') || scene;
        // Text and photograph share one pin at every viewport size.
        const pin = composition || photograph;
        const copy = composition?.querySelector('.workshop-copy');
        const settleCopy = () => {
          if (copy) gsap.getTweensOf(copy).forEach(tween => tween.progress(1));
        };
        cleanups.push(() => {
          scene.classList.remove('motion-shutter');
          scene.style.removeProperty('--shutter-image-max-height');
        });
        gsap.to(shutter, {
          yPercent: -105, ease: 'none',
          scrollTrigger: {
            id: 'workshop-shutter', trigger: pin, pin, pinSpacing: true,
            anticipatePin: 1, refreshPriority: 1,
            // Stop with the whole photo between the header and contact bar.
            start: () => {
              const {top,usable} = insets();
              // A resize can make the text taller than the viewport. Keep the
              // photograph centered even when the composition no longer fits.
              const focal = pin.offsetHeight <= usable ? pin : photograph;
              const position = top + Math.max(0,(usable-focal.offsetHeight)/2);
              return Math.max(0,focal.getBoundingClientRect().top+scrollY-position);
            },
            end: () => '+=' + Math.round(Math.max(400,Math.min(800,insets().usable*.85))),
            scrub: true, invalidateOnRefresh: true, onRefreshInit: fitPhoto,
            onEnter: settleCopy, onEnterBack: settleCopy
          }
        });
      });

      /* Typography: masked line reveals on every chapter title. */
      document.querySelectorAll('main h2.display, .home-paths h2').forEach(revealHeading);
      document.querySelectorAll('.section-kicker').forEach(kicker => reveal([kicker], kicker, { x: -24, y: 0 }));
      document.querySelectorAll('.home-paths .section-heading > p, .home-departments .section-heading > p, .workshop-copy, .store-copy > p:not(.section-kicker), .store-copy > .text-link, .home-visit address, .home-visit .content-actions, .visit-email, .choice-heading p, .page-cta p, .page-cta .btn, .detail-layout > div, .contact-aside, .club-feature > div, .story-split > div, .faq-items, .visit-details > div').forEach(el => reveal([el], el));
      document.querySelectorAll('.service-list, .visit-hours dl, .journey, .editorial-grid, .brand-wall, .choice-grid, .moto-request-grid, .department-list, .search-results').forEach(list => reveal(list.children, list, { stagger: .07 }));
      document.querySelectorAll('.visit-hours').forEach(card => revealImage(card));

      /* Images: masked reveals, then contained depth during scroll. */
      document.querySelectorAll('.path-card').forEach((card, index) => {
        revealImage(card, card.querySelector('img'));
        gsap.from(card.querySelector('div'), { y: 30, opacity: 0, duration: 1.2, delay: .25 + index * .05, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
      });
      document.querySelectorAll('.story-split > img, .arrival-grid figure img, .club-feature > img').forEach(image => revealImage(image));
      document.querySelectorAll('.store-photo-frame').forEach(frame => {
        const photo = frame.querySelector('img');
        // Scale on scroll: the frame opens from an inset card to its full size.
        gsap.fromTo(frame, { clipPath: desktop ? 'inset(14% 10% 14% 10% round 32px)' : 'inset(8% 6% 8% 6% round 22px)' }, {
          clipPath: 'inset(0% 0% 0% 0% round 18px)', ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'center 55%', scrub: true }
        });
        if (photo) gsap.fromTo(photo, { y: desktop ? 26 : 12, scale: 1.12 }, {
          y: desktop ? -26 : -12, scale: 1.12, ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: .4, invalidateOnRefresh: true }
        });
      });
      document.querySelectorAll('.category-grid').forEach(grid => {
        [...grid.children].forEach((card, index) => {
          reveal([card], card, { y: distance * 1.4, delay: (index % (desktop ? 3 : 2)) * .07 });
          const image = card.querySelector('.category-image img');
          if (image) gsap.from(image, { scale: 1.25, duration: 1.8, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
        });
      });
      const community = document.querySelector('.community-row');
      if (community) reveal(community.children, community, { y: 24, stagger: .1 });

      /* Footer: the brand word drifts across as the page ends. */
      const word = document.querySelector('.foot-word');
      if (word) gsap.fromTo(word, { xPercent: desktop ? 14 : 8 }, {
        xPercent: 0, ease: 'none',
        scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true }
      });
      const city = document.querySelector('.foot-city');
      if (city) reveal([city], city, { y: 20 });

      const onFilter = event => {
        const grid = event.detail?.grid;
        if (!grid) return;
        const cards = [...grid.children].filter(el => !el.hidden);
        gsap.killTweensOf([...grid.children]);
        gsap.set([...grid.children], { clearProps: 'transform,opacity' });
        filterTweens.push(gsap.from(cards, {
          y: desktop ? 36 : 20, opacity: 0, duration: .8, stagger: .06,
          ease: 'expo.out', clearProps: 'transform,opacity'
        }));
        ScrollTrigger.refresh();
      };
      document.addEventListener('motorbike:categories-changed', onFilter);
      cleanups.push(() => {
        document.removeEventListener('motorbike:categories-changed', onFilter);
        filterTweens.forEach(tween => tween.kill());
        gsap.set(document.querySelectorAll('.category-card'), { clearProps: 'transform,opacity' });
      });
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', onLoad, { once: true });
      cleanups.push(() => window.removeEventListener('load', onLoad));
    };

    /* 4. Smooth wheel scrolling: desktop fine pointers only. Touch keeps native
       scroll; the menu, keyboard and in-page anchors keep working. */
    const setupSmoothScroll = () => loadScript('lenis.min.js', 'Lenis').then(() => {
      if (cancelled || !window.Lenis) return;
      const lenis = new window.Lenis({ lerp: .1, smoothWheel: true, prevent: node => !!node.closest?.('.menu, iframe, [data-lenis-prevent]') });
      const raf = time => lenis.raf(time * 1000);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      const onMenu = event => { if (event.detail?.open) lenis.stop(); else lenis.start(); };
      const onAnchor = event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest('a[href*="#"]');
        if (!link) return;
        const url = new URL(link.href, location.href);
        if (!url.hash || url.pathname !== location.pathname || url.search !== location.search) return;
        let target;
        try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
        if (!target) return;
        event.preventDefault();
        history.pushState(null, '', url.hash);
        const offset = target.id === 'main' ? 0 : -(parseFloat(getComputedStyle(root).scrollPaddingTop) || 0);
        lenis.scrollTo(target, { offset, duration: 1.3 });
        if (!target.matches('a, button, input, select, textarea, [tabindex]')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      };
      document.addEventListener('motorbike:menu', onMenu);
      document.addEventListener('click', onAnchor);
      cleanups.push(() => {
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33);
        document.removeEventListener('motorbike:menu', onMenu);
        document.removeEventListener('click', onAnchor);
        lenis.destroy();
      });
    });

    /* Cursor and magnetic buttons: fine pointers only, purely decorative. */
    const setupPointer = () => {
      const cursor = document.createElement('div'), label = document.createElement('span');
      cursor.className = 'cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.append(label);
      document.body.append(cursor);
      const toX = gsap.quickTo(cursor, 'x', { duration: .5, ease: 'power3' });
      const toY = gsap.quickTo(cursor, 'y', { duration: .5, ease: 'power3' });
      const labels = [['.department-tile, .category-card a, .path-card', 'Esplora'], ['.brand-wall a', 'Chiedi']];
      const onMove = event => { toX(event.clientX); toY(event.clientY); cursor.classList.add('is-visible'); };
      const onOver = event => {
        const labelled = labels.find(([selector]) => event.target.closest?.(selector));
        const interactive = event.target.closest?.('a, button, summary, label, select, input, textarea');
        cursor.classList.toggle('is-label', !!labelled);
        cursor.classList.toggle('is-link', !labelled && !!interactive);
        if (labelled) label.textContent = labelled[1];
      };
      const onLeave = () => cursor.classList.remove('is-visible');
      const onDown = () => cursor.classList.add('is-down');
      const onUp = () => cursor.classList.remove('is-down');
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerover', onOver);
      root.addEventListener('pointerleave', onLeave);
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      const magnets = [...document.querySelectorAll('.btn-red, .menu-btn, .search-button, .hero-foot .btn-ghost')].map(el => {
        const toMX = gsap.quickTo(el, 'x', { duration: .6, ease: 'power3' });
        const toMY = gsap.quickTo(el, 'y', { duration: .6, ease: 'power3' });
        const move = event => {
          const box = el.getBoundingClientRect();
          toMX((event.clientX - box.left - box.width / 2) * .25);
          toMY((event.clientY - box.top - box.height / 2) * .35);
        };
        const leave = () => { toMX(0); toMY(0); };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
      });
      cleanups.push(() => {
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerover', onOver);
        root.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        magnets.forEach(remove => remove());
        cursor.remove();
      });
    };
    if (fine) setupPointer();

    // Let the real hero photograph paint before measuring all below-fold scenes.
    // This preserves the hero entrance and lowers work on the LCP critical path.
    const photograph = document.querySelector('.home-hero-photo, .page-hero-media img');
    const scenesReady = Promise.all([document.fonts?.ready, photograph?.decode().catch(() => {})]).then(() => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(async () => {
        if (cancelled) return resolve();
        await loadScript('ScrollTrigger.min.js', 'ScrollTrigger');
        if (cancelled || !window.ScrollTrigger) return resolve();
        ScrollTrigger = window.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        // Pin spacing must not push a directly linked form below the viewport.
        // Preserve the anchor's current position, including any user scroll.
        let anchor;
        if (!scenesInitialized && window.location.hash) {
          try { anchor = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); }
          catch { /* An invalid fragment has no target to preserve. */ }
        }
        const anchorTop = anchor?.getBoundingClientRect().top;
        context.add(setupScenes);
        ScrollTrigger.refresh();
        if (anchor) window.scrollBy({top:anchor.getBoundingClientRect().top-anchorTop,behavior:'instant'});
        scenesInitialized = true;
        if (desktop && fine) await context.add(setupSmoothScroll);
        resolve();
      }));
    }));
    Promise.all([scenesReady, introDone, intro]).then(() => {
      if (!cancelled) root.dataset.motionReady = 'true';
    });
    return () => {cancelled = true; delete root.dataset.motionReady; cleanups.forEach(cleanup => cleanup());};
  });
})();
