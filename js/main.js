// YORK NAILS — mobile menu, services carousel, today's hours, footer year. No dependencies.
(function () {
  // ?preview shows sections that are waiting for real content (data-pending).
  if (/[?&]preview(=|&|$)/.test(location.search) && document.querySelector('[data-pending]')) {
    document.documentElement.classList.add('is-preview');
    var note = document.createElement('p');
    note.className = 'preview-banner';
    note.textContent = 'Preview — dashed sections are hidden on the live site until real content is added.';
    document.body.appendChild(note);
  }

  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('menu');
  var desktop = window.matchMedia('(min-width: 64em)');

  // ----- Mobile menu -----
  function setMenu(open) {
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.visually-hidden').textContent = open ? 'Close menu' : 'Menu';
  }
  toggle.addEventListener('click', function () {
    setMenu(menu.hidden);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) {
      setMenu(false);
      toggle.focus();
    }
  });
  desktop.addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
  });

  // ----- Services carousel (scroll-snap + arrows) -----
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('[data-track]');
    var prev = carousel.querySelector('[data-prev]');
    var next = carousel.querySelector('[data-next]');
    function step() {
      var card = track.firstElementChild;
      return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  // ----- Price list: open a category when its card or a hash link targets it -----
  function openFromHash() {
    var target = location.hash && document.querySelector(location.hash);
    if (target && target.tagName === 'DETAILS') target.open = true;
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
  // Same card clicked twice doesn't change the hash, so open on click too.
  document.querySelectorAll('[data-open-cat]').forEach(function (link) {
    link.addEventListener('click', function () {
      var target = document.querySelector(link.getAttribute('href'));
      if (target) target.open = true;
    });
  });
  // Wide screens: show the first category expanded so prices are visible at a glance.
  var firstCat = document.querySelector('.menu-cat');
  if (firstCat && window.matchMedia('(min-width: 48em)').matches) firstCat.open = true;

  // ----- Call links inside an embed (e.g. a Webcake iframe) -----
  // Browsers block tel: links that navigate inside an iframe, so hand the
  // call to the top window, or a new window if the embed doesn't allow that.
  if (window.self !== window.top) {
    document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        try { window.top.location.href = link.href; }
        catch (err) { window.open(link.href, '_blank'); }
      });
    });
  }

  // ----- Today's opening hours (UK time) -----
  // Mon–Sat 9am–7pm, Sun 10am–5pm
  var today = document.querySelector('[data-today]');
  if (today) {
    try {
      var day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/London' }).format(new Date());
      today.textContent = day === 'Sun' ? 'Open today 10am–5pm' : 'Open today 9am–7pm';
    } catch (err) { /* keep default text */ }
  }

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
