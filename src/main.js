/* VT6 — bez knihoven: nativní scroll, IntersectionObserver, CSS přechody */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* hero: rozdělit nadpis na slova */
  $$('[data-split] .ln').forEach((ln, li) => {
    const em = ln.querySelector('em');
    const target = em || ln;
    const words = target.textContent.trim().split(/\s+/);
    target.innerHTML = words.map((w, i) => `<span class="w"><span style="transition-delay:${(li * 3 + i) * 70 + 150}ms">${w}</span></span>`).join(' ');
  });
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('is-ready')));

  /* navigace */
  const nav = $('#nav'), toggle = $('#toggle');
  const onScroll = () => nav.classList.toggle('is-solid', scrollY > 60);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
  }));

  /* odhalování při scrollu */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    if (el.classList.contains('reveal-group')) {
      $$('.reveal-item', el).forEach((it, i) => setTimeout(() => it.classList.add('is-in'), i * 110));
    } else el.classList.add('is-in');
    io.unobserve(el);
  }), { rootMargin: '0px 0px -12% 0px' });
  $$('.reveal, .reveal-group, .clip').forEach(el => io.observe(el));

  /* počítadla */
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), d = 1600;
    const step = t => { const p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    el.textContent = '0'; requestAnimationFrame(step); co.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => co.observe(el));

  /* otevřeno / zavřeno podle otevírací doby (Europe/Prague) */
  const hours = $$('.hours tr').map(tr => ({ tr, days: tr.dataset.days.split(',').map(Number), t: tr.querySelector('td').textContent.split('–').map(s => s.trim()) }));
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
  const mins = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const day = now.getDay(), cur = now.getHours() * 60 + now.getMinutes();
  const today = hours.find(h => h.days.includes(day));
  if (today) {
    today.tr.classList.add('is-today');
    const [od, doo] = today.t, open = cur >= mins(od) && cur < mins(doo);
    const txt = open ? `Teď máme otevřeno · do ${doo}` : (cur < mins(od) ? `Dnes otevíráme v ${od}` : `Zítra od ${(hours.find(h => h.days.includes((day + 1) % 7)) || today).t[0]}`);
    $$('[data-status]').forEach(el => { el.classList.toggle('is-open', open); $('[data-status-text]', el).textContent = (el.classList.contains('hero__status') ? 'Restaurace · ' : '') + txt; });
  }

  /* lístek: záložky */
  const tabs = $$('.tab');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { const on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
    $$('.panel').forEach(p => { const on = p.id === 'p-' + t.dataset.tab; p.hidden = !on; p.classList.toggle('is-on', on); });
    const first = $(`#p-${t.dataset.tab} .dish.has-foto`); if (first) show(first);
  }));

  /* lístek: talíř ukazuje jídlo, na které míříte */
  const plates = $$('[data-plate]'), cap = $('[data-plate-cap]');
  let active;
  function show(li) {
    const no = li.dataset.dish;
    plates.forEach(img => img.classList.toggle('is-on', img.dataset.plate === no));
    if (cap) cap.textContent = li.dataset.cap;
    if (active) active.classList.remove('is-active');
    active = li; li.classList.add('is-active');
  }
  $$('.dish.has-foto').forEach(li => {
    li.addEventListener('mouseenter', () => show(li));
    li.addEventListener('focus', () => show(li));
  });
  const tip = $('.dish[data-dish="14"]'); if (tip) show(tip);

  /* ubytování: přepínač adres */
  const sw = $('.switch'), sbs = $$('.switch__b');
  sbs.forEach((b, i) => b.addEventListener('click', () => {
    sw.dataset.pos = i;
    sbs.forEach(x => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
    $$('.place').forEach(p => { const on = p.id === 's-' + b.dataset.stay; p.hidden = !on; p.classList.toggle('is-on', on); });
  }));
})();
