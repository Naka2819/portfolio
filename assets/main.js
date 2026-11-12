const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const canHover = matchMedia('(hover: hover)').matches;
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- Nom complet <-> initiales ---------- */
const top_ = $('.top');
function measureLetters() {
  if (!top_) return;
  top_.classList.add('measure');
  $$('.rest i', top_).forEach(i => i.style.setProperty('--w', i.getBoundingClientRect().width + 'px'));
  top_.classList.remove('measure');
}
if (top_) {
  const names = $$('.c, .d', top_); let tm;
  const open = () => { if (document.documentElement.classList.contains('intro')) return; clearTimeout(tm); top_.classList.add('open'); };
  const close = () => { tm = setTimeout(() => top_.classList.remove('open'), 200); };
  names.forEach(n => { n.addEventListener('mouseenter', open); n.addEventListener('mouseleave', close); });
  addEventListener('resize', measureLetters);
}

/* ---------- Ouverture : nom centré qui remonte ---------- */
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  measureLetters();
  const html = document.documentElement;
  if (!html.classList.contains('intro') || !top_) return;
  top_.classList.add('open');
  // attend que les lettres soient dépliées pour mesurer le bloc
  setTimeout(() => {
    const a = $('.c', top_).getBoundingClientRect(), b = $('.d', top_).getBoundingClientRect();
    const left = a.left, right = b.right, t = Math.min(a.top, b.top), h = Math.max(a.bottom, b.bottom) - t;
    const dx = (innerWidth - (right - left)) / 2 - left, dy = (innerHeight - h) / 2 - t;
    top_.style.transform = `translate(${dx}px, ${dy}px)`;
    top_.classList.add('placed');
    setTimeout(() => {
      top_.classList.add('flying'); top_.style.transform = '';
      setTimeout(() => {
        top_.classList.remove('open', 'flying');
        html.classList.remove('intro');
        try { sessionStorage.setItem('introVue', '1'); } catch (e) {}
        $$('.rv').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('in'); });
      }, 1150);
    }, 1500);
  }, 900);
});

/* ---------- Apparition au défilement ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting && !document.documentElement.classList.contains('intro')) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
$$('.rv').forEach(el => io.observe(el));

/* ---------- Slider de l'accueil ---------- */
$$('.slider').forEach(s => {
  const items = $$('.slides > *', s), dots = $$('.dots button', s);
  let i = 0, t;
  const go = n => {
    items[i].classList.remove('on'); dots[i].classList.remove('on');
    if (items[i].tagName === 'VIDEO') items[i].pause();
    i = n; items[i].classList.add('on'); dots[i].classList.add('on');
    if (items[i].tagName === 'VIDEO') { items[i].currentTime = 0; items[i].play().catch(() => {}); }
  };
  const auto = () => { clearInterval(t); t = setInterval(() => go((i + 1) % items.length), 5000); };
  dots.forEach((d, k) => d.addEventListener('click', () => { go(k); auto(); }));
  auto();
});

/* ---------- Vidéos : lecture au survol seulement ---------- */
$$('[data-hover-play]').forEach(box => {
  const v = $('video', box); if (!v) return;
  if (canHover) {
    box.addEventListener('mouseenter', () => v.play().catch(() => {}));
    box.addEventListener('mouseleave', () => v.pause());
  } else {
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: .6 }).observe(box);
  }
});

/* ---------- Effet magnétique ---------- */
if (canHover) {
  const targets = [...$$('.btn, .chip, .views button, .top nav a, .arrow, .back'), ...$$('[data-mag]')];
  targets.forEach(el => {
    const strength = parseFloat(el.dataset.mag || '0.35');
    el.classList.add('mag');
    let inner = null;
    if (!el.dataset.mag && !el.querySelector('.mag-in')) {
      inner = document.createElement('span'); inner.className = 'mag-in';
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
    }
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const loop = () => {
      cx = lerp(cx, tx, .15); cy = lerp(cy, ty, .15);
      el.style.transform = `translate(${cx}px, ${cy}px)`;
      if (inner) inner.style.transform = `translate(${cx * .5}px, ${cy * .5}px)`;
      raf = (Math.abs(cx - tx) > .05 || Math.abs(cy - ty) > .05) ? requestAnimationFrame(loop) : null;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength; kick();
    });
    el.addEventListener('mouseleave', () => { tx = 0; ty = 0; kick(); });
  });
}

/* ---------- Survol des projets (vignette qui glisse + bulle « Voir ») ---------- */
const thumb = $('.hover-thumb');
if (thumb && canHover) {
  const colors = ['#1C2B4A', '#3A2F28', '#2B2B2E', '#23324A', '#3B2440', '#2E3A2C', '#40322A', '#1F3440'];
  thumb.innerHTML = '<div class="ht-strip"></div>';
  const strip = $('.ht-strip', thumb);
  const bubble = document.createElement('div'); bubble.className = 'cursor-bubble'; bubble.textContent = 'Voir'; document.body.appendChild(bubble);
  $$('.list').forEach(list => {
    const rows = $$('.row', list);
    rows.forEach((r, k) => {
      const tile = document.createElement('div'); tile.className = 'ht-tile';
      if (r.dataset.thumb) tile.innerHTML = `<img src="${r.dataset.thumb}" alt="">`;
      else { const n = $('.name', r).cloneNode(true); $$('.tag', n).forEach(x => x.remove()); tile.style.background = colors[k % colors.length]; tile.innerHTML = `<span>${n.textContent.trim()}</span>`; }
      strip.appendChild(tile);
      r.addEventListener('mouseenter', () => {
        strip.style.transform = `translateY(${-k * 100}%)`;
        bubble.textContent = r.dataset.href ? 'Voir' : 'Bientôt';
      });
    });
    list.addEventListener('mouseenter', () => { list.classList.add('hovering'); thumb.classList.add('on'); bubble.classList.add('on'); });
    list.addEventListener('mouseleave', () => { list.classList.remove('hovering'); thumb.classList.remove('on'); bubble.classList.remove('on'); });
  });
  let mx = innerWidth / 2, my = innerHeight / 2, tx = mx, ty = my, bx = mx, by = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function follow() {
    tx = lerp(tx, mx, .1); ty = lerp(ty, my, .1); bx = lerp(bx, mx, .22); by = lerp(by, my, .22);
    thumb.style.left = tx + 'px'; thumb.style.top = ty + 'px';
    bubble.style.left = bx + 'px'; bubble.style.top = by + 'px';
    requestAnimationFrame(follow);
  })();
}

/* ---------- Lignes cliquables ---------- */
$$('.row[data-href]').forEach(r => {
  r.addEventListener('click', () => location.href = r.dataset.href);
  r.addEventListener('keydown', e => { if (e.key === 'Enter') location.href = r.dataset.href; });
});

/* ---------- Filtres + vue liste/grille ---------- */
const page = $('[data-projects]');
if (page) {
  const chips = $$('.chip', page), items = $$('[data-cat]', page);
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.toggle('on', x === c));
    items.forEach(it => it.style.display = (c.dataset.f === 'all' || it.dataset.cat === c.dataset.f) ? '' : 'none');
  }));
  const vb = $$('.views button', page);
  vb.forEach(b => b.addEventListener('click', () => { vb.forEach(x => x.classList.toggle('on', x === b)); page.classList.toggle('is-grid', b.dataset.v === 'grid'); }));
}
