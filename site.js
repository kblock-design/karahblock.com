/* Karah Block: toolbox, pegboard, scroll motion. */
document.documentElement.classList.add('js');
(function () {
  var T = [{"name":"Product management","what":"Roadmaps, requirements, and sprints. Getting a team to ship the right product on a schedule.","used":"Shipshape: Senior PM on a smart-home app. Led a nine-person team across four time zones and doubled release frequency.","w":85,"h":358},{"name":"AI workflows","what":"AI at the center of how I work, building systems that actually help. No slop.","used":"ecobrew: built an AI workflow that cut trial analysis from 2+ hours to about 6 minutes. Peak: AI turns the design system into clickable prototypes in minutes.","w":112,"h":291},{"name":"Design and clarity","what":"Intuitive experiences and clear information hierarchy. Cleaning up complex screens.","used":"Peak: public-safety SaaS with 1.4M+ users. Led UX for 25+ features and built a 37-component design system.","w":99,"h":368},{"name":"Problem solving","what":"When I don't know how to do something, I figure it out.","used":"ecobrew: automated three-hour trials that needed two operators. Trials went from one a week to two or three a day.","w":36,"h":192},{"name":"Business and operations","what":"An MBA, plus running a startup's day to day.","used":"ecobrew: on a 2-person team, I've had a hand in every part of the business, from sourcing to accounting.","w":99,"h":168},{"name":"Founder and brand builder","what":"Starting a company from zero. Finding the problem, making the product, and getting it to customers.","used":"Metre: founder and CEO. Designed, sourced, made, and sold two collections.","w":101,"h":96},{"name":"Engineering and fabrication","what":"A BS in mechanical engineering, and I build the physical product myself.","used":"ecobrew: delivered a working CO₂-recovery prototype in five months.","w":102,"h":384}];
  var tools = [].slice.call(document.querySelectorAll('.tool')), holes = [].slice.call(document.querySelectorAll('.hollow')), names = [].slice.call(document.querySelectorAll('.names button'));
  var slot = document.getElementById('slot'), detail = document.getElementById('detail'), cur = null;
  function place() {
    tools.forEach(function (b, i) {
      if (i !== cur) { b.style.transform = ''; return; }
      b.style.transform = 'none';
      var r = b.getBoundingClientRect(), s = slot.getBoundingClientRect();
      var scale = Math.min(s.height / r.height, s.width / r.width, 1.5);
      var dx = s.left + s.width / 2 - (r.left + r.width / 2), dy = s.top + s.height / 2 - (r.top + r.height / 2);
      b.getBoundingClientRect();
      b.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ') rotate(' + (i % 2 ? 6 : -6) + 'deg)';
    });
  }
  function esc(t) { return t.replace(/&/g, '&amp;'); }
  function pick(i) {
    cur = cur === i ? null : i;
    tools.forEach(function (b, j) { b.setAttribute('aria-pressed', j === cur ? 'true' : 'false'); });
    names.forEach(function (b, j) { b.setAttribute('aria-pressed', j === cur ? 'true' : 'false'); });
    holes.forEach(function (h, j) { h.classList.toggle('on', j === cur); });
    if (cur === null) { detail.innerHTML = '<p class="empty"></p>'; }
    else { var t = T[cur]; detail.innerHTML = '<h3>' + esc(t.name) + '</h3><p>' + esc(t.what) + '</p><p class="usedon">' + esc(t.used) + '</p>'; }
    var noMove = matchMedia('(prefers-reduced-motion: reduce)').matches;
    tools.forEach(function (b) { b.style.transition = noMove ? 'none' : ''; });
    place();
    /* Only scroll if the box and the details are not both on screen already. */
    if (cur !== null) {
      var st = document.getElementById('stage').getBoundingClientRect(), ds = document.querySelector('.tshow').getBoundingClientRect();
      if (st.top < 60 || ds.bottom > innerHeight) {
        var y = scrollY + Math.min(st.top, ds.top) - 70, roomy = Math.max(st.bottom, ds.bottom) - Math.min(st.top, ds.top) + 70 <= innerHeight;
        scrollTo({ top: roomy ? y : scrollY + ds.bottom - innerHeight + 12, behavior: noMove ? 'auto' : 'smooth' });
      }
    }
  }
  tools.forEach(function (b, i) { b.addEventListener('click', function () { pick(i); }); });
  names.forEach(function (b, i) { b.addEventListener('click', function () { pick(i); }); });
  addEventListener('resize', place);
  var mq = document.querySelector('.mq');
  if (mq && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var moveMq = function () { var p = Math.max(0, innerHeight - mq.parentNode.getBoundingClientRect().top - innerHeight * .75); mq.style.transform = 'translateX(' + (-p * .28) + 'px)'; };
    addEventListener('scroll', moveMq, { passive: true }); moveMq();
  }
})();

