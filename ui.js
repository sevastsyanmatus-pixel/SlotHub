/* ============================================
   SlotX — UI Rendering (ARTHOLST pattern)
   All renders wrapped in try/catch for stability
   ============================================ */

/* Skeleton (immediate — before DOMContentLoaded) */
(function() {
  var rows = ['popular-row', 'top-row', 'new-row', 'bonusbuy-row'];
  for (var r = 0; r < rows.length; r++) {
    var el = document.getElementById(rows[r]);
    if (el && el.children.length === 0) {
      var h = '';
      for (var i = 0; i < 4; i++) h += '<div class="skeleton-card flex-shrink-0" style="width:200px;height:160px;border-radius:16px;"></div>';
      el.innerHTML = h;
    }
  }
})();

document.addEventListener('DOMContentLoaded', function() {

  var GRADIENTS = [
    'linear-gradient(135deg,#2E1065,#6D28D9,#7C3AED)', 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)',
    'linear-gradient(135deg,#120833,#3730A3,#C084FC)', 'linear-gradient(135deg,#08051A,#2E1065,#8B5CF6)',
    'linear-gradient(135deg,#2E1065,#4338CA,#A78BFA)', 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)',
    'linear-gradient(135deg,#1E0A4B,#6D28D9,#A78BFA)', 'linear-gradient(135deg,#08051A,#4338CA,#C084FC)'
  ];

  /* Banner state */
  var bannerIdx = 0;
  var bannerAutoTimer = null;

  /* Notification state */
  var notifQueue = [];

  /* Keyboard state */
  var _keyboardVisible = false;
  var _stableViewportH = window.innerHeight;

  function waitReady(cb) {
    if (window.App && window.DataStore && DataStore._ready) return cb();
    setTimeout(function() { waitReady(cb); }, 80);
  }

  waitReady(function() {
    window.UI = {
      initAll: initAll, refreshAll: refreshAll,
      renderHome: renderHome, renderGamesGrid: renderGamesGrid,
      renderCasinos: renderCasinos, renderProfile: renderProfile,
      renderCurrencyList: renderCurrencyList, renderFavorites: renderFavorites,
      renderRecent: renderRecent, setFilter: setFilter,
      updateBannerPosition: updateBannerPosition,
      updateSectionCounts: updateSectionCounts,
      trackGamePlayed: trackGamePlayed, buildRowCard: buildRowCard
    };
  });

  function $(id) { return document.getElementById(id); }
  function esc(s) { return App.escHtml(s); }

  /* ============================================
     SAFE RENDER WRAPPER (ARTHOLST pattern)
     One broken section won't crash the whole app
     ============================================ */
  function safeRender(name, fn) {
    try { fn(); }
    catch(e) { console.error('[SlotX UI] ' + name + ' error:', e); }
  }

  /* ============================================
     INIT
     ============================================ */
  function initAll() {
    var renderFns = [
      ['buildChips', buildChips],
      ['renderHome', renderHome],
      ['renderGamesGrid', renderGamesGrid],
      ['buildWinFeed', buildWinFeed],
      ['initTimer', initTimer],
      ['initOnlineCounter', initOnlineCounter],
      /* scroll animations disabled */
      ['initBannerSwipe', initBannerSwipe],
      ['initKeyboardHandling', initKeyboardHandling]
    ];
    for (var i = 0; i < renderFns.length; i++) {
      safeRender(renderFns[i][0], renderFns[i][1]);
    }
    setTimeout(function() { safeRender('initNotifications', initNotifications); }, 10000);

    /* Time tracking */
    setInterval(function() { var t = App.getLocal('timeInApp', 0); App.setLocal('timeInApp', t + 60000); }, 60000);
  }

  function refreshAll() {
    var fns = [
      ['renderHome', renderHome],
      ['buildChips', buildChips],
      ['renderGamesGrid', renderGamesGrid],
      ['buildWinFeed', buildWinFeed],
      ['updateSectionCounts', updateSectionCounts]
    ];
    for (var i = 0; i < fns.length; i++) safeRender(fns[i][0], fns[i][1]);
    if (App.getActiveTab() === 'casinos') safeRender('renderCasinos', renderCasinos);
    if (App.getActiveTab() === 'profile') safeRender('renderProfile', renderProfile);
  }

  /* ============================================
     KEYBOARD HANDLING (ARTHOLST pattern)
     Works in Telegram + Browser + all platforms
     ============================================ */
  function initKeyboardHandling() {
    var _tg = null;
    try { _tg = window.Telegram && Telegram.WebApp; } catch(e) {}

    /* Remember stable height */
    _stableViewportH = window.innerHeight;

    /* Method 1: Telegram viewportChanged (most reliable in TG) */
    if (_tg) {
      try {
        _tg.onEvent('viewportChanged', function(e) {
          var currentH = _tg.viewportHeight || window.innerHeight;
          var diff = _stableViewportH - currentH;
          if (diff > 60) {
            _onKeyboardShow(diff);
          } else if (diff < 30) {
            _onKeyboardHide();
          }
          if (e && e.isStateStable) {
            _stableViewportH = currentH;
          }
        });
      } catch(e) {}
    }

    /* Method 2: visualViewport API (modern browsers, iOS Safari) */
    if (window.visualViewport) {
      var lastVVH = window.visualViewport.height;
      window.visualViewport.addEventListener('resize', function() {
        var diff = lastVVH - window.visualViewport.height;
        if (diff > 100) {
          _onKeyboardShow(diff);
        } else if (diff < -50) {
          _onKeyboardHide();
        }
        lastVVH = window.visualViewport.height;
      });
    }

    /* Method 3: window.resize (old Android fallback) */
    window.addEventListener('resize', function() {
      var diff = _stableViewportH - window.innerHeight;
      if (diff > 100) {
        _onKeyboardShow(diff);
      } else if (diff < 30 && _keyboardVisible) {
        _onKeyboardHide();
      }
    });

    /* Focus/blur on inputs — ensure scroll into view */
    document.addEventListener('focusin', function(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        setTimeout(function() {
          try { e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(er) {}
        }, 300);
      }
    });
  }

  function _onKeyboardShow(keyboardHeight) {
    if (_keyboardVisible) return;
    _keyboardVisible = true;
    document.body.classList.add('keyboard-open');
    /* Hide bottom nav to give more space */
    var nav = $('bottom-nav-wrap');
    if (nav) nav.style.display = 'none';
  }

  function _onKeyboardHide() {
    if (!_keyboardVisible) return;
    _keyboardVisible = false;
    document.body.classList.remove('keyboard-open');
    /* Restore bottom nav */
    var nav = $('bottom-nav-wrap');
    if (nav) nav.style.display = '';
  }

  /* ============================================
     GAME IMAGE
     ============================================ */
  function buildGameImage(game, el) {
    var url = DataStore.getGameImageUrl(game);
    if (url) {
      var img = document.createElement('img');
      img.className = 'card-image'; img.src = url; img.loading = 'lazy';
      img.setAttribute('referrerpolicy', 'no-referrer');
      img.onerror = function() { this.style.display = 'none'; addEmoji(el, game); };
      el.appendChild(img);
    } else { addEmoji(el, game); }
  }

  function addEmoji(el, game) {
    if (el.querySelector('.card-emoji')) return;
    var e = document.createElement('div');
    e.className = 'card-emoji'; e.textContent = game.icon || '🎰';
    el.appendChild(e);
  }

  /* ============================================
     FAVORITE HEART
     ============================================ */
  function buildHeart(game, el) {
    var isFav = DataStore.isFavorite(game.id);
    var heart = document.createElement('div');
    heart.className = 'card-heart' + (isFav ? ' active' : '');
    heart.innerHTML = '<i class="fa-' + (isFav ? 'solid' : 'regular') + ' fa-heart"></i>';

    heart.addEventListener('click', function(e) {
      e.stopPropagation();
      TG.haptic.light(); App.playSound('favorite');
      var nowFav = DataStore.toggleFavorite(game.id);
      heart.classList.toggle('active', nowFav);
      heart.innerHTML = '<i class="fa-' + (nowFav ? 'solid' : 'regular') + ' fa-heart"></i>';
      heart.classList.add('pop');
      setTimeout(function() { heart.classList.remove('pop'); }, 400);
      if (nowFav) {
        if (window.Features) Features.addFavoriteXP();
        App.showToast('❤️', esc(game.name) + ' добавлено в избранное');
        var r = heart.getBoundingClientRect();
        App.fireConfetti(r.left + r.width / 2, r.top + r.height / 2);
        App.playSound('confetti');
      }
      safeRender('renderFavorites', renderFavorites);
      safeRender('updateSectionCounts', updateSectionCounts);
    });
    el.appendChild(heart);
  }

  /* ============================================
     CARD BUILDERS
     ============================================ */
  function buildRowCard(game, w, h, delay) {
    var el = document.createElement('div');
    el.className = 'game-card row-card-animated flex-shrink-0';
    el.style.width = w + 'px';
    /* animation delay disabled */

    var banner = document.createElement('div'); banner.className = 'card-banner';
    var bg = document.createElement('div'); bg.className = 'card-banner-bg';
    bg.style.background = 'transparent';
    banner.appendChild(bg);
    buildGameImage(game, banner);
    var overlay = document.createElement('div'); overlay.className = 'card-play-overlay';
    overlay.innerHTML = '<div class="card-play-btn"><i class="fa-solid fa-play"></i></div>';
    banner.appendChild(overlay);
    el.appendChild(banner);

    var content = document.createElement('div'); content.className = 'card-content';
    var topRow = document.createElement('div'); topRow.className = 'card-top-row';
    var titles = document.createElement('div'); titles.className = 'card-titles';
    titles.innerHTML = '<div class="card-name">' + esc(game.name) + '</div><div class="card-provider">' + esc(game.provider || '') + '</div>';
    topRow.appendChild(titles);
    buildHeart(game, topRow);
    content.appendChild(topRow);

    var bottomRow = document.createElement('div'); bottomRow.className = 'card-bottom-row';
    var online = getGameOnline(game.id);
    bottomRow.innerHTML = '<div class="card-badges"></div><span class="card-online"><span class="online-dot"></span>' + online + '</span>';
    content.appendChild(bottomRow);

    el.appendChild(content);
    el.addEventListener('click', function() { TG.haptic.heavy(); App.playSound('click'); App.openGame(game); });
    return el;
  }

  function buildGridCard(game, delay) {
    var el = document.createElement('div');
    el.className = 'game-card grid-card-animated';
    /* animation delay disabled */

    var banner = document.createElement('div'); banner.className = 'card-banner';
    var bg = document.createElement('div'); bg.className = 'card-banner-bg';
    bg.style.background = 'transparent';
    banner.appendChild(bg);
    buildGameImage(game, banner);
    var overlay = document.createElement('div'); overlay.className = 'card-play-overlay';
    overlay.innerHTML = '<div class="card-play-btn"><i class="fa-solid fa-play"></i></div>';
    banner.appendChild(overlay);
    el.appendChild(banner);

    var content = document.createElement('div'); content.className = 'card-content';
    var topRow = document.createElement('div'); topRow.className = 'card-top-row';
    var titles = document.createElement('div'); titles.className = 'card-titles';
    titles.innerHTML = '<div class="card-name">' + esc(game.name) + '</div><div class="card-provider">' + esc(game.provider || '') + '</div>';
    topRow.appendChild(titles);
    buildHeart(game, topRow);
    content.appendChild(topRow);

    var bottomRow = document.createElement('div'); bottomRow.className = 'card-bottom-row';
    var vol = getVolatilityLabel(game.volatility);
    var online = getGameOnline(game.id);
    bottomRow.innerHTML = '<div class="card-badges"><span class="card-volatility ' + vol.cls + '">⚡' + vol.text + '</span></div><span class="card-online"><span class="online-dot"></span>' + online + '</span>';
    content.appendChild(bottomRow);

    el.appendChild(content);
    el.addEventListener('click', function() { TG.haptic.heavy(); App.playSound('click'); App.openGame(game); });
    return el;
  }

  function buildRecentCard(game, delay) {
    var el = document.createElement('div');
    el.className = 'recent-card row-card-animated';
    /* animation delay disabled */

    var banner = document.createElement('div');
    banner.className = 'recent-banner';

    var url = DataStore.getGameImageUrl(game);
    if (url) {
      var img = document.createElement('img');
      img.className = 'recent-img';
      img.src = url; img.loading = 'lazy'; img.setAttribute('referrerpolicy', 'no-referrer');
      img.onerror = function() { 
        this.style.display = 'none'; 
        if (game.icon && !banner.querySelector('.recent-emoji')) {
          var e = document.createElement('div');
          e.className = 'recent-emoji';
          e.textContent = game.icon;
          banner.appendChild(e);
        }
      };
      banner.appendChild(img);
    } else if (game.icon) {
      var emoji = document.createElement('div');
      emoji.className = 'recent-emoji';
      emoji.textContent = game.icon;
      banner.appendChild(emoji);
    }
    el.appendChild(banner);

    var content = document.createElement('div');
    content.className = 'recent-content';
    var nm = document.createElement('div');
    nm.className = 'recent-name';
    nm.textContent = game.name;
    content.appendChild(nm);
    el.appendChild(content);

    el.addEventListener('click', function() { TG.haptic.heavy(); App.playSound('click'); App.openGame(game); });
    return el;
  }

  /* ============================================
     SECTION COUNTS
     ============================================ */
  function updateSectionCounts() {
    var games = DataStore.getActiveGames();
    setCount('popular-count', games.filter(function(g) { return g.tag === 'popular'; }).length);
    setCount('top-count', games.filter(function(g) { return g.tag === 'top'; }).length);
    setCount('new-count', games.filter(function(g) { return g.tag === 'new'; }).length);
    setCount('fav-count', DataStore.getFavoriteGames().length);
    setCount('bonusbuy-count', DataStore.getBonusBuyGames().length);
  }

  function setCount(id, n) { var el = $(id); if (el) el.textContent = n; }

  /* ============================================
     BANNER CAROUSEL
     ============================================ */
  function renderBanners() {
    var track = $('banner-track'), dots = $('banner-dots'), carousel = $('banner-carousel');
    track.innerHTML = ''; dots.innerHTML = '';
    var casinos = DataStore.getActiveCasinos();

    if (casinos.length === 0) { carousel.style.display = 'none'; dots.style.display = 'none'; return; }
    carousel.style.display = ''; dots.style.display = '';

    var decoEmojis = ['🎰','💎','🎁','⚡','🏆','🔥','💰','🃏','🎲'];

    for (var i = 0; i < casinos.length; i++) {
      var c = casinos[i];
      var slide = document.createElement('a');
      slide.href = c.url || '#'; slide.target = '_blank'; slide.rel = 'noopener noreferrer';
      slide.className = 'banner-slide'; slide.style.background = c.color || 'linear-gradient(135deg,#2E1065,#4338CA,#7C3AED)';

      var html = '';
      if (c.bannerImage) html += '<img src="' + esc(c.bannerImage) + '" class="banner-slide-img" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'">';
      html += '<div class="banner-deco">' + decoEmojis[i % decoEmojis.length] + '</div>';
      html += '<div class="banner-slide-content">';
      if (c.badge) html += '<span class="banner-badge">' + esc(c.badge) + '</span>';
      html += '<p class="banner-title">' + esc(c.bannerTitle || c.bonus || c.name) + '</p>';
      html += '<p class="banner-subtitle">' + esc(c.bannerSubtitle || c.name) + '</p>';
      html += '<div class="banner-cta">Забрать <i class="fa-solid fa-arrow-right" style="font-size:10px;"></i></div>';
      html += '</div>';
      slide.innerHTML = html;
      slide.addEventListener('click', function() { TG.haptic.medium(); });
      track.appendChild(slide);

      var dot = document.createElement('div');
      dot.className = 'banner-dot' + (i === 0 ? ' active' : '');
      (function(idx) { dot.addEventListener('click', function(e) { e.stopPropagation(); goToBanner(idx); }); })(i);
      dots.appendChild(dot);
    }

    bannerIdx = 0;
    updateBannerPosition();
    startBannerAuto();

    /* Force reflow for TG WebView animation fix (ARTHOLST pattern) */
    track.style.animation = 'none';
    void track.offsetHeight;
    track.style.animation = '';
  }

  function goToBanner(idx) {
    var n = DataStore.getActiveCasinos().length;
    if (n === 0) return;
    bannerIdx = ((idx % n) + n) % n;
    updateBannerPosition();
    startBannerAuto();
  }

  function updateBannerPosition() {
    var track = $('banner-track');
    if (!track) return;
    var slides = track.querySelectorAll('.banner-slide');
    if (slides.length > 0) {
      var w = slides[0].offsetWidth;
      track.style.transform = 'translateX(-' + (bannerIdx * w) + 'px)';
    }
    var dots = $('banner-dots');
    if (dots) {
      var dd = dots.querySelectorAll('.banner-dot');
      for (var i = 0; i < dd.length; i++) dd[i].classList.toggle('active', i === bannerIdx);
    }
  }

  function startBannerAuto() {
    if (bannerAutoTimer) clearInterval(bannerAutoTimer);
    bannerAutoTimer = setInterval(function() {
      var n = DataStore.getActiveCasinos().length;
      if (n > 1) { bannerIdx = (bannerIdx + 1) % n; updateBannerPosition(); }
    }, 5000);
  }

  function initBannerSwipe() {
    var carousel = $('banner-carousel');
    if (!carousel) return;
    var startX = 0, dragging = false;
    carousel.addEventListener('touchstart', function(e) { startX = e.touches[0].clientY !== undefined ? e.touches[0].clientX : 0; dragging = true; }, { passive: true });
    carousel.addEventListener('touchend', function(e) {
      if (!dragging) return; dragging = false;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { dx < 0 ? goToBanner(bannerIdx + 1) : goToBanner(bannerIdx - 1); }
    }, { passive: true });
  }

  /* ============================================
     RENDER HOME
     ============================================ */
  function renderHome() {
    var games = DataStore.getActiveGames();
    safeRender('renderBanners', renderBanners);
    safeRender('renderFavorites', renderFavorites);
    safeRender('updateSectionCounts', updateSectionCounts);

    safeRender('popular-row', function() {
      renderRow('popular-row', games.filter(function(g) { return g.tag === 'popular'; }).slice(0, 8));
    });
    safeRender('top-row', function() {
      renderRow('top-row', games.filter(function(g) { return g.tag === 'top'; }).slice(0, 8));
    });
    safeRender('new-row', function() {
      var newGames = games.filter(function(g) { return g.tag === 'new'; });
      newGames.sort(function(a, b) { return b.order - a.order; });
      renderRow('new-row', newGames.slice(0, 8));
    });
    safeRender('renderBonusBuy', renderBonusBuy);
    safeRender('renderHomeCasinos', renderHomeCasinos);
    safeRender('renderRecent', renderRecent);
    safeRender('renderLeaderboard', function() { renderLeaderboard('day'); });
  }

  function renderRow(id, games) {
    var el = $(id); if (!el) return; el.innerHTML = '';
    for (var i = 0; i < games.length; i++) el.appendChild(buildRowCard(games[i], 200, 112, i * 60));
  }

  function renderFavorites() {
    var favs = DataStore.getFavoriteGames();
    var sec = $('favorites-section');
    if (favs.length === 0) { sec.style.display = 'none'; return; }
    sec.style.display = '';
    var row = $('favorites-row'); row.innerHTML = '';
    for (var i = 0; i < favs.length; i++) row.appendChild(buildRowCard(favs[i], 180, 100, i * 60));
  }

  function renderBonusBuy() {
    var games = DataStore.getBonusBuyGames();
    var sec = $('bonusbuy-section');
    if (games.length === 0) { if (sec) sec.style.display = 'none'; return; }
    if (sec) sec.style.display = '';
    var row = $('bonusbuy-row'); if (!row) return; row.innerHTML = '';
    for (var i = 0; i < games.length; i++) row.appendChild(buildRowCard(games[i], 200, 112, i * 60));
    var link = $('link-bonusbuy');
    if (link) link.onclick = function() { App.switchTab('games'); };
  }

  function renderHomeCasinos() {
    var row = $('home-casino-row'); row.innerHTML = '';
    var casinos = DataStore.getActiveCasinos().slice(0, 4);
    for (var i = 0; i < casinos.length; i++) {
      var c = casinos[i];
      var el = document.createElement('a');
      el.href = c.url || '#'; el.target = '_blank'; el.rel = 'noopener noreferrer';
      el.className = 'flex-shrink-0 interactive rounded-2xl p-4 relative overflow-hidden row-card-animated';
      el.style.cssText = 'width:220px;min-height:120px;background:' + (c.color || 'var(--glass-bg)') + ';border:1px solid rgba(109,40,217,0.15);animation-delay:' + (i * 80) + 'ms;display:block;text-decoration:none;color:inherit;';

      var h = '';
      if (c.badge) h += '<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:rgba(109,40,217,0.12);color:#C084FC;">' + esc(c.badge) + '</span>';
      h += '<p style="font-weight:700;font-size:15px;color:#fff;margin-top:8px;">' + esc(c.name) + '</p>';
      h += '<p style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:4px;">' + esc(c.bonus) + '</p>';
      h += '<div style="margin-top:10px;display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;background:rgba(109,40,217,0.12);color:#C084FC;">Получить <i class="fa-solid fa-arrow-right" style="font-size:9px;"></i></div>';
      el.innerHTML = h;
      el.addEventListener('click', function() { TG.haptic.heavy(); });
      row.appendChild(el);
    }
  }

  function renderRecent() {
    var recent = App.getLocal('recentGames', []);
    var sec = $('recent-section');
    if (recent.length === 0) { sec.style.display = 'none'; return; }
    sec.style.display = '';
    var row = $('recent-games'); row.innerHTML = '';
    var games = DataStore.getActiveGames(), idx = 0;
    for (var i = 0; i < recent.length; i++) {
      var found = null;
      for (var j = 0; j < games.length; j++) { if (games[j].id === recent[i]) { found = games[j]; break; } }
      if (found) { row.appendChild(buildRecentCard(found, idx * 50)); idx++; }
    }
  }

  /* ============================================
     GAMES TAB
     ============================================ */
  function buildChips() {
    var row = $('chips-row'); row.innerHTML = '';
    var tags = [
      { key: 'all', label: '🎰 Все' }, { key: 'popular', label: '🔥 Popular' },
      { key: 'top', label: '🏆 Top' }, { key: 'new', label: '✨ New' },
      { key: 'favorites', label: '❤️ Избранное' }
    ];
    for (var i = 0; i < tags.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'chip interactive' + (tags[i].key === App.getActiveFilter() ? ' chip-active' : '');
      btn.setAttribute('data-filter', tags[i].key);
      btn.textContent = tags[i].label;
      (function(k) { btn.addEventListener('click', function() { TG.haptic.light(); setFilter(k); }); })(tags[i].key);
      row.appendChild(btn);
    }
  }

  function setFilter(f) {
    App.setActiveFilter(f);
    var chips = $('chips-row').querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle('chip-active', chips[i].getAttribute('data-filter') === f);
    renderGamesGrid();
  }

  function renderGamesGrid() {
    var grid = $('games-grid'), empty = $('games-empty');
    grid.innerHTML = ''; empty.style.display = 'none';

    var filter = App.getActiveFilter();
    var query = App.getSearchQuery();
    var games = filter === 'favorites' ? DataStore.getFavoriteGames() : DataStore.getActiveGames();

    var filtered = games.filter(function(g) {
      var matchTag = (filter === 'all' || filter === 'favorites') || (g.tag === filter);
      var matchName = !query || g.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      return matchTag && matchName;
    });

    if (filter === 'all' && !query) {
      filtered.sort(function(a, b) {
        if (a.tag === 'new' && b.tag !== 'new') return -1;
        if (b.tag === 'new' && a.tag !== 'new') return 1;
        if (a.tag === 'new' && b.tag === 'new') return b.order - a.order;
        return a.order - b.order;
      });
    } else if (filter === 'new' && !query) {
      filtered.sort(function(a, b) { return b.order - a.order; });
    }

    if (filtered.length === 0) {
      empty.style.display = '';
      empty.innerHTML = filter === 'favorites'
        ? '<i class="fa-regular fa-heart text-3xl mb-3" style="color:var(--text-muted);"></i><p>Нажмите ❤️ на карточке, чтобы добавить</p>'
        : '<i class="fa-solid fa-dice text-3xl mb-3" style="color:var(--text-muted);"></i><p>Ничего не найдено</p>';
    } else {
      for (var i = 0; i < filtered.length; i++) grid.appendChild(buildGridCard(filtered[i], i * 50));
    }
  }

  /* ============================================
     CASINOS TAB
     ============================================ */
  function renderCasinos() {
    var list = $('casinos-list'); list.innerHTML = '';
    var casinos = DataStore.getActiveCasinos();

    for (var i = 0; i < casinos.length; i++) {
      var c = casinos[i];
      var el = document.createElement('div');
      el.className = 'casino-card mb-4 grid-card-animated';
      el.style.background = c.color || 'var(--glass-bg)';
      el.style.animationDelay = (i * 80) + 'ms';

      var h = '';
      if (c.badge) h += '<span class="casino-badge">' + esc(c.badge) + '</span>';
      h += '<div class="flex items-center gap-3" style="position:relative;z-index:2;">';
      if (c.logo) h += '<img src="' + esc(c.logo) + '" style="width:48px;height:48px;border-radius:12px;object-fit:cover;border:1px solid rgba(67,56,202,0.12);" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'">';
      else h += '<div style="width:48px;height:48px;border-radius:12px;background:rgba(67,56,202,0.15);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;">' + esc(c.name.charAt(0)) + '</div>';
      h += '<div style="flex:1;min-width:0;">';
      h += '<p style="font-weight:700;font-size:16px;color:#fff;">' + esc(c.name) + '</p>';
      h += '<p style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:2px;">' + esc(c.bonus) + '</p>';
      h += '</div></div>';
      h += '<p style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:12px;line-height:1.5;position:relative;z-index:2;">' + esc(c.description) + '</p>';
      h += '<a href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer" class="btn-cta interactive w-full py-3 rounded-xl text-sm font-bold mt-4" style="position:relative;z-index:2;display:block;text-align:center;text-decoration:none;color:#fff;"><span class="cta-glow"></span>Получить бонус →</a>';
      el.innerHTML = h;
      el.querySelector('.btn-cta').addEventListener('click', function(e) { e.stopPropagation(); TG.haptic.heavy(); });
      list.appendChild(el);
    }

    if (casinos.length === 0) list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-crown text-3xl mb-3" style="color:var(--text-muted);"></i><p>Казино не добавлены</p></div>';

    var disc = document.createElement('p');
    disc.style.cssText = 'text-align:center;font-size:11px;color:var(--text-muted);padding:16px 0 32px;';
    disc.textContent = 'Рекламные предложения от партнёров. 18+';
    list.appendChild(disc);
  }

  /* ============================================
     WINS HERO (top of profile)
     ============================================ */
  function renderWinsHero() {
    var hero = $('wins-hero');
    var content = $('wins-hero-content');
    if (!hero || !content || !window.Features) { if (hero) hero.style.display = 'none'; return; }

    var d = Features.getData();
    var wins = d.wins || [];
    var best = d.biggestWin || 0;
    var totalWon = d.totalWon || 0;
    var totalBet = d.totalBet || 0;
    var cur = DataStore.getCurrencySymbol();

    /* Show only if there's at least some data */
    if (wins.length === 0 && totalWon === 0) {
      hero.style.display = 'none';
      return;
    }
    hero.style.display = '';

    var fmt = function(n) { return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
    var fmtShort = function(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
      return n.toFixed(0);
    };

    var html = '';

    /* Big best win */
    if (best > 0) {
      html += '<div style="text-align:center;margin-bottom:10px;">';
      html += '<div style="font-size:9px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">\uD83C\uDFC6 Лучший выигрыш</div>';
      html += '<div style="font-size:28px;font-weight:900;background:linear-gradient(135deg,#C084FC,#F97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.2;">' + fmt(best) + ' ' + esc(cur) + '</div>';
      html += '</div>';
    }

    /* Stats row */
    html += '<div style="display:flex;gap:6px;">';
    if (totalWon > 0) {
      html += '<div style="flex:1;text-align:center;padding:8px 4px;border-radius:10px;background:rgba(255,255,255,0.03);">';
      html += '<div style="font-size:15px;font-weight:900;color:#A78BFA;">' + fmtShort(totalWon) + ' ' + esc(cur) + '</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);font-weight:600;margin-top:2px;">\uD83D\uDCB0 Всего</div></div>';
    }
    html += '<div style="flex:1;text-align:center;padding:8px 4px;border-radius:10px;background:rgba(255,255,255,0.03);">';
    html += '<div style="font-size:15px;font-weight:900;color:#8B5CF6;">' + wins.length + '</div>';
    html += '<div style="font-size:8px;color:var(--text-muted);font-weight:600;margin-top:2px;">\uD83C\uDFB0 Сессий</div></div>';
    /* ROI removed */
    html += '</div>';

    /* Last big win highlight */
    if (wins.length > 0) {
      var last = wins[0];
      var ago = _timeAgo(last.ts);
      html += '<div style="margin-top:8px;display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,0.02);">';
      html += '<span style="font-size:18px;">' + (last.gameIcon || '\uD83C\uDFB0') + '</span>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:11px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(last.gameName || '') + '</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);">' + ago + '</div></div>';
      html += '<div style="text-align:right;">';
      html += '<div style="font-size:13px;font-weight:900;color:#C084FC;">' + fmt(last.amount) + ' ' + esc(cur) + '</div>';
      if (last.mult > 0) html += '<div style="font-size:8px;font-weight:700;color:#A78BFA;">x' + last.mult + '</div>';
      html += '</div></div>';
    }

    content.innerHTML = html;
  }

  function _timeAgo(ts) {
    var diff = Date.now() - (ts || 0);
    var m = Math.floor(diff / 60000);
    if (m < 1) return 'только что';
    if (m < 60) return m + ' мин назад';
    var h = Math.floor(m / 60);
    if (h < 24) return h + ' ч назад';
    var d = Math.floor(h / 24);
    return d + ' дн назад';
  }

  /* ============================================
     PROFILE TAB
     ============================================ */
  function renderProfile() {
    safeRender('renderWinsHero', renderWinsHero);
    safeRender('updateStats', updateStats);
    safeRender('updateXPBar', updateXPBar);
    safeRender('renderXPLeaderboard', function() {
      var c = $('xp-leaderboard-container');
      if (c && window.Leaderboard) Leaderboard.render(c, 10);
    });
    /* Currency display */
    var cur = DataStore.getCurrency();
    $('currency-flag').textContent = cur.flag;
    $('currency-code').textContent = cur.code;
    $('currency-name').textContent = cur.name;
    $('currency-symbol-display').textContent = cur.symbol;

    /* Theme toggle */
    safeRender('initThemeToggle', initThemeToggle);
    /* Language display */
    safeRender('updateLangDisplay', updateLangDisplay);
    /* Achievements */
    safeRender('renderAchievements', function() {
      var c = $('achievements-container');
      if (c && window.Features) {
        Features.checkNewAchievements();
        Features.renderAchievements(c);
        var unlocked = Features.getUnlocked();
        var counter = $('ach-counter');
        if (counter) counter.textContent = unlocked.length + '/' + Features.ACHIEVEMENTS.length;
      }
    });
    /* My Games (unified log) */
    safeRender('renderGameLog', function() {
      var c = $('gamelog-container');
      if (c && window.Features) {
        var result = Features.renderGameLog(c);
        var counter = $('gamelog-counter');
        if (counter && result) {
          var d = Features.getData();
          var winsCount = (d.wins || []).length;
          var histCount = (d.history || []).length;
          if (winsCount > 0) {
            counter.textContent = winsCount + ' выигр.';
            counter.style.background = 'rgba(249,115,22,0.1)';
            counter.style.color = '#F97316';
          } else if (histCount > 0) {
            counter.textContent = histCount + ' сесс.';
          }
        }
      }
    });
    /* Referral */
    safeRender('renderReferral', function() {
      var c = $('referral-container');
      if (c && window.Features) Features.renderReferral(c);
    });
  }

  /* Theme toggle binding */
  var _themeInitialized = false;
  function initThemeToggle() {
    var btns = document.querySelectorAll('.theme-btn');
    var curTheme = window.ThemeManager ? ThemeManager.getTheme() : 'dark';
    for (var i = 0; i < btns.length; i++) {
      var t = btns[i].getAttribute('data-theme');
      btns[i].classList.toggle('theme-btn-active', t === curTheme);
      if (t === curTheme) {
        btns[i].style.background = 'linear-gradient(135deg,#2E1065,#6D28D9,#4338CA)';
        btns[i].style.color = '#fff';
        btns[i].style.borderColor = 'transparent';
      } else {
        btns[i].style.background = 'rgba(255,255,255,0.03)';
        btns[i].style.color = 'var(--text-secondary)';
        btns[i].style.borderColor = 'rgba(255,255,255,0.05)';
      }
      if (!_themeInitialized) {
        (function(btn) {
          btn.addEventListener('click', function() {
            TG.haptic.light(); App.playSound('click');
            var theme = btn.getAttribute('data-theme');
            if (window.ThemeManager) ThemeManager.setTheme(theme);
            initThemeToggle();
          });
        })(btns[i]);
      }
    }
    _themeInitialized = true;
  }

  /* Language display */
  function updateLangDisplay() {
    if (!window.I18n) return;
    var langs = I18n.getLangs();
    var cur = I18n.getLang();
    for (var i = 0; i < langs.length; i++) {
      if (langs[i].code === cur) {
        var fl = $('lang-flag');
        var nm = $('lang-name');
        if (fl) fl.textContent = langs[i].flag;
        if (nm) nm.textContent = langs[i].nativeName;
        break;
      }
    }
  }

  function renderCurrencyList(query) {
    var list = $('currency-list'); list.innerHTML = '';
    var currentCode = DataStore.settings.currencyCode;
    var q = (query || '').toLowerCase().trim();

    for (var i = 0; i < CURRENCIES.length; i++) {
      var c = CURRENCIES[i];
      if (q && c.code.toLowerCase().indexOf(q) === -1 && c.name.toLowerCase().indexOf(q) === -1 && c.symbol.toLowerCase().indexOf(q) === -1) continue;

      var item = document.createElement('div');
      item.className = 'currency-item' + (c.code === currentCode ? ' selected' : '');
      var h = '<span class="text-xl flex-shrink-0" style="width:32px;text-align:center;">' + c.flag + '</span>';
      h += '<div style="flex:1;min-width:0;"><p style="font-weight:600;font-size:14px;color:var(--text-primary);">' + esc(c.code) + '</p><p style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(c.name) + '</p></div>';
      h += '<span style="font-size:14px;font-weight:500;color:var(--text-secondary);flex-shrink:0;">' + esc(c.symbol) + '</span>';
      if (c.code === currentCode) h += '<i class="fa-solid fa-check text-sm flex-shrink-0" style="color:var(--accent-green);margin-left:8px;"></i>';
      item.innerHTML = h;

      (function(cur) {
        item.addEventListener('click', function() {
          TG.haptic.medium();
          DataStore.setCurrency(cur.code);
          App.hideModal($('modal-currency'));
          safeRender('renderProfile', renderProfile);
          safeRender('buildWinFeed', buildWinFeed);
          App.showToast('💱', 'Валюта изменена на ' + cur.code + ' ' + cur.symbol);
        });
      })(c);
      list.appendChild(item);
    }

    if (list.children.length === 0) list.innerHTML = '<div class="empty-state"><p>Валюта не найдена</p></div>';
  }

  /* ============================================
     LEADERBOARD
     ============================================ */
  function renderLeaderboard(period) {
    var el = $('leaderboard'); if (!el) return;
    var names = ['Ден***','Kate***','Алек***','Max***','Анна***','Игор***','Lisa***','Рома***','Стас***','Дима***','Марк***','Вера***','Лена***','Арте***','Миша***','Ник***','Юлия***','Влад***','Тимо***','Софи***'];
    var games = DataStore.getActiveGames();
    var cur = DataStore.getCurrency();
    var seed = period === 'day' ? Math.floor(Date.now() / 86400000) : Math.floor(Date.now() / 604800000);

    /* Get user data */
    var userBestWin = 0;
    var uName = (window.TG && TG.userFirstName) ? TG.userFirstName : 'You';
    if (window.Features) {
      var d = Features.getData();
      userBestWin = d.biggestWin || 0;
    }

    var entries = [];

    /* Top 3 bots: always BIG wins from 100k to millions (realistic casino) */
    var topRanges = period === 'week'
      ? [{ min: 800000, max: 3000000 }, { min: 400000, max: 1200000 }, { min: 200000, max: 600000 }]
      : [{ min: 500000, max: 2000000 }, { min: 250000, max: 800000 }, { min: 100000, max: 400000 }];

    for (var t = 0; t < topRanges.length; t++) {
      var ht = simpleHash('home_elite_' + period + '_' + seed + '_' + t);
      var topAmt = topRanges[t].min + (ht % (topRanges[t].max - topRanges[t].min));
      var topGame = games.length > 0 ? games[ht % games.length] : { name: 'Sweet Bonanza', icon: '🍬' };
      var topMult = 100 + (ht % 900);
      entries.push({ name: names[ht % names.length], game: topGame, amount: topAmt, mult: 'x' + topMult, self: false });
    }

    /* 2-3 mid-range bots (above user level but not millions) */
    var midCount = 2 + (simpleHash('home_mid_' + seed + period) % 2);
    for (var m = 0; m < midCount; m++) {
      var hm = simpleHash('home_mid_' + period + '_' + seed + '_' + m);
      var midMin = period === 'week' ? 50000 : 20000;
      var midMax = period === 'week' ? 250000 : 100000;
      /* Also ensure above user */
      var midAmt = Math.max(midMin + (hm % (midMax - midMin)), userBestWin * 1.2 + 5000);
      var midGame = games.length > 0 ? games[hm % games.length] : { name: 'Gates of Olympus', icon: '⚡' };
      entries.push({ name: names[(hm + 7) % names.length], game: midGame, amount: Math.round(midAmt), mult: 'x' + (20 + (hm % 480)), self: false });
    }

    /* 4-5 regular bots (lower range) */
    for (var i = 0; i < 5; i++) {
      var hash = simpleHash(period + '_lb_' + seed + '_' + i);
      var game = games.length > 0 ? games[hash % games.length] : { name: 'Sweet Bonanza', icon: '🍬' };
      var amt = period === 'week' ? 5000 + (hash % 50000) : 1000 + (hash % 20000);
      entries.push({ name: names[hash % names.length], game: game, amount: amt, mult: 'x' + (5 + (hash % 200)), self: false });
    }

    /* Insert real user if they have wins */
    if (userBestWin > 0) {
      var bestGame = null;
      if (window.Features) {
        var wins = Features.getData().wins || [];
        for (var bw = 0; bw < wins.length; bw++) {
          if (wins[bw].amount === userBestWin) { bestGame = DataStore.getGameById(wins[bw].gameId); break; }
        }
      }
      if (!bestGame && games.length > 0) bestGame = games[0];
      entries.push({
        name: uName,
        game: bestGame || { name: 'SlotX', icon: '🎰' },
        amount: userBestWin,
        mult: '',
        self: true
      });
    }

    entries.sort(function(a, b) { return b.amount - a.amount; });

    /* Safety: ensure user is never in top 3 */
    for (var s = 0; s < 5; s++) {
      var uIdx = -1;
      for (var si = 0; si < entries.length; si++) { if (entries[si].self) { uIdx = si; break; } }
      if (uIdx >= 0 && uIdx < 3) {
        var u = entries.splice(uIdx, 1)[0];
        var pos = Math.min(3 + (simpleHash('hpos_' + seed) % 3), entries.length);
        entries.splice(pos, 0, u);
      } else break;
    }

    var fmtMoney = function(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
      return n.toFixed(0);
    };

    var h = '';
    for (var j = 0; j < Math.min(entries.length, 10); j++) {
      var e = entries[j];
      var medal = j === 0 ? '🥇' : j === 1 ? '🥈' : j === 2 ? '🥉' : '<span class="lb-rank-num">' + (j + 1) + '</span>';
      var amtStr = fmtMoney(e.amount) + ' ' + esc(cur.symbol);
      var rowCls = 'lb-row' + (j < 3 ? ' lb-top' : '') + (e.self ? ' lb-self' : '');
      h += '<div class="' + rowCls + '">';
      h += '<div class="lb-medal">' + medal + '</div>';
      h += '<div class="lb-player"><span class="lb-name">' + (e.self ? '⭐ ' : '') + esc(e.name) + '</span><span class="lb-game">' + (e.game.icon || '🎰') + ' ' + esc(e.game.name) + '</span></div>';
      h += '<div class="lb-win"><span class="lb-amount">' + amtStr + '</span>' + (e.mult ? '<span class="lb-mult">' + e.mult + '</span>' : '') + '</div>';
      h += '</div>';
    }
    el.innerHTML = h;
  }

  /* Leaderboard tabs */
  var lbTabs = document.querySelectorAll('.lb-tab');
  for (var li = 0; li < lbTabs.length; li++) {
    (function(tab) {
      tab.addEventListener('click', function() {
        for (var j = 0; j < lbTabs.length; j++) lbTabs[j].classList.remove('active');
        tab.classList.add('active');
        safeRender('renderLeaderboard', function() { renderLeaderboard(tab.getAttribute('data-lb')); });
        TG.haptic.light();
      });
    })(lbTabs[li]);
  }

  /* ============================================
     WIN FEED (with force reflow for TG WebView)
     ============================================ */
  function buildWinFeed() {
    var el = $('win-feed-inner'); if (!el) return;
    var names = ['Ден***','Kate***','Алек***','Max***','Анна***','Игор***','Lisa***','Рома***','Стас***','Дима***','Марк***','Вера***','Лена***','Арте***','Миша***','Ник***','Юлия***','Влад***','Даша***','Тимо***'];
    var games = DataStore.getActiveGames();
    var cur = DataStore.getCurrency();
    var multipliers = ['x2.1','x3.5','x5.8','x12','x24','x48','x87','x150','x320','x500','x1200'];
    var items = [];

    /* Mix in REAL user wins from Features */
    var realWins = [];
    if (window.Features) {
      var d = Features.getData();
      var w = d.wins || [];
      var uName = (window.TG && TG.userFirstName) ? TG.userFirstName.substring(0,4) + '***' : 'You***';
      for (var rw = 0; rw < Math.min(w.length, 5); rw++) {
        var rWin = w[rw];
        var rAmt = rWin.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        var rMult = rWin.mult > 0 ? 'x' + rWin.mult : '';
        var isHuge = rWin.amount > 5000 || rWin.mult >= 100;
        realWins.push('<span class="wf-chip' + (isHuge ? ' wf-mega' : ' wf-real') + '"><span class="wf-icon">' + (rWin.gameIcon || '🎰') + '</span><span class="wf-name">' + esc(uName) + '</span><span class="wf-sep">→</span><span class="wf-amt">' + rAmt + ' ' + esc(cur.symbol) + '</span>' + (rMult ? '<span class="wf-mult">' + rMult + '</span>' : '') + '</span>');
      }
    }

    for (var i = 0; i < 25; i++) {
      var n = names[Math.floor(Math.random() * names.length)];
      var g = games.length > 0 ? games[Math.floor(Math.random() * games.length)] : { name: 'Sweet Bonanza', icon: '🍬' };
      var r = Math.random();
      var base = r < 0.4 ? 10 + Math.random() * 990 : r < 0.7 ? 1000 + Math.random() * 9000 : r < 0.88 ? 10000 + Math.random() * 90000 : 100000 + Math.random() * 900000;
      var amt = base.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      var mult = multipliers[Math.floor(Math.random() * multipliers.length)];
      var isHuge2 = base > 50000;
      items.push('<span class="wf-chip' + (isHuge2 ? ' wf-mega' : '') + '"><span class="wf-icon">' + (g.icon || '🎰') + '</span><span class="wf-name">' + esc(n) + '</span><span class="wf-sep">→</span><span class="wf-amt">' + amt + ' ' + esc(cur.symbol) + '</span><span class="wf-mult">' + mult + '</span></span>');

      /* Insert a real win every 5 fake ones */
      if (realWins.length > 0 && i % 5 === 4) {
        items.push(realWins.shift());
      }
    }
    /* Append remaining real wins */
    while (realWins.length > 0) items.push(realWins.shift());

    el.innerHTML = items.join('') + items.join('');

    /* Force reflow for TG WebView animation restart (ARTHOLST pattern) */
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = '';
  }

  /* ============================================
     TIMER
     ============================================ */
  function initTimer() {
    var target = App.getLocal('promoTimerTarget', 0);
    var now = Date.now();
    if (!target || target <= now) { target = now + (4 + Math.random() * 4) * 3600000; App.setLocal('promoTimerTarget', target); }

    function update() {
      var diff = Math.max(0, target - Date.now());
      if (diff === 0) { target = Date.now() + (4 + Math.random() * 4) * 3600000; App.setLocal('promoTimerTarget', target); }
      var h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
      setDigit('timer-h', (h < 10 ? '0' : '') + h);
      setDigit('timer-m', (m < 10 ? '0' : '') + m);
      setDigit('timer-s', (s < 10 ? '0' : '') + s);
    }

    function setDigit(id, val) {
      var el = $(id);
      if (el && el.textContent !== val) { el.style.transform = 'scale(1.15)'; el.textContent = val; setTimeout(function() { el.style.transform = ''; }, 150); }
    }

    update();
    if (window._timerInterval) clearInterval(window._timerInterval);
    window._timerInterval = setInterval(update, 1000);
  }

  /* ============================================
     ONLINE COUNTER
     ============================================ */
  function initOnlineCounter() {
    updateOnline();
    setInterval(updateOnline, 5000);
  }

  function updateOnline() {
    var el = $('online-count'); if (!el) return;
    /* Sum of all individual game online counts = total players */
    var games = DataStore.getActiveGames();
    var total = 0;
    for (var i = 0; i < games.length; i++) {
      total += getGameOnline(games[i].id);
    }
    /* Add small random jitter so it feels alive */
    total += Math.floor((Math.random() - 0.5) * 50);
    el.textContent = total.toLocaleString('ru-RU');
  }

  /* ============================================
     SCROLL ANIMATIONS
     ============================================ */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      var els = document.querySelectorAll('.anim-on-scroll');
      for (var i = 0; i < els.length; i++) els[i].classList.add('anim-visible');
      return;
    }
    var obs = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) if (entries[i].isIntersecting) entries[i].target.classList.add('anim-visible');
    }, { threshold: 0.08, rootMargin: '0px 0px -10px 0px' });
    var els = document.querySelectorAll('.anim-on-scroll');
    for (var j = 0; j < els.length; j++) obs.observe(els[j]);
  }

  /* ============================================
     STATS
     ============================================ */
  function trackGamePlayed(gameId) {
    var stats = App.getLocal('gameStats', { played: 0, games: {} });
    stats.played++;
    stats.games[gameId] = (stats.games[gameId] || 0) + 1;
    App.setLocal('gameStats', stats);
  }

  function getLevel(played) {
    if (played >= 100) return '👑';
    if (played >= 50) return '💎';
    if (played >= 20) return '⭐';
    if (played >= 5) return '🎮';
    return '🆕';
  }

  function getLevelFull(played) {
    if (played >= 100) return '👑 Легенда';
    if (played >= 50) return '💎 Мастер';
    if (played >= 20) return '⭐ Профи';
    if (played >= 5) return '🎮 Игрок';
    return '🆕 Новичок';
  }

  function updateXPBar() {
    if (!window.Features) return;
    Features.checkNewAchievements();
    var d = Features.getData();
    var xp = d.xp || 0;
    var lvl = Features.getLevel(xp);
    var next = Features.getNextLevel(xp);
    var lvlName = Features.getLevelName(lvl);

    var el = $('xp-level-text');
    if (el) el.innerHTML = lvl.icon + ' ' + App.escHtml(lvlName);
    el = $('xp-amount');
    if (el) el.textContent = xp + ' XP';

    if (next) {
      var pct = Math.min(((xp - lvl.min) / (next.min - lvl.min)) * 100, 100);
      el = $('xp-progress');
      if (el) el.style.width = pct + '%';
      el = $('xp-next');
      if (el) el.textContent = (next.min - xp) + ' XP ' + (window.I18n ? I18n.t('xp.toNext', 'до') : 'до') + ' ' + Features.getLevelName(next);
    } else {
      el = $('xp-progress');
      if (el) el.style.width = '100%';
      el = $('xp-next');
      if (el) el.textContent = 'MAX LEVEL!';
    }

    /* Update badge */
    el = $('profile-level-badge');
    if (el) el.textContent = lvl.icon + ' ' + lvlName;
  }

  function updateStats() {
    var stats = App.getLocal('gameStats', { played: 0, games: {} });
    var el = $('stat-played'); if (el) el.textContent = stats.played;
    el = $('stat-favorites'); if (el) el.textContent = DataStore.favorites.length;
    var timeMs = App.getLocal('timeInApp', 0);
    var m = Math.floor(timeMs / 60000);
    el = $('stat-time'); if (el) el.textContent = m < 60 ? m + 'м' : Math.floor(m / 60) + 'ч ' + (m % 60) + 'м';
    el = $('stat-level'); if (el) el.textContent = getLevel(stats.played);
    el = $('profile-level-badge'); if (el) el.textContent = getLevelFull(stats.played);
  }

  /* ============================================
     NOTIFICATIONS
     ============================================ */
  function initNotifications() {
    buildNotifQueue();
    showNextNotif();
  }

  function buildNotifQueue() {
    var games = DataStore.getActiveGames();
    var cur = DataStore.getCurrency();
    var names = ['Kate***', 'Max***', 'Алек***', 'Анна***', 'Стас***'];
    var gName = games.length > 0 ? games[Math.floor(Math.random() * games.length)].name : 'Sweet Bonanza';
    var uName = window.getUserFirstName ? window.getUserFirstName() : '';
    var hey = uName ? (uName + ', ') : '';

    notifQueue = [
      { icon: '🔥', title: 'Новый слот добавлен!', text: hey + 'попробуйте ' + gName + ' прямо сейчас!' },
      { icon: '⏰', title: 'Бонус истекает!', text: hey + 'успейте забрать 500% бонус — осталось 2 часа!' },
      { icon: '🏆', title: 'Мега-выигрыш!', text: names[Math.floor(Math.random() * names.length)] + ' выиграл 450,000 ' + cur.symbol + '!' },
      { icon: '💎', title: 'VIP-предложение', text: hey + 'эксклюзивный кэшбэк 15% ждёт вас!' },
      { icon: '🎁', title: hey + 'фриспины без депозита!', text: '100 бесплатных вращений — активируйте!' },
      { icon: '⚡', title: 'Турнир начался!', text: 'Призовой фонд 1,000,000 ' + cur.symbol + '!' }
    ];

    /* Shuffle */
    for (var i = notifQueue.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = notifQueue[i]; notifQueue[i] = notifQueue[j]; notifQueue[j] = tmp;
    }
  }

  function showNextNotif() {
    if (notifQueue.length === 0) buildNotifQueue();
    var n = notifQueue.shift();
    showNotifPopup(n.icon, n.title, n.text);
    setTimeout(showNextNotif, 90000 + Math.random() * 120000);
  }

  function showNotifPopup(icon, title, text) {
    var el = $('notification-popup'); if (!el) return;
    /* Only play sound if AudioContext is already unlocked (user interacted) */
    if (window.SoundFX && SoundFX.isInteracted()) App.playSound('notification');
    $('notif-icon').textContent = icon;
    $('notif-title').textContent = title;
    $('notif-text').textContent = text;
    el.classList.add('show');
    setTimeout(function() { el.classList.remove('show'); }, 4000);
  }

  /* Notification close */
  var nc = $('notif-close');
  if (nc) nc.addEventListener('click', function(e) { e.stopPropagation(); $('notification-popup').classList.remove('show'); });
  var np = $('notification-popup');
  if (np) np.addEventListener('click', function() {
    np.classList.remove('show');
    /* Suppress any sound that might trigger from AudioContext resuming on this tap */
    if (window.SoundFX) SoundFX.suppress();
    /* Switch to casinos tab silently (no sound) */
    var tabs = document.querySelectorAll('#bottom-nav .nav-btn');
    for (var ti = 0; ti < tabs.length; ti++) tabs[ti].classList.toggle('active', tabs[ti].getAttribute('data-tab') === 'casinos');
    $('tab-home').style.display = 'none';
    $('tab-games').style.display = 'none';
    $('tab-casinos').style.display = '';
    $('tab-profile').style.display = 'none';
    $('content-area').scrollTop = 0;
    safeRender('renderCasinos', renderCasinos);
  });

});
