/* Goddess Divana · v3 «El Palacio» */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const WA = '34635813549';
  const waLink = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  };
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Enlaces de WhatsApp ---------- */
  $$('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa); });

  /* ---------- Aviso breve ---------- */
  const toastEl = $('#toast');
  let toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* =========================================================
     Cadenas plateadas de la portada (se mueven con el ratón,
     el dedo o el scroll, y se quedan quietas al rato)
     ========================================================= */
  const Chains = (() => {
    const cv = $('#chains');
    const hero = $('.hero');
    if (!cv || !cv.getContext) return { drop() {} };
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, seg = 14, chains = [], raf = 0, calm = 0, active = false, visible = true;
    let dropOff = 0, dropStart = 0, dropT0 = 0, total = 1;
    const ptr = { x: -9999, y: -9999, vx: 0, vy: 0, has: false };
    const R = 70, R2 = R * R;

    function specs() {
      if (W < 860) return [{ a: .035, len: .2 }, { a: .965, len: .28 }];
      return [{ a: .028, len: .56 }, { a: .566, len: .36 }, { a: .968, len: .72 }];
    }

    function build() {
      seg = clamp(W / 92, 11, 16);
      chains = specs().map(s => {
        const ax = s.a * W, ay = -3;
        const pts = [];
        if (s.b != null) {
          const bx = s.b * W, dist = bx - ax, n = Math.max(4, Math.round(dist * s.slack / seg));
          for (let i = 0; i <= n; i++) { const x = ax + dist * i / n; pts.push({ x, y: ay + Math.sin(Math.PI * i / n) * 30, px: x, py: ay }); }
          pts[0].pin = { x: ax, y: ay };
          pts[n].pin = { x: bx, y: ay };
          return { pts, sl: dist * s.slack / n };
        }
        const n = Math.max(3, Math.round(s.len * H / seg)), sl = s.len * H / n;
        for (let i = 0; i <= n; i++) { const y = ay + i * sl; pts.push({ x: ax, y, px: ax, py: y }); }
        pts[0].pin = { x: ax, y: ay };
        return { pts, sl };
      });
      total = chains.reduce((t, c) => t + c.pts.length, 0);
    }

    function step() {
      const mob = W < 860, g = .45, damp = mob ? .975 : .986, vmax = mob ? 7 : 16, push = mob ? .07 : .2;
      let energy = 0;
      for (const c of chains) {
        const P = c.pts;
        for (const p of P) {
          if (p.pin) { p.x = p.px = p.pin.x; p.y = p.py = p.pin.y + dropOff; continue; }
          const vx = clamp((p.x - p.px) * damp, -vmax, vmax), vy = clamp((p.y - p.py) * damp, -vmax, vmax);
          p.px = p.x; p.py = p.y;
          p.x += vx; p.y += vy + g;
          energy += Math.abs(vx) + Math.abs(vy);
          if (ptr.has) {
            const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const f = 1 - Math.sqrt(d2) / R;
              p.x += ptr.vx * push * f + (dx > 0 ? 1 : -1) * f * (mob ? .4 : 1.2);
              p.y += ptr.vy * push * .5 * f;
            }
          }
        }
        for (let k = 0; k < 10; k++) {
          for (let i = 0; i < P.length - 1; i++) {
            const a = P[i], b = P[i + 1];
            const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .001;
            const diff = (d - c.sl) / d;
            if (a.pin) { b.x -= dx * diff; b.y -= dy * diff; }
            else if (b.pin) { a.x += dx * diff; a.y += dy * diff; }
            else { const hx = dx * diff * .5, hy = dy * diff * .5; a.x += hx; a.y += hy; b.x -= hx; b.y -= hy; }
          }
        }
      }
      return energy;
    }

    function link(x, y, w, h, r) {
      ctx.beginPath();
      if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.shadowColor = 'rgba(255, 43, 69, .35)';
      ctx.shadowBlur = 7;
      for (const c of chains) {
        const P = c.pts, L = c.sl * 1.55, Wd = c.sl * .66, T = c.sl * .27;
        for (let pass = 0; pass < 2; pass++) {
          for (let i = pass; i < P.length - 1; i += 2) {
            const a = P[i], b = P[i + 1];
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            if (my < -30 || my > H + 30) continue;
            ctx.save();
            ctx.translate(mx, my);
            ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x));
            if (pass === 0) {
              const gr = ctx.createLinearGradient(0, -Wd / 2, 0, Wd / 2);
              gr.addColorStop(0, '#5a5a62'); gr.addColorStop(.28, '#f6f6f9'); gr.addColorStop(.52, '#82828c');
              gr.addColorStop(.78, '#dcdce3'); gr.addColorStop(1, '#3a3a40');
              ctx.lineWidth = c.sl * .21;
              ctx.strokeStyle = gr;
              link(-L / 2, -Wd / 2, L, Wd, Wd / 2);
              ctx.stroke();
            } else {
              const gr = ctx.createLinearGradient(0, -T / 2, 0, T / 2);
              gr.addColorStop(0, '#ffffff'); gr.addColorStop(.5, '#8c8c96'); gr.addColorStop(1, '#2c2c31');
              ctx.fillStyle = gr;
              link(-L / 2, -T / 2, L, T, T / 2);
              ctx.fill();
            }
            ctx.restore();
          }
        }
      }
    }

    function loop(now) {
      raf = 0;
      if (dropT0) {
        const t = Math.min(1, (now - dropT0) / 1300);
        dropOff = dropStart * Math.pow(1 - t, 3);
        if (t >= 1) dropT0 = 0;
      }
      const e = step();
      ptr.vx *= .55; ptr.vy *= .55;
      draw();
      calm = (e < total * .012 && !dropT0) ? calm + 1 : 0;
      if (calm < 50 && visible) raf = requestAnimationFrame(loop);
    }
    function wake() { if (!raf && active && visible) { calm = 0; raf = requestAnimationFrame(loop); } }

    function resize() {
      const nw = hero.clientWidth, nh = hero.clientHeight;
      if (Math.abs(nw - W) < 2 && Math.abs(nh - H) < 90) return;
      W = nw; H = nh;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (active) { dropOff = 0; dropT0 = 0; for (let i = 0; i < 260; i++) step(); draw(); }
    }

    function drop() {
      resize();
      active = true;
      if (reduce) { for (let i = 0; i < 320; i++) step(); draw(); return; }
      dropStart = -H * .7;
      dropOff = dropStart;
      chains.forEach(c => c.pts.forEach((p, i) => {
        p.y += dropStart; p.py = p.y;
        p.px = p.x - (Math.random() - .5) * 4 * (i / c.pts.length);
      }));
      dropT0 = performance.now();
      wake();
    }

    if ('ResizeObserver' in window) new ResizeObserver(() => resize()).observe(hero);
    else addEventListener('resize', resize);
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(hero);

    let lastX = 0, lastY = 0;
    const move = (cx, cy) => {
      if (!active || !visible) return;
      const r = cv.getBoundingClientRect();
      const x = cx - r.left, y = cy - r.top;
      if (ptr.has) { ptr.vx = clamp(x - lastX, -60, 60); ptr.vy = clamp(y - lastY, -60, 60); }
      lastX = ptr.x = x; lastY = ptr.y = y; ptr.has = true;
      wake();
    };
    addEventListener('pointermove', e => move(e.clientX, e.clientY), { passive: true });
    addEventListener('touchmove', e => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
    let sy = scrollY;
    addEventListener('scroll', () => {
      const d = clamp(scrollY - sy, -24, 24);
      sy = scrollY;
      if (!active || !visible || !d) return;
      chains.forEach((c, k) => {
        const dir = k % 2 ? 1 : -1, n = c.pts.length;
        c.pts.forEach((p, i) => { if (!p.pin) p.x += d * (W < 860 ? .012 : .03) * dir * (i / n); });
      });
      wake();
    }, { passive: true });

    return { drop };
  })();

  /* =========================================================
     Entrada: sello de lacre (+18)
     ========================================================= */
  const gate = $('#gate');
  const SEAL_KEY = 'divana-sello';
  let started = false;
  function start() {
    if (started) return;
    started = true;
    $('#neon').classList.add('lit');
    Chains.drop();
  }
  function enterSite() {
    if (!gate || gate.classList.contains('broken')) return;
    store.set(SEAL_KEY, '1');
    if (!location.hash) scrollTo(0, 0);
    gate.classList.add('broken');
    setTimeout(() => gate.classList.add('leaving'), reduce ? 0 : 520);
    setTimeout(() => { document.body.classList.remove('locked'); start(); }, reduce ? 30 : 900);
    setTimeout(() => gate.remove(), reduce ? 300 : 2200);
  }
  if (!gate || store.get(SEAL_KEY) === '1') {
    if (gate) gate.remove();
    document.body.classList.remove('locked');
    requestAnimationFrame(start);
  } else {
    $('#seal').addEventListener('click', enterSite);
    $('[data-enter]', gate).addEventListener('click', enterSite);
    setTimeout(() => $('#seal').focus({ preventScroll: true }), 400);
  }

  /* ---------- Navegación ---------- */
  const nav = $('#nav'), burger = $('#burger'), links = $('#nav-links');
  const setMenu = open => {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Cerrar el menú' : 'Abrir el menú');
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const secIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('a', links).forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => secIO.observe(s));

  /* ---------- Aparición al bajar ---------- */
  $$('.stays > .rv, .steps > .rv, .pillars > .rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 90 + 'ms'; });
  const rvIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => rvIO.observe(el));
  const neonIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { setTimeout(() => e.target.classList.add('lit'), 350); neonIO.unobserve(e.target); }
  }), { threshold: .8 });
  $$('.neon.small').forEach(n => neonIO.observe(n));

  /* ---------- Brillo de la plata (sigue al ratón, o al scroll en el móvil) ---------- */
  const chromes = $$('.chrome');
  let shineX = 38, shineRAF = 0;
  const paintShine = () => { shineRAF = 0; chromes.forEach(c => c.style.setProperty('--mx', shineX.toFixed(1) + '%')); };
  if (finePointer) {
    addEventListener('pointermove', e => { shineX = 12 + (e.clientX / innerWidth) * 76; if (!shineRAF) shineRAF = requestAnimationFrame(paintShine); }, { passive: true });
  } else {
    addEventListener('scroll', () => { shineX = 18 + (scrollY / 5) % 64; if (!shineRAF) shineRAF = requestAnimationFrame(paintShine); }, { passive: true });
  }

  /* ---------- Botón flotante de WhatsApp ---------- */
  const fab = $('.fab');
  new IntersectionObserver(es => fab.classList.toggle('show', !es[0].isIntersecting), { threshold: .15 }).observe($('.hero'));

  /* =========================================================
     II · El Palacio: plano interactivo
     ========================================================= */
  const ROOMS = [
    { n: 'El Vestíbulo', img: 'img/room-of-pain.jpg', pos: '50% 62%', d: 'Aquí empieza mi territorio. Te descalzas, te arrodillas y dejas fuera quien eras. A partir de esta puerta, hablas solo cuando Yo te lo permita.', t: ['Protocolo', 'De rodillas', 'Silencio'] },
    { n: 'El Salón del Trono', img: 'img/trono.jpg', pos: '50% 22%', d: 'Neón rojo, velas encendidas y mi trono en lo alto. Desde aquí te miro, te juzgo y decido qué haré contigo. Tú, abajo. Siempre abajo.', t: ['Trono', 'Neón', 'Adoración'] },
    { n: 'La Mazmorra', img: 'img/mazmorra-cadena.jpg', pos: '50% 14%', d: 'En el lugar más escondido del Palacio: paredes de capitoné, cruz, cadenas y argollas. Aquí solo tú y Yo oiremos tus gritos.', t: ['Cruz', 'Cadenas', 'Disciplina'] },
    { n: 'Los Aposentos', img: 'img/aposentos.jpg', pos: '50% 50%', d: 'Las estancias de los internos. Aquí pasas la noche cuando te concedo quedarte… si es que te dejo dormir.', t: ['Internamientos', 'Noches', 'Penumbra roja'] },
    { n: 'El Vestidor', img: 'img/vestidor.jpg', pos: '72% 50%', d: 'Mi colección de tacones, corsés y látex. Aprenderás a cuidarlos, a limpiarlos y a adorarlos. Algunos solo los verás desde el suelo.', t: ['Tacones', 'Látex', 'Fetiche'] },
    { n: 'La Jaula', img: 'img/pies-jaula.jpg', pos: '50% 30%', d: 'Para el perro que se porta mal. Desde dentro, solo verás mis Pies.', t: ['Castigo', 'Animalización', 'Pies'] },
    { n: 'La Terraza', img: 'img/terraza.jpg', pos: '50% 45%', d: 'Sol de Madrid, tacones de aguja y Dóminas invitadas. Hasta al aire libre, el Palacio sigue siendo mío.', t: ['Al aire libre', 'Dóminas invitadas', 'Sol'] }
  ];
  const roomEls = $$('.room');
  const roomList = $('#room-list');
  roomList.innerHTML = ROOMS.map((r, i) => `<button type="button" role="tab" aria-selected="false" data-i="${i}"><span>${ROMAN[i]}</span>${r.n.replace(/^(El|La|Los) /, '')}</button>`).join('');
  const roomBtns = $$('button', roomList);
  const pvImg = $('#pv-img');
  let room = -1, swapT = 0;
  function setRoom(i) {
    i = (i + ROOMS.length) % ROOMS.length;
    if (i === room) return;
    room = i;
    const r = ROOMS[i];
    roomEls.forEach(g => g.classList.toggle('on', +g.dataset.room === i));
    roomBtns.forEach((b, k) => b.setAttribute('aria-selected', k === i));
    $('#pv-num').textContent = 'Estancia ' + ROMAN[i];
    $('#pv-name').textContent = r.n;
    $('#pv-desc').textContent = r.d;
    $('#pv-tags').innerHTML = r.t.map(t => `<li>${t}</li>`).join('');
    $('#pv-count').textContent = `${ROMAN[i]} / ${ROMAN[ROOMS.length - 1]}`;
    pvImg.classList.add('out');
    clearTimeout(swapT);
    const pre = new Image();
    pre.src = r.img;
    const ready = pre.decode ? pre.decode().catch(() => {}) : Promise.resolve();
    swapT = setTimeout(() => ready.then(() => {
      if (room !== i) return;
      pvImg.src = r.img;
      pvImg.alt = `${r.n} del Palacio de Goddess Divana`;
      pvImg.style.objectPosition = r.pos;
      requestAnimationFrame(() => pvImg.classList.remove('out'));
    }), 260);
  }
  roomEls.forEach(g => {
    g.addEventListener('click', () => setRoom(+g.dataset.room));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRoom(+g.dataset.room); } });
  });
  roomBtns.forEach(b => b.addEventListener('click', () => setRoom(+b.dataset.i)));
  $('#pv-prev').addEventListener('click', () => setRoom(room - 1));
  $('#pv-next').addEventListener('click', () => setRoom(room + 1));
  setRoom(2);

  /* =========================================================
     IV · La Corte: sesiones conjuntas
     ========================================================= */
  const GUESTS = {
    esclavos: { n: 'otros esclavos', s: 'Esclavos', i: 'i-esclavo' },
    sissys: { n: 'sissys para servirnos', s: 'Sissys', i: 'i-sissy' },
    esclava: { n: 'una esclava', s: 'Esclava', i: 'i-esclava' },
    macho: { n: 'un macho, para cornudos', s: 'Macho', i: 'i-macho' },
    mezcla: { n: 'una mezcla de esclavos', s: 'Mezcla', i: 'i-mezcla' }
  };
  const DOMS = { 1: 'La Diosa', 2: 'Dos Dóminas', 3: 'Tres Dóminas' };
  let doms = 1;
  const guests = new Set();
  const dais = $('#dais'), floor = $('#floor'), sum = $('#court-sum'), send = $('#court-send');
  const listES = arr => arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
  const piece = (main, label) => `<span class="piece${main ? ' main' : ''}"><svg viewBox="0 0 40 64" aria-hidden="true"><use href="#queen"/></svg><small>${label}</small></span>`;
  function renderCourt() {
    const order = doms === 1 ? [true] : doms === 2 ? [true, false] : [false, true, false];
    dais.innerHTML = order.map(m => piece(m, m ? 'La Diosa' : 'Dómina')).join('');
    floor.innerHTML = `<span class="token you"><i><svg aria-hidden="true"><use href="#i-esclavo"/></svg></i><small>Tú</small></span>` +
      [...guests].map(k => `<span class="token"><i><svg aria-hidden="true"><use href="#${GUESTS[k].i}"/></svg></i><small>${GUESTS[k].s}</small></span>`).join('');
    const names = [...guests].map(k => GUESTS[k].n);
    let text;
    if (doms === 1 && !names.length) text = 'La Diosa, a solas contigo.';
    else if (!names.length) text = `${DOMS[doms]} para ti solo.`;
    else text = `${DOMS[doms]} con ${listES(names)}.`;
    sum.textContent = text;
    send.href = waLink(`¿Puedo dirigirme a usted? Deseo presentarle mi Corte para una sesión conjunta en su Palacio: ${text.replace(/\.$/, '')}. Quedo a la espera de saber el tributo apropiado.`);
  }
  $$('[data-doms]').forEach(b => b.addEventListener('click', () => {
    doms = +b.dataset.doms;
    $$('[data-doms]').forEach(x => x.setAttribute('aria-checked', x === b));
    renderCourt();
  }));
  $$('[data-guest]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.guest;
    if (guests.has(k)) guests.delete(k); else guests.add(k);
    b.setAttribute('aria-pressed', guests.has(k));
    renderCourt();
  }));
  renderCourt();

  /* =========================================================
     VI · La Carta: prácticas que se añaden a la solicitud
     ========================================================= */
  const CARTA = [
    { n: 'Mente', d: 'Tu cabeza es lo primero que me pertenece.', t: ['Dominación mental', 'Psicología', 'Humillación', 'Control de orgasmo', 'Control de la castidad', 'Cuckold', 'Feminización', 'Transformismo', 'Juegos de rol', 'Animalización', 'Infantilismo', 'Iniciación'] },
    { n: 'Cuerpo', d: 'Disciplina, dolor y marcas, a mi ritmo.', t: ['Spanking', 'Flagelación', 'Disciplina inglesa', 'Bofetadas', 'Ballbusting', 'CBT', 'Trampling', 'Cera', 'Electroestimulación', 'Wrestling', 'Spitting'] },
    { n: 'Ataduras', d: 'Inmóvil, a ciegas y sin escapatoria.', t: ['Bondage', 'Ataduras', 'Inmovilización', 'Momificación', 'Privación sensorial', 'Control de la respiración', 'Internamientos'] },
    { n: 'Fetiches', d: 'Mis Pies, mi látex y mis caprichos.', t: ['Foot fetish', 'Face-sitting', 'Látex', 'Lencería', 'Smoking fetish', 'Food play', 'Lluvia dorada', 'Scat', 'Padding', 'Exhibicionismo', 'Dogging'] },
    { n: 'Strap-on', d: 'Aquí mando Yo. También en esto.', t: ['Strap-on', 'Pegging', 'Sodomización', 'Dilatación anal', 'Vibradores'] },
    { n: 'Online y tributo', d: 'Sírveme también a distancia. Y paga por ello.', t: ['Findom', 'Finfet', 'Money slave', 'Webcam', 'Vídeos personalizados', 'Contenido personalizado', 'Venta de artículos'] }
  ];
  const ptabs = $('#ptabs'), chipsEl = $('#chips'), pdesc = $('#pdesc');
  const wishCount = $('#wish-count'), wishAdd = $('#wish-add');
  const wishes = new Set();
  let cat = 0;
  ptabs.innerHTML = CARTA.map((c, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-c="${i}">${c.n}<i>${c.t.length}</i></button>`).join('');
  function renderChips() {
    $$('button', ptabs).forEach((b, i) => b.setAttribute('aria-selected', i === cat));
    pdesc.textContent = CARTA[cat].d;
    chipsEl.innerHTML = CARTA[cat].t.map((t, i) => `<button type="button" class="chip" aria-pressed="${wishes.has(t)}" style="animation-delay:${i * 25}ms">${t}</button>`).join('');
  }
  function renderWish() {
    const n = wishes.size;
    wishCount.textContent = n ? `Has elegido ${n} ${n === 1 ? 'deseo' : 'deseos'}.` : 'Aún no has elegido nada.';
    wishAdd.disabled = !n;
  }
  ptabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { cat = +b.dataset.c; renderChips(); } });
  chipsEl.addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    const t = b.textContent;
    if (wishes.has(t)) wishes.delete(t); else wishes.add(t);
    b.setAttribute('aria-pressed', wishes.has(t));
    renderWish();
  });
  wishAdd.addEventListener('click', () => {
    const f = $('#petition').elements;
    const list = [...wishes].join(', ');
    const cur = f.deseo.value.replace(/\n?Prácticas: .*$/, '').trim();
    f.deseo.value = (cur ? cur + '\n' : '') + 'Prácticas: ' + list;
    document.getElementById('audiencia').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    toast('Añadido a tu solicitud de audiencia');
  });
  renderChips();
  renderWish();

  /* =========================================================
     VII · Galería: vela y visor
     ========================================================= */
  const spot = $('#spot');
  const setLight = (cx, cy) => {
    const r = spot.getBoundingClientRect();
    spot.style.setProperty('--x', clamp((cx - r.left) / r.width * 100, 0, 100).toFixed(2) + '%');
    spot.style.setProperty('--y', clamp((cy - r.top) / r.height * 100, 0, 100).toFixed(2) + '%');
    spot.classList.add('moved');
  };
  spot.addEventListener('pointermove', e => setLight(e.clientX, e.clientY));
  spot.addEventListener('pointerdown', e => setLight(e.clientX, e.clientY));
  spot.addEventListener('touchmove', e => { const t = e.touches[0]; if (t) setLight(t.clientX, t.clientY); }, { passive: true });
  $('#spot-btn').addEventListener('click', e => {
    const on = spot.classList.toggle('on');
    e.currentTarget.setAttribute('aria-pressed', on);
    e.currentTarget.textContent = on ? 'Apagar las velas' : 'Encender las velas';
  });

  const GALLERY = [
    ['cadena-neon', 'Con cadenas plateadas, bajo el neón de su Palacio', 1050, 1400],
    ['pies-pov', 'Sus Pies vistos desde abajo', 787, 1400],
    ['roja-latex', 'Melena roja y látex rojo', 787, 1400],
    ['sala-roja', 'Sentada sobre su esclavo en la sala roja', 1059, 1400],
    ['beso', 'Retrato con corsé de charol', 878, 1400],
    ['mazmorra-cadena', 'En la mazmorra, con los tobillos encadenados', 1050, 1400],
    ['pies-rosa', 'Sus Pies en el salón rosa', 787, 1400],
    ['arnes', 'Arnés de cuero y cadenas', 787, 1400],
    ['trono-servicio', 'En el trono, servida por su esclavo', 1050, 1400],
    ['pies-jaula', 'Sus Pies delante de la jaula', 870, 1400],
    ['corse', 'Corsé de cuero junto a la jaula', 600, 900],
    ['jaula', 'Tacón rojo sobre la jaula de un esclavo', 600, 899],
    ['cuerdas', 'Cuerdas, cuencos y cadenas en la mazmorra', 852, 1277],
    ['terraza', 'Dóminas en la terraza del Palacio', 933, 1400],
    ['duo-botas', 'La Diosa y su pupila', 1182, 1400]
  ];
  const photo = f => `img/${f}.jpg`;
  const masonry = $('#masonry');
  // Columnas equilibradas: cada foto va a la columna más corta y las columnas
  // se estiran hasta la misma altura, así el mosaico termina sin huecos.
  let galCols = 0;
  function layoutGallery() {
    const n = innerWidth < 620 ? 2 : innerWidth < 980 ? 3 : 4;
    if (n === galCols) return;
    galCols = n;
    const cols = Array.from({ length: n }, () => ({ h: 0, items: [] }));
    GALLERY.forEach(([, , w, h], i) => {
      const c = cols.reduce((a, b) => (b.h < a.h ? b : a));
      c.items.push(i);
      c.h += h / w;
    });
    masonry.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
    masonry.innerHTML = cols.map(c => `<div class="mcol">${c.items.map(i => {
      const [f, alt, w, h] = GALLERY[i];
      return `<button type="button" data-i="${i}" style="aspect-ratio:${w} / ${h}" aria-label="Ampliar: ${alt}"><img src="${photo(f)}" alt="${alt}" width="${w}" height="${h}" loading="lazy"></button>`;
    }).join('')}</div>`).join('');
  }
  layoutGallery();
  addEventListener('resize', layoutGallery);
  const lb = $('#lb'), lbImg = $('img', lb), lbCount = $('.lb-count', lb);
  let lbI = 0, lbLast = null;
  function lbShow(i) {
    lbI = (i + GALLERY.length) % GALLERY.length;
    const [f, alt] = GALLERY[lbI];
    lbImg.src = photo(f);
    lbImg.alt = alt;
    lbCount.textContent = `${lbI + 1} / ${GALLERY.length}`;
  }
  function lbOpen(i) { lbLast = document.activeElement; lbShow(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); $('.lb-x', lb).focus(); }
  function lbClose() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); if (lbLast) lbLast.focus(); }
  masonry.addEventListener('click', e => { const b = e.target.closest('button'); if (b) lbOpen(+b.dataset.i); });
  $('.lb-x', lb).addEventListener('click', lbClose);
  $('.lb-prev', lb).addEventListener('click', () => lbShow(lbI - 1));
  $('.lb-next', lb).addEventListener('click', () => lbShow(lbI + 1));
  lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
  let tx = 0;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) lbShow(lbI + (d < 0 ? 1 : -1)); }, { passive: true });

  /* =========================================================
     IX · Solicitud de audiencia → WhatsApp
     ========================================================= */
  const form = $('#petition'), formErr = $('#form-err');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = form.elements;
    const v = k => f[k].value.trim();
    if (!v('nombre')) { formErr.textContent = 'Dime cómo quieres que te llame.'; f.nombre.focus(); return; }
    if (!f.edad.checked) { formErr.textContent = 'Debes declarar que eres mayor de 18 años.'; f.edad.focus(); return; }
    formErr.textContent = '';
    const lines = ['¿Puedo dirigirme a usted?', '', '— Solicitud de audiencia —', `Me llamo: ${v('nombre')}`, `Solicito: ${v('tipo')}`];
    if (v('deseo')) lines.push(`Lo que deseo: ${v('deseo')}`);
    lines.push(`Mis límites: ${v('limites') || 'los que hablemos antes de empezar'}`);
    if (v('palabra')) lines.push(`Mi palabra de seguridad: ${v('palabra')}`);
    lines.push(`Puedo servirla: ${v('cuando') || 'cuando la Diosa ordene'}`);
    lines.push('', 'Declaro que soy mayor de 18 años y que me entrego por voluntad propia.');
    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });

  /* =========================================================
     Textos legales
     ========================================================= */
  const legal = $('#legal');
  const DOCS = ['aviso-legal', 'privacidad', 'cookies', 'condiciones', 'mayores-de-edad'];
  let legalLast = null;
  function openLegal(doc) {
    if (!DOCS.includes(doc)) doc = 'aviso-legal';
    if (!legal.classList.contains('open')) legalLast = document.activeElement;
    $$('.ltab', legal).forEach(t => t.setAttribute('aria-selected', t.dataset.doc === doc));
    $$('.doc', legal).forEach(d => d.classList.toggle('on', d.id === 'doc-' + doc));
    legal.classList.add('open');
    legal.setAttribute('aria-hidden', 'false');
    $('.body', legal).scrollTop = 0;
    $('.legal-x', legal).focus();
  }
  function closeLegal() {
    legal.classList.remove('open');
    legal.setAttribute('aria-hidden', 'true');
    if (DOCS.includes(location.hash.slice(1))) history.replaceState(null, '', location.pathname + location.search);
    if (legalLast && legalLast.focus) legalLast.focus();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-legal]');
    if (b) { e.preventDefault(); openLegal(b.dataset.legal); }
  });
  $$('.ltab', legal).forEach(t => t.addEventListener('click', () => openLegal(t.dataset.doc)));
  $('.legal-x', legal).addEventListener('click', closeLegal);
  legal.addEventListener('click', e => { if (e.target === legal) closeLegal(); });
  const fromHash = () => { const h = location.hash.slice(1); if (DOCS.includes(h)) openLegal(h); };
  addEventListener('hashchange', fromHash);
  fromHash();

  /* ---------- Teclado ---------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (legal.classList.contains('open')) closeLegal();
      else if (lb.classList.contains('open')) lbClose();
      else if (links.classList.contains('open')) setMenu(false);
    } else if (lb.classList.contains('open')) {
      if (e.key === 'ArrowLeft') lbShow(lbI - 1);
      if (e.key === 'ArrowRight') lbShow(lbI + 1);
    }
  });
})();
