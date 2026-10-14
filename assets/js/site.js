/* Motorbike motion: coordinated entrances and the workshop shutter.
   Every essential element is visible without GSAP; scroll remains native. */
(function () {
  'use strict';
  if (!window.gsap) return;
  const gsap = window.gsap;
  let ScrollTrigger = window.ScrollTrigger, pluginRequest;
  let scenesInitialized = false;
  const pluginURL = new URL('../vendor/ScrollTrigger.min.js', document.currentScript.src).href;
  const loadScrollTrigger = () => {
    if (window.ScrollTrigger) return Promise.resolve();
    if (!pluginRequest) pluginRequest = new Promise(resolve => {
      const script = document.createElement('script');
      script.src = pluginURL;
      script.fetchPriority = 'low';
      script.onload = script.onerror = resolve;
      document.head.appendChild(script);
    });
    return pluginRequest;
  };
  const media = gsap.matchMedia();
  media.add({ desktop: '(min-width: 761px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
    if (!context.conditions.motion) return;
    const desktop = context.conditions.desktop;
    const distance = desktop ? 42 : 28;
    const cleanups = [], filterTweens = [];
    let cancelled = false;
    const title = document.querySelector('h1');
    const lines = title ? [...title.querySelectorAll('.hero-title-line')] : [];
    const hero = gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'transform,opacity' } });
    const location = document.querySelector('.hero-location');
    if (location) hero.from(location, { y: -12, opacity: .55, duration: .55 }, 0);
    if (title) hero.from(lines.length ? lines : title, {
      y: distance, opacity: .5, duration: .85, stagger: .12
    }, .05);
    const lead = document.querySelector('.hero-description, .page-hero-copy > .lead');
    if (lead) hero.from(lead, { y: 20, opacity: .65, duration: .7 }, .2);
    // Buttons never wait for a reveal or have their pointer events disabled.

    const setupScenes = () => {
      const reveal = (targets, trigger, vars = {}) => {
        const elements = [...targets].filter(el => !el.hidden);
        if (!elements.length) return;
        gsap.from(elements, {
          y: distance, opacity: .55, duration: .8, stagger: .08,
          ease: 'power3.out', clearProps: 'transform,opacity', immediateRender: false,
          scrollTrigger: { trigger, start: 'top 90%', once: true }, ...vars
        });
      };
      document.querySelectorAll('.home-paths .section-heading, .home-departments .section-heading, .workshop-copy, .store-copy, .page-section > .wrap > .section-title, .choice-heading, .home-visit h2').forEach(el => {
        reveal([el], el);
      });
      document.querySelectorAll('.path-grid, .editorial-grid, .brand-wall, .journey').forEach(grid => {
        reveal(grid.children, grid);
      });
      document.querySelectorAll('.department-grid, .category-grid').forEach(grid => {
        [...grid.children].forEach((card,index) => {
          reveal([card],card,{delay:(index % (desktop ? 3 : 2))*.06});
        });
      });
      document.querySelectorAll('.helmet-fan').forEach(fan => {
        gsap.from(fan.children, {
          x: 0, rotation: 0, yPercent: 70, opacity: .7,
          duration: 1, stagger: .045, ease: 'power3.out', immediateRender: false,
          clearProps: 'transform,opacity',
          scrollTrigger: {trigger:fan.closest('.helmet-scene'),start:'top 88%',once:true}
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

      // Contained depth: only photographs move; the reading flow never changes.
      document.querySelectorAll('.store-photo-frame').forEach(frame => {
        const photo = frame.querySelector('img');
        if (!photo) return;
        gsap.fromTo(photo, { y: desktop ? 18 : 10, scale: 1.08 }, {
          y: desktop ? -18 : -10, scale: 1.08, ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: .4, invalidateOnRefresh: true }
        });
      });
      document.querySelectorAll('.page-hero-media:not(:has(.workshop-scene))').forEach(frame => {
        const photo = frame.querySelector('img');
        if (photo && desktop) gsap.from(photo, {x:28,opacity:.8,duration:.85,ease:'power3.out',clearProps:'transform,opacity'});
      });
      const brand = document.querySelector('.foot-brand');
      if (brand) reveal(brand.children, brand, { y: 30, duration: .9, stagger: .12 });
      const community = document.querySelector('.community-row');
      if (community) reveal(community.children, community, { y: 24, stagger: .1 });

      const onFilter = event => {
        const grid = event.detail?.grid;
        if (!grid) return;
        const cards = [...grid.children].filter(el => !el.hidden);
        gsap.killTweensOf([...grid.children]);
        gsap.set([...grid.children], { clearProps: 'transform,opacity' });
        filterTweens.push(gsap.from(cards, {
          y: desktop ? 30 : 18, opacity: .6, duration: .55, stagger: .055,
          ease: 'power3.out', clearProps: 'transform,opacity'
        }));
        ScrollTrigger.refresh();
      };
      document.addEventListener('motorbike:categories-changed', onFilter);
      cleanups.push(() => {
        document.removeEventListener('motorbike:categories-changed', onFilter);
        filterTweens.forEach(tween => tween.kill());
        gsap.set(document.querySelectorAll('.category-card'), {clearProps:'transform,opacity'});
      });
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', onLoad, { once: true });
      cleanups.push(() => window.removeEventListener('load', onLoad));
    };
    // Let the real hero photograph paint before measuring all below-fold scenes.
    // This preserves the hero entrance and lowers work on the LCP critical path.
    const photograph = document.querySelector('.home-hero-photo, .page-hero-media img');
    Promise.all([document.fonts?.ready, photograph?.decode().catch(() => {})]).then(() => {
      requestAnimationFrame(() => requestAnimationFrame(async () => {
        if (cancelled) return;
        await loadScrollTrigger();
        if (cancelled || !window.ScrollTrigger) return;
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
        document.documentElement.dataset.motionReady = 'true';
      }));
    });
    return () => {cancelled = true; delete document.documentElement.dataset.motionReady; cleanups.forEach(cleanup => cleanup());};
  });
})();
