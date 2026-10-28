(function () {
  var hasGsap = typeof window.gsap !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var total = pages.length;
  var idx = 0, busy = false;

  var pager = document.getElementById('pager');
  var navHome = document.getElementById('navHome');
  var pageNum = document.getElementById('pageNum');
  var prog = document.getElementById('prog');
  var btnPrev = document.getElementById('prev');
  var btnNext = document.getElementById('next');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function updateUI() {
    pageNum.textContent = '— ' + pad(idx + 1) + ' —';
    prog.style.width = ((idx + 1) / total * 100) + '%';
    btnPrev.disabled = idx === 0;
    btnNext.disabled = idx === total - 1;
    pager.classList.add('show');
    navHome.classList.add('show');
    var ch = pages[idx].dataset.chapter;
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.dataset.chapter === ch);
    });
  }

  function finishSwap(cur, next) {
    if (cur) {
      cur.classList.remove('is-current', 'is-leaving');
      cur.style.transform = '';
      cur.style.opacity = '';
      cur.style.zIndex = '';
    }
    next.style.transform = '';
    next.style.opacity = '';
    next.style.zIndex = '';
    busy = false;
  }

  function go(n) {
    if (busy || n === idx || n < 0 || n >= total) return;
    busy = true;

    var forward = n > idx;
    var cur = pages[idx];
    var next = pages[n];

    next.style.zIndex = '5';
    cur.style.zIndex = '4';
    next.classList.add('is-current');
    cur.classList.add('is-leaving');

    if (!hasGsap || reduced) {
      finishSwap(cur, next);
      idx = n;
      updateUI();
      return;
    }

    gsap.set(cur, { transformOrigin: forward ? 'left center' : 'right center' });
    gsap.set(next, { transformOrigin: forward ? 'right center' : 'left center' });

    var tl = gsap.timeline({
      onComplete: function () {
        finishSwap(cur, next);
        idx = n;
        updateUI();
      }
    });

    tl.fromTo(next,
      { rotationY: forward ? 62 : -62, x: forward ? 46 : -46, opacity: 0 },
      { rotationY: 0, x: 0, opacity: 1, duration: 0.72, ease: 'power2.out' }, 0);

    tl.to(cur,
      { rotationY: forward ? -78 : 78, x: forward ? -36 : 36, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0);
  }

  btnPrev.addEventListener('click', function () { go(idx - 1); });
  btnNext.addEventListener('click', function () { go(idx + 1); });
  navHome.addEventListener('click', function () { go(1); });
  document.getElementById('btnHome').addEventListener('click', function () { go(1); });

  Array.prototype.forEach.call(document.querySelectorAll('[data-goto]'), function (el) {
    el.addEventListener('click', function () { go(parseInt(el.dataset.goto, 10)); });
  });

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { go(parseInt(t.dataset.go, 10)); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(idx + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(idx - 1); }
    if (e.key === 'Home') { e.preventDefault(); go(1); }
  });

  var sx = 0, sy = 0, tracking = false;
  document.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button') || e.target.closest('.toc-item') || e.target.closest('.lantern-part')) return;
    sx = e.clientX; sy = e.clientY; tracking = true;
  });
  document.addEventListener('pointerup', function (e) {
    if (!tracking) return;
    tracking = false;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? idx + 1 : idx - 1);
    }
  });

  // ====== 花灯散架图 ======
  var INFO = {
    hook:   { n: '01', t: '提梁 · 挂钩', d: '竹篾弯成的提梁，上面一个挂环。元宵夜里就靠它把灯提在手上，走一条街也不烫手。' },
    cap:    { n: '02', t: '灯帽', d: '六角形的顶盖，像一片小瓦檐，压在灯身上面——挡雨，也挡住往上窜的火苗。' },
    frame:  { n: '03', t: '灯骨', d: '整盏灯的骨头。竹篾一根根扎起来，六角是忠信花灯最老的样式，结实到能提着走。' },
    body:   { n: '04', t: '灯身', d: '糊在骨架上的纸或者绸，透光的就是这一层。上面画花鸟、写吉祥话，灯一亮就全透了。' },
    skirt:  { n: '05', t: '灯裙', d: '底下一圈围边，把烛火围在里面，也接住落下来的灯灰，不让它掉到人身上。' },
    tassel: { n: '06', t: '灯穗', d: '垂在灯底下的流苏。提着灯走起来，它会跟着一晃一晃，是整盏灯最活的地方。' }
  };
  var POS = {
    hook:   [0, -100],
    cap:    [-200, -140],
    frame:  [200, -40],
    body:   [-230, 60],
    skirt:  [-180, 190],
    tassel: [200, 200]
  };

  var svg = document.getElementById('lantern');
  var parts = Array.prototype.slice.call(document.querySelectorAll('.lantern-part'));
  var guides = Array.prototype.slice.call(document.querySelectorAll('.guide-line'));
  var badges = document.getElementById('badges');
  var btnExplode = document.getElementById('btnExplode');
  var btnReset = document.getElementById('btnReset');
  var infoNo = document.getElementById('infoNo');
  var infoTitle = document.getElementById('infoTitle');
  var infoText = document.getElementById('infoText');
  var infoHint = document.getElementById('infoHint');

  var exploded = false;
  var locked = null;

  function applyPos(el, x, y, dur, ease) {
    if (hasGsap && !reduced) {
      gsap.to(el, { x: x, y: y, duration: dur, ease: ease, overwrite: 'auto' });
    } else {
      el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }
  }

  function setBadges(on) {
    if (hasGsap && !reduced) {
      gsap.to(badges, { opacity: on ? 1 : 0, duration: 0.4 });
    } else {
      badges.setAttribute('opacity', on ? '1' : '0');
    }
  }

  function explode() {
    if (exploded) return;
    exploded = true;
    parts.forEach(function (g) {
      var p = POS[g.dataset.part];
      applyPos(g, p[0], p[1], 0.85, 'power3.out');
    });
    if (hasGsap && !reduced) {
      gsap.to(guides, { opacity: 0.5, duration: 0.5, delay: 0.25, stagger: 0.04 });
    } else {
      guides.forEach(function (l) { l.style.opacity = '0.5'; });
    }
    setBadges(true);
    btnExplode.textContent = '已拆开';
    btnExplode.disabled = true;
  }

  function assemble() {
    if (!exploded) return;
    parts.forEach(function (g) { applyPos(g, 0, 0, 0.8, 'power3.inOut'); });
    if (hasGsap && !reduced) {
      gsap.to(guides, { opacity: 0, duration: 0.25 });
    } else {
      guides.forEach(function (l) { l.style.opacity = '0'; });
    }
    setBadges(false);
    exploded = false;
    btnExplode.textContent = '拆开看看';
    btnExplode.disabled = false;
    locked = null;
    render(null);
  }

  function render(key) {
    parts.forEach(function (g) {
      var on = g.dataset.part === key;
      g.classList.toggle('is-active', !!key && on);
      g.classList.toggle('is-dim', !!key && !on);
    });

    if (key && INFO[key]) {
      infoNo.textContent = INFO[key].n;
      infoTitle.textContent = INFO[key].t;
      infoText.textContent = INFO[key].d;
      infoHint.textContent = locked ? '再点一下取消' : '鼠标移上去 · 手机上点一下';
    } else {
      infoNo.textContent = '00';
      infoTitle.textContent = '六个零件';
      infoText.textContent = exploded
        ? '把鼠标移到任意一个零件上，这里就告诉你它是什么。'
        : '点一下「拆开看看」，灯会散成六个零件；把鼠标移到哪个零件上，这里就告诉你它是什么、有什么用。';
      infoHint.textContent = '鼠标移上去 · 手机上点一下';
    }
  }

  parts.forEach(function (g) {
    var key = g.dataset.part;

    g.addEventListener('mouseenter', function () {
      if (locked) return;
      render(key);
    });
    g.addEventListener('mouseleave', function () {
      if (locked) return;
      render(null);
    });
    g.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!exploded) explode();
      locked = locked === key ? null : key;
      render(locked);
    });
  });

  btnExplode.addEventListener('click', explode);
  btnReset.addEventListener('click', function () {
    if (hasGsap && !reduced) {
      if (!exploded) {
        gsap.fromTo(svg, { y: -6 }, { y: 0, duration: 0.5, ease: 'elastic.out(1,.5)' });
        return;
      }
    }
    assemble();
  });

  // ====== 01 历史 ======
  var HIST = [
    { y: '1634', t: '置连平州', tag: '明 · 崇祯七年', d: '朝廷在这一带置连平州，属惠州府。州名取「连年平定」的意思——那年头，山里不太平。' },
    { y: '1912', t: '改州为县', tag: '民国元年', d: '废州改县，连平州从此叫连平县。名字一直用到今天，没再改过。' },
    { y: '1988', t: '划归河源', tag: '河源撤县设市', d: '河源撤县设市，连平县划归河源市，成了河源最北边的一个县。' },
    { y: '今天', t: '一座小城', tag: '现在', d: '县城不大，街上能吃到九重皮，正月里能看见忠信花灯。山还是那道山，人换了好几茬。' }
  ];
  var histDots = Array.prototype.slice.call(document.querySelectorAll('.hist-dot'));
  var histArts = Array.prototype.slice.call(document.querySelectorAll('.art-item'));
  var histDetail = document.getElementById('histDetail');
  var histYear = document.getElementById('histYear');
  var histTitle = document.getElementById('histTitle');
  var histText = document.getElementById('histText');
  var histTag = document.getElementById('histTag');

  histDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var i = parseInt(dot.dataset.i, 10);
      var d = HIST[i];
      if (!d) return;
      histDots.forEach(function (n) { n.classList.toggle('is-on', n === dot); });
      histArts.forEach(function (a, k) { a.classList.toggle('is-on', k === i); });
      histYear.textContent = d.y;
      histTitle.textContent = d.t;
      histText.textContent = d.d;
      histTag.textContent = d.tag;
      if (hasGsap && !reduced) {
        gsap.fromTo(histDetail, { opacity: .35, y: 10 }, { opacity: 1, y: 0, duration: .42, ease: 'power2.out' });
      }
    });
  });

  // ====== 02 山水 ======
  var NATURE = [
    { t: '内莞峰林', d: '石灰岩被水磨了几百万年，剩下一丛丛孤峰立在田里。房子和地就挤在峰与峰之间，看着像放大的盆景。' },
    { t: '上坪桃园', d: '三月开花，七月结果。上坪的鹰嘴桃是连平最出名的一样东西，熟的时候枝头都压弯。' },
    { t: '内莞的河与雾', d: '水从峰林之间穿过去，早上常起雾，山就只剩个轮廓。连平一半的味道，是这种湿漉漉的早晨。' }
  ];
  var natureGrid = document.getElementById('natureGrid');
  var natureNote = document.getElementById('natureNote');
  var natureCards = Array.prototype.slice.call(document.querySelectorAll('.nature-card'));
  var natureDefault = natureNote.innerHTML;

  natureCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var wasOn = card.classList.contains('is-on');
      natureCards.forEach(function (c) { c.classList.remove('is-on'); });
      if (wasOn) {
        natureGrid.classList.remove('has-on');
        natureNote.innerHTML = natureDefault;
        return;
      }
      var d = NATURE[parseInt(card.dataset.place, 10)];
      card.classList.add('is-on');
      natureGrid.classList.add('has-on');
      natureNote.innerHTML = '<b>' + d.t + '。</b>' + d.d;
    });
  });

  // ====== 04 九重皮 ======
  var NS = 'http://www.w3.org/2000/svg';
  var layersG = document.getElementById('layersG');
  var panLid = document.getElementById('panLid');
  var steam = document.getElementById('steam');
  var cakeCut = document.getElementById('cakeCut');
  var panGroup = document.getElementById('panGroup');
  var served = document.getElementById('served');
  var servedCake = document.getElementById('servedCake');
  var knife = document.getElementById('knife');
  var ladle = document.getElementById('ladle');
  var pour = document.getElementById('pour');
  var pourSplash = document.getElementById('pourSplash');
  var topSheen = document.getElementById('topSheen');
  var cookBtn = document.getElementById('cookBtn');
  var cookStep = document.getElementById('cookStep');
  var cookCount = document.getElementById('cookCount');

  var anim = hasGsap && !reduced;

  var layerEls = [];
  for (var li = 0; li < 9; li++) {
    var el = document.createElementNS(NS, 'ellipse');
    el.setAttribute('cx', '250');
    el.setAttribute('cy', (197 - li * 3.1).toFixed(1));
    el.setAttribute('rx', (112 - li * .35).toFixed(1));
    el.setAttribute('ry', '36');
    el.setAttribute('fill', li % 2 ? '#f8e9c6' : 'url(#cakeG)');
    el.setAttribute('stroke', '#d4b47c');
    el.setAttribute('stroke-width', '.9');
    el.setAttribute('opacity', '0');
    layersG.appendChild(el);
    layerEls.push(el);
  }

  // 切好码盘的菱形块（带厚度与层次）
  var PIECES = [
    [202, 176, -6], [252, 172, 3], [302, 178, -4],
    [186, 203, 5], [238, 199, -6], [290, 205, 4],
    [208, 231, -4], [260, 231, 6], [308, 227, -5]
  ];
  PIECES.forEach(function (p) {
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', 'rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')');

    [[7, '#c7a266'], [5, '#c9a76b'], [2.5, '#e2c48e']].forEach(function (o) {
      var s = document.createElementNS(NS, 'polygon');
      s.setAttribute('points', p[0] + ',' + (p[1] - 10 + o[0]) + ' ' + (p[0] + 28) + ',' + (p[1] + o[0]) + ' ' + p[0] + ',' + (p[1] + 10 + o[0]) + ' ' + (p[0] - 28) + ',' + (p[1] + o[0]));
      s.setAttribute('fill', o[1]);
      g.appendChild(s);
    });

    var top = document.createElementNS(NS, 'polygon');
    top.setAttribute('points', p[0] + ',' + (p[1] - 10) + ' ' + (p[0] + 28) + ',' + p[1] + ' ' + p[0] + ',' + (p[1] + 10) + ' ' + (p[0] - 28) + ',' + p[1]);
    top.setAttribute('fill', 'url(#pieceG)');
    top.setAttribute('stroke', '#c9a76b');
    top.setAttribute('stroke-width', '1');
    g.appendChild(top);

    var hi = document.createElementNS(NS, 'path');
    hi.setAttribute('d', 'M' + (p[0] - 24) + ' ' + (p[1] - 2) + ' L' + p[0] + ' ' + (p[1] - 7) + ' L' + (p[0] + 16) + ' ' + (p[1] - 6));
    hi.setAttribute('fill', 'none');
    hi.setAttribute('stroke', '#fffaf0');
    hi.setAttribute('stroke-width', '1.4');
    hi.setAttribute('opacity', '.6');
    g.appendChild(hi);

    servedCake.appendChild(g);
  });

  if (anim) {
    gsap.set(layerEls, { svgOrigin: '250 197', scale: .4 });
    gsap.set(panLid, { svgOrigin: '250 200', x: 250, y: -40, rotation: 14, scale: .9 });
    gsap.set(ladle, { svgOrigin: '70 252' });
    gsap.set(knife, { svgOrigin: '330 144' });
    gsap.set(served, { svgOrigin: '250 222' });
  }

  var cook = { round: 0, phase: 'idle', busy: false };

  function cookSay(step, btn, disabled) {
    cookStep.textContent = step;
    cookBtn.textContent = btn;
    cookBtn.disabled = !!disabled;
  }

  function cookReset() {
    cook.round = 0;
    cook.phase = 'idle';
    cook.busy = false;
    if (anim) {
      gsap.killTweensOf(layerEls);
      gsap.killTweensOf([panLid, steam, pour, ladle, knife, served, topSheen, cakeCut, panGroup, pourSplash]);
      gsap.set(layerEls, { opacity: 0, scale: .4 });
      gsap.set(panLid, { x: 250, y: -40, rotation: 14, scale: .9, opacity: 0 });
      gsap.set(steam, { opacity: 0, y: 0 });
      gsap.set(cakeCut, { opacity: 0, scale: 1 });
      gsap.set(panGroup, { opacity: 1 });
      gsap.set(served, { opacity: 0, scale: 1, y: 0 });
      gsap.set(ladle, { x: 0, y: 0, rotation: 0 });
      gsap.set(pour, { opacity: 0 });
      gsap.set(knife, { opacity: 0, y: 0, rotation: 0 });
      gsap.set(topSheen, { opacity: 0 });
      topSheen.setAttribute('cy', '198');
    } else {
      layerEls.forEach(function (e) { e.setAttribute('opacity', '0'); });
      panLid.setAttribute('opacity', '0');
      steam.setAttribute('opacity', '0');
      cakeCut.setAttribute('opacity', '0');
      panGroup.setAttribute('opacity', '1');
      served.setAttribute('opacity', '0');
      pour.setAttribute('opacity', '0');
      knife.setAttribute('opacity', '0');
      topSheen.setAttribute('opacity', '0');
    }
    cookCount.textContent = '已摊 0 / 9 层';
    cookSay('米浆磨好了，舀一勺摊进盘里。', '舀一勺', false);
  }

  function cookLayer() {
    cook.busy = true;
    cook.phase = 'busy';
    var n = cook.round + 1;
    var layer = layerEls[cook.round];
    cookSay('一勺米浆摊开，盖上盖子蒸。', '第 ' + n + ' 层', true);

    if (anim) {
      gsap.timeline()
        .to(ladle, { x: 78, y: -112, rotation: -24, duration: .5, ease: 'power2.inOut' }, 0)
        .to(pour, { opacity: 1, duration: .16 }, .38)
        .to(pourSplash, { opacity: .95, duration: .3 }, .42)
        .to(layer, { opacity: .96, scale: 1, duration: .55, ease: 'power3.out' }, .5)
        .to(pour, { opacity: 0, duration: .14 }, 1.0)
        .to(pourSplash, { opacity: 0, duration: .2 }, 1.0)
        .to(ladle, { x: 0, y: 0, rotation: 0, duration: .48, ease: 'power2.inOut' }, 1.0)
        .to(panLid, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: .5, ease: 'power2.out' }, 1.18)
        .to(steam, { opacity: .9, y: -6, duration: .5 }, 1.55)
        .to(steam, { opacity: 0, y: 0, duration: .4 }, 2.45)
        .to(panLid, { x: 250, y: -40, rotation: 14, scale: .9, opacity: 0, duration: .5, ease: 'power2.in' }, 2.55)
        .to(layer, { opacity: 1, duration: .3 }, 2.55)
        .to(topSheen, { opacity: .22, duration: .4 }, 2.6)
        .add(function () { cookDoneLayer(n); }, 3.0);
    } else {
      layer.setAttribute('opacity', '1');
      setTimeout(function () { cookDoneLayer(n); }, 600);
    }
  }

  function cookDoneLayer(n) {
    cook.round = n;
    cook.busy = false;
    cookCount.textContent = '已摊 ' + n + ' / 9 层';
    topSheen.setAttribute('cy', (197 - (n - 1) * 3.1).toFixed(1));
    if (n >= 9) {
      cook.phase = 'ready';
      cookSay('九层齐了，厚厚一叠，趁热下刀。', '切块', false);
    } else {
      cook.phase = 'idle';
      cookSay('第 ' + n + ' 层凝住了，再摊一层。', '再舀一勺', false);
    }
  }

  function cookCut() {
    cook.phase = 'cutting';
    cook.busy = true;
    cookSay('切成菱形，一块一块好夹。', '切…', true);
    if (anim) {
      gsap.timeline()
        .fromTo(knife, { opacity: 0, y: -70, rotation: -12 }, { opacity: 1, y: 0, rotation: 0, duration: .55, ease: 'power2.in' }, 0)
        .fromTo(cakeCut, { opacity: 0 }, { opacity: 1, duration: .45 }, .6)
        .to(knife, { opacity: 0, y: -60, rotation: -8, duration: .4, ease: 'power2.out' }, 1.15)
        .add(cutDone, 1.55);
    } else {
      cakeCut.setAttribute('opacity', '1');
      setTimeout(cutDone, 400);
    }
  }

  function cutDone() {
    cook.busy = false;
    cook.phase = 'cut';
    cookSay('切好了，一块块码进白瓷盘。', '装盘', false);
  }

  function cookServe() {
    cook.phase = 'served';
    cook.busy = true;
    cookSay('端上桌，蘸点酱油趁热吃。', '装盘中', true);
    if (anim) {
      gsap.to(panGroup, { opacity: 0, duration: .5 });
      gsap.fromTo(served, { opacity: 0, y: 16, scale: .92 }, { opacity: 1, y: 0, scale: 1, duration: .75, delay: .2, ease: 'back.out(1.4)' });
    } else {
      panGroup.setAttribute('opacity', '0');
      served.setAttribute('opacity', '1');
    }
    setTimeout(function () {
      cook.busy = false;
      cookSay('一层面一层蒸，前后九重——这就是九重皮。', '再做一锅', false);
    }, 1100);
  }

  function cookNext() {
    if (cook.busy) return;
    if (cook.phase === 'idle') cookLayer();
    else if (cook.phase === 'ready') cookCut();
    else if (cook.phase === 'cut') cookServe();
    else if (cook.phase === 'served') cookReset();
  }

  cookBtn.addEventListener('click', cookNext);

  // ====== 初始化 ======
  pages[0].classList.add('is-current');
  updateUI();
})();
