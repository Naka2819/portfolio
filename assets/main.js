// Nom complet qui se replie en initiales, et se déplie au survol
const top_ = document.querySelector('.top');
if (top_) {
  const names = top_.querySelectorAll('.c, .d'); let tm;
  const open = () => { clearTimeout(tm); top_.classList.add('open'); };
  const close = () => { tm = setTimeout(() => top_.classList.remove('open'), 220); };
  names.forEach(n => { n.addEventListener('mouseenter', open); n.addEventListener('mouseleave', close); });
  if (top_.classList.contains('intro-load')) setTimeout(() => { if (![...names].some(n => n.matches(':hover'))) top_.classList.remove('open'); }, 1600);
}

// Apparition au défilement
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// Slider de l'accueil
document.querySelectorAll('.slider').forEach(s => {
  const items = [...s.querySelectorAll('.slides > *')], dots = [...s.querySelectorAll('.dots button')];
  let i = 0, t;
  const go = n => { items[i].classList.remove('on'); dots[i].classList.remove('on'); i = n; items[i].classList.add('on'); dots[i].classList.add('on');
    const v = items[i].tagName === 'VIDEO' ? items[i] : null; if (v) { v.currentTime = 0; v.play().catch(()=>{}); } };
  const auto = () => { clearInterval(t); t = setInterval(() => go((i + 1) % items.length), 5000); };
  dots.forEach((d, k) => d.addEventListener('click', () => { go(k); auto(); }));
  auto();
});

// Vignette qui suit la souris sur la liste de projets
const thumb = document.querySelector('.hover-thumb');
if (thumb) {
  const img = thumb.querySelector('img');
  document.querySelectorAll('.row[data-thumb]').forEach(r => {
    r.addEventListener('mouseenter', () => { img.src = r.dataset.thumb; thumb.classList.add('on'); });
    r.addEventListener('mouseleave', () => thumb.classList.remove('on'));
  });
  addEventListener('mousemove', e => { thumb.style.left = e.clientX + 'px'; thumb.style.top = e.clientY + 'px'; });
}

// Lignes cliquables
document.querySelectorAll('.row[data-href]').forEach(r => r.addEventListener('click', () => location.href = r.dataset.href));

// Filtres + vue liste/grille (page Projets)
const page = document.querySelector('[data-projects]');
if (page) {
  const chips = page.querySelectorAll('.chip'), items = page.querySelectorAll('[data-cat]');
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.toggle('on', x === c));
    items.forEach(it => it.style.display = (c.dataset.f === 'all' || it.dataset.cat === c.dataset.f) ? '' : 'none');
  }));
  const vb = page.querySelectorAll('.views button');
  vb.forEach(b => b.addEventListener('click', () => { vb.forEach(x => x.classList.toggle('on', x === b)); page.classList.toggle('is-grid', b.dataset.v === 'grid'); }));
}