/* Pegboard: summaries show on hover and keyboard focus. A tap toggles them on touch screens. */
(function () {
  var pegs = document.querySelectorAll('.peg');
  Array.prototype.forEach.call(pegs, function (peg) {
    peg.addEventListener('click', function () {
      var on = peg.classList.contains('show');
      Array.prototype.forEach.call(pegs, function (p) { p.classList.remove('show'); });
      if (!on) peg.classList.add('show');
    });
  });
})();

/* Scroll motion. Nothing here runs for people who ask for reduced motion, and the hidden
   starting states are added only by this script, so the page stays readable without it. */
(function () {
  /* Pages with body.still (the resume) stay put. */
  if (document.body.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  function all(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }

  /* Run fn once when an element scrolls into view. Anything left waiting shows at the bottom of the page. */
  var waiting = [], observers = {};
  function show(el) {
    if (el._seen) return;
    el._seen = true;
    el.classList.add('in');
    if (el._on) el._on();
    /* Hand the element back to its normal styles once it has finished moving. */
    if (el.classList.contains('rv') || el.classList.contains('wp')) setTimeout(function () { el.classList.remove('rv', 'wp'); }, 2600);
  }
  function watch(el, fn, margin) {
    margin = margin || '-10%';
    el._on = fn;
    var o = observers[margin] || (observers[margin] = new IntersectionObserver(function (es, ob) {
      es.forEach(function (x) { if (x.isIntersecting) { ob.unobserve(x.target); show(x.target); } });
    }, { rootMargin: '0px 0px ' + margin + ' 0px' }));
    o.observe(el); waiting.push(el);
  }
  function rise(sel, d) { all(sel).forEach(function (el, i) { el.classList.add('rv'); if (d) el.style.setProperty('--d', (typeof d === 'function' ? d(el, i) : d) + 's'); watch(el); }); }

  /* The pen draws itself. Dash lengths are in screen pixels because the strokes do not scale. */
  function penLength(p) {
    var m = p.getScreenCTM(), L = p.getTotalLength(), d = 0, a = null;
    for (var i = 0; i <= 48; i++) {
      var q = p.getPointAtLength(L * i / 48), x = m.a * q.x + m.c * q.y, y = m.b * q.x + m.d * q.y;
      if (a) d += Math.sqrt((x - a[0]) * (x - a[0]) + (y - a[1]) * (y - a[1]));
      a = [x, y];
    }
    return d + 6;
  }
  function draw(p, delay, dur) {
    p.style.visibility = '';
    if (!p.animate) return;
    var L = penLength(p);
    p.style.strokeDasharray = L + ' ' + L;
    p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: dur, delay: delay, easing: 'cubic-bezier(.4,.1,.3,1)', fill: 'backwards' })
      .onfinish = function () { p.style.strokeDasharray = ''; };
  }

  /* Wrap each word so it can rise from behind a line. Pen marks are left alone. */
  function split(node, start, step) {
    var n = 0;
    [].slice.call(node.childNodes).forEach(function (c) {
      if (c.nodeType === 1) { if (c.tagName.toLowerCase() !== 'svg') n += split(c, start + n * step, step); return; }
      if (c.nodeType !== 3 || !c.nodeValue.trim()) return;
      var f = document.createDocumentFragment();
      c.nodeValue.split(/(\s+)/).forEach(function (t) {
        if (!t) return;
        if (!t.trim()) { f.appendChild(document.createTextNode(t)); return; }
        var w = document.createElement('span'), i = document.createElement('span');
        w.className = 'w'; i.className = 'wi'; i.textContent = t;
        i.style.transitionDelay = (start + n * step) + 's';
        w.appendChild(i); f.appendChild(w); n++;
      });
      node.replaceChild(f, c);
    });
    return n;
  }

  /* Kept on purpose (Nov 2026, she asked to scale motion back): the hero headline, How I work, the toolbox hop, and the stat tiles. */

  /* Hero headline: words rise, then the pen circles the last words. */
  all('.hero h1').forEach(function (h) {
    var pens = all('.pen', h);
    pens.forEach(function (p) { p.style.visibility = 'hidden'; });
    h.classList.add('hw');
    var n = split(h, 0, .055);
    watch(h, function () {
      pens.forEach(function (p) { draw(p, 350 + n * 55, 1300); });
      setTimeout(function () { h.classList.add('hd'); }, 1100 + n * 55);
    });
  });
  rise('.hero-sub', .4); rise('.hero-links', .55);

  /* Other pen marks simply draw when they come into view. */
  all('.mark .pen').forEach(function (p) {
    if (p.closest('.hero')) return;
    p.style.visibility = 'hidden';
    watch(p.closest('h1, h2') || p.parentNode, function () { draw(p, 200, p.closest('.under') ? 700 : 1300); });
  });

  /* Stat tiles: the number counts up, and the old pace gets struck out. */
  function countUp(el) {
    var end = +el.getAttribute('data-count'), t0 = null;
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    el.textContent = '0';
    requestAnimationFrame(function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min((t - t0) / 1000, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    });
  }
  all('.pic.type').forEach(function (el) {
    var pens = all('.pen', el), nums = all('[data-count]', el), then = el.querySelector('.then');
    if (!pens.length && !nums.length) return;
    pens.forEach(function (p) { p.style.visibility = 'hidden'; });
    if (then) { then.classList.add('rv'); then.style.setProperty('--d', '.9s'); }
    watch(el, function () {
      nums.forEach(countUp);
      pens.forEach(function (p) { draw(p, 300, 600); });
      if (then) then.classList.add('in');
    });
  });

  /* How I work: the wrong idea appears, the pen strikes it, the right idea follows. */
  all('.say > div').forEach(function (row) {
    var h = row.querySelector('h3'), pen = row.querySelector('.pen'), last = h.lastChild;
    if (!pen || !last || last.nodeType !== 3) return;
    var tail = document.createElement('span');
    tail.className = 'hw'; h.replaceChild(tail, last); tail.appendChild(last);
    split(tail, 1.05, .07);
    pen.style.visibility = 'hidden';
    row.classList.add('sq');
    watch(row, function () { draw(pen, 450, 650); tail.classList.add('in'); }, '-22%');
  });

  /* Toolbox: the tools hop once, unless someone already pulled one out. */
  var stage = document.getElementById('stage');
  if (stage) {
    var hopper = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      hopper.disconnect();
      if (stage.querySelector('[aria-pressed="true"]')) return;
      all('.tool', stage).forEach(function (b, i) {
        var img = b.querySelector('img'), slot = b.previousElementSibling;
        img.style.animationDelay = (i * .085) + 's';
        img.classList.add('hop');
        setTimeout(function () { slot.classList.add('on'); }, i * 85);
        img.addEventListener('animationend', function () {
          img.classList.remove('hop'); img.style.animationDelay = '';
          if (b.getAttribute('aria-pressed') !== 'true') slot.classList.remove('on');
        }, { once: true });
      });
    }, { threshold: .55 });
    hopper.observe(stage);
  }

  /* Anything still waiting shows once the reader reaches the bottom, or prints the page. */
  function atBottom() { if (document.documentElement.scrollHeight - innerHeight - scrollY < 4) waiting.forEach(show); }
  addEventListener('scroll', atBottom, { passive: true });
  addEventListener('beforeprint', function () { waiting.forEach(show); });
})();
