/* ============================================
   MAIN CASINO APP — Affiliate Demo Casino v5
   Full Telegram Mini App Native Adaptation
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {

  /* ---- Telegram WebApp API — Full Adaptation ---- */
  var tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
  var isTg = !!tg;

  /* ============================================
     TG BACK BUTTON — NAVIGATION STACK
     Central state machine for BackButton visibility.
     Priority (highest first):
       1. Admin form overlay open
       2. Admin panel open
       3. Currency/Postgame modal open
       4. Story viewer open
       5. Game view open
       6. Non-home tab active
       7. Home tab → BackButton hidden
     ============================================ */
  function updateBackButton() {
    if (!tg) return;
    var shouldShow = false;

    var adminForm = document.getElementById('admin-form-overlay');
    var adminPanel = document.getElementById('admin-panel');
    var storyViewer = document.getElementById('story-viewer');
    var gameView = document.getElementById('game-view');
    var modalCurrency = document.getElementById('modal-currency');
    var modalPostgame = document.getElementById('modal-postgame');
    var modalAdminPass = document.getElementById('modal-admin-pass');

    if (modalAdminPass && modalAdminPass.classList.contains('active')) shouldShow = true;
    else if (adminForm && adminForm.classList.contains('open')) shouldShow = true;
    else if (adminPanel && adminPanel.classList.contains('open')) shouldShow = true;
    else if (modalCurrency && modalCurrency.classList.contains('active')) shouldShow = true;
    else if (modalPostgame && modalPostgame.classList.contains('active')) shouldShow = true;
    else if (storyViewer && storyViewer.style.display === 'flex') shouldShow = true;
    else if (gameView && gameView.style.display === 'flex') shouldShow = true;
    else if (activeTab !== 'home') shouldShow = true;

    try {
      if (shouldShow) tg.BackButton.show();
      else tg.BackButton.hide();
    } catch(e) {}
  }

  /* Expose globally for admin.js / features.js */
  window.updateBackButton = updateBackButton;

  function updateTgSafeAreas() {
    if (!tg) return;
    var root = document.documentElement;
    var safeTop = 0, safeBottom = 0, contentTop = 0;
    try { if (tg.safeAreaInset) { safeTop = tg.safeAreaInset.top || 0; safeBottom = tg.safeAreaInset.bottom || 0; } } catch(e) {}
    try { if (tg.contentSafeAreaInset) { contentTop = tg.contentSafeAreaInset.top || 0; } } catch(e) {}
    root.style.setProperty('--tg-safe-top', safeTop + 'px');
    root.style.setProperty('--tg-safe-bottom', safeBottom + 'px');
    root.style.setProperty('--tg-header-height', contentTop + 'px');
    try { if (tg.viewportStableHeight) root.style.setProperty('--tg-viewport-height', tg.viewportStableHeight + 'px'); } catch(e) {}
  }

  if (tg) {
    document.documentElement.classList.add('tg-app');
    try { tg.ready(); } catch(e) {}
    try { tg.expand(); } catch(e) {}
    try { tg.setHeaderColor('#06080D'); } catch(e) {}
    try { tg.setBackgroundColor('#06080D'); } catch(e) {}
    try { tg.enableClosingConfirmation(); } catch(e) {}
    try { tg.disableVerticalSwipes(); } catch(e) {}
    try { tg.isVerticalSwipesEnabled = false; } catch(e) {}
    try { tg.MainButton.hide(); } catch(e) {}

    /* Request fullscreen with retry */
    function tryFullscreen() {
      try { tg.requestFullscreen(); } catch(e) {}
    }
    tryFullscreen();
    setTimeout(tryFullscreen, 500);
    setTimeout(tryFullscreen, 1500);

    updateTgSafeAreas();

    try {
      tg.onEvent('viewportChanged', function() {
        updateTgSafeAreas();
        try { tg.requestFullscreen(); } catch(e2) {}
      });
      tg.onEvent('themeChanged', function() {
        try { tg.setHeaderColor('#06080D'); } catch(e) {}
        try { tg.setBackgroundColor('#06080D'); } catch(e) {}
      });
      try {
        tg.onEvent('fullscreenChanged', function() {
          updateTgSafeAreas();
        });
      } catch(e) {}

      /* === CENTRAL BACK BUTTON HANDLER === */
      tg.onEvent('backButtonClicked', function() {
        var adminForm = document.getElementById('admin-form-overlay');
        var adminPanel = document.getElementById('admin-panel');
        var storyViewer = document.getElementById('story-viewer');
        var gameView = document.getElementById('game-view');
        var modalCurrency = document.getElementById('modal-currency');
        var modalPostgame = document.getElementById('modal-postgame');
        var modalAdminPass = document.getElementById('modal-admin-pass');

        /* Priority chain — most nested first */
        if (modalAdminPass && modalAdminPass.classList.contains('active')) {
          hideModal(modalAdminPass);
        } else if (adminForm && adminForm.classList.contains('open')) {
          /* Close admin form → stay in admin panel */
          adminForm.classList.remove('open');
          updateBackButton();
        } else if (modalCurrency && modalCurrency.classList.contains('active')) {
          hideModal(modalCurrency);
        } else if (modalPostgame && modalPostgame.classList.contains('active')) {
          hideModal(modalPostgame);
        } else if (adminPanel && adminPanel.classList.contains('open')) {
          /* Close admin panel → back to app */
          adminPanel.classList.remove('open');
          if (window.appRefresh) window.appRefresh();
          updateBackButton();
        } else if (storyViewer && storyViewer.style.display === 'flex') {
          document.getElementById('story-close').click();
        } else if (gameView && gameView.style.display === 'flex') {
          closeGame();
        } else if (activeTab !== 'home') {
          /* Non-home tab → go back to home */
          switchTab('home');
        } else {
          /* Already at home → hide back button (nothing to go back to) */
          updateBackButton();
        }
      });
    } catch(e) {}
  }

  /* Legacy compatibility */
  window.setTgBackButton = function(show) {
    /* Deprecated — now use updateBackButton() which auto-detects state */
    updateBackButton();
  };

  /* ---- TG User Data ---- */
  var tgUser = null;
  var userName = 'Гость';
  var userFirstName = '';
  var userPhoto = '';

  function initTgUser() {
    if (tg) {
      try {
        var u = tg.initDataUnsafe && tg.initDataUnsafe.user;
        if (u) {
          tgUser = u;
          userFirstName = u.first_name || '';
          userName = userFirstName + (u.last_name ? ' ' + u.last_name : '');
          userPhoto = u.photo_url || '';
        }
      } catch(e) {}
    }
    updateUserUI();
  }

  function updateUserUI() {
    var greeting = $('header-greeting');
    if (greeting) {
      if (userFirstName) {
        var hour = new Date().getHours();
        var timeGreet = hour < 6 ? '🌙 Доброй ночи' : hour < 12 ? '☀️ Доброе утро' : hour < 18 ? '👋 Добрый день' : '🌆 Добрый вечер';
        greeting.textContent = timeGreet + ', ' + userFirstName + '!';
      } else {
        greeting.textContent = 'Демо-слоты бесплатно';
      }
    }

    var nameEl = $('profile-name');
    var usernameEl = $('profile-username');
    var avatarEmoji = $('profile-avatar-emoji');
    var avatarImg = $('profile-avatar-img');

    if (nameEl) nameEl.textContent = userName || 'Гость';
    if (usernameEl) {
      if (tgUser && tgUser.username) {
        usernameEl.textContent = '@' + tgUser.username;
      } else if (tgUser) {
        usernameEl.textContent = 'Telegram ID: ' + tgUser.id;
      } else {
        usernameEl.textContent = 'Добро пожаловать в SlotX!';
      }
    }
    if (userPhoto && avatarImg) {
      avatarImg.src = userPhoto;
      avatarImg.style.display = '';
      avatarImg.onerror = function() { this.style.display = 'none'; };
      if (avatarEmoji) avatarEmoji.style.display = 'none';
    }
  }

  window.getUserName = function() { return userName; };
  window.getUserFirstName = function() { return userFirstName; };
  window.getTgUser = function() { return tgUser; };

  function haptic(style) {
    try { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred(style || 'medium'); } catch(e) {}
  }

  function playSound(type) {
    try { if (window.SoundFX) SoundFX.play(type); } catch(e) {}
  }

  /* ---- State ---- */
  var activeTab = 'home';
  var activeFilter = 'all';
  var searchQuery = '';
  var currentGameUrl = '';
  var currentGameObj = null;
  var gameLoadTimeout = null;
  var bannerAutoTimer = null;
  var currentBannerIndex = 0;
  var toastTimer = null;
  var gameCloseCount = 0;
  var timerInterval = null;

  /* ---- Admin Auth ---- */
  var ADMIN_PASS = 'slotx2025';
  var isAdminAuthed = false;
  var logoTapCount = 0;
  var logoTapTimer = null;
  (function() { try { if (sessionStorage.getItem('sh_admin') === '1') isAdminAuthed = true; } catch(e) {} })();

  /* ---- DOM ---- */
  var $ = function(id) { return document.getElementById(id); };
  var elApp = $('app');
  var elContentArea = $('content-area');
  var elTabHome = $('tab-home');
  var elTabGames = $('tab-games');
  var elTabCasinos = $('tab-casinos');
  var elTabProfile = $('tab-profile');
  var elGameView = $('game-view');
  var elGameIframe = $('game-iframe');
  var elGameLoader = $('game-loader');
  var elGameLoadingText = $('game-loading-text');
  var elGameFallbackBtn = $('game-fallback-btn');
  var elGameLandscapeBack = $('game-landscape-back');
  var elGameTitle = $('game-title');
  var elGameBackBtn = $('game-back-btn');
  var elGameFullscreenBtn = $('game-fullscreen-btn');
  var elSearchInput = $('search-input');
  var elGamesGrid = $('games-grid');
  var elGamesEmpty = $('games-empty');
  var elRecentSection = $('recent-section');
  var elRecentGames = $('recent-games');
  var elFavoritesSection = $('favorites-section');
  var elFavoritesRow = $('favorites-row');
  var elPopularRow = $('popular-row');
  var elTopRow = $('top-row');
  var elNewRow = $('new-row');
  var elChipsRow = $('chips-row');
  var elCasinosList = $('casinos-list');
  var elHomeCasinoRow = $('home-casino-row');
  var elModalCurrency = $('modal-currency');
  var elModalPostgame = $('modal-postgame');
  var elToast = $('toast');
  var elToastText = $('toast-text');
  var elToastIcon = $('toast-icon');
  var elBannerTrack = $('banner-track');
  var elBannerDots = $('banner-dots');
  var elWinFeedInner = $('win-feed-inner');

  /* ---- Helpers ---- */
  var GRADIENTS = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
    'linear-gradient(135deg,#fccb90,#d57eeb)'
  ];

  function getLocal(key, fb) {
    try { var v = localStorage.getItem('sh_' + key); return v !== null ? JSON.parse(v) : fb; } catch(e) { return fb; }
  }
  function setLocal(key, val) {
    try { localStorage.setItem('sh_' + key, JSON.stringify(val)); } catch(e) {}
  }
  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ---- Affiliate ---- */
  function openAffiliate(url) {
    haptic('heavy');
    var link = url || (DataStore.casinos.length > 0 ? DataStore.casinos[0].url : '');
    if (!link) return;
    if (tg) {
      try { tg.openLink(link, { try_instant_view: false }); return; } catch(e) {}
    }
    window.open(link, '_blank');
  }

  function makeAffiliateLink(url, content, className) {
    var a = document.createElement('a');
    a.href = url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = className || '';
    a.style.textDecoration = 'none';
    a.style.color = 'inherit';
    if (typeof content === 'string') a.innerHTML = content;
    a.addEventListener('click', function() { haptic('heavy'); });
    return a;
  }

  /* ============================================
     SPLASH SCREEN
     ============================================ */
  function hideSplash() {
    var splash = $('splash-screen');
    if (!splash) return;
    splash.classList.add('hide');
    setTimeout(function() { splash.style.display = 'none'; }, 700);
  }

  /* ============================================
     CONFETTI SYSTEM
     ============================================ */
  var confettiCanvas = $('confetti-canvas');
  var confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  var confettiParticles = [];
  var confettiRunning = false;

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);

  function fireConfetti(x, y) {
    if (!confettiCtx) return;
    var colors = ['#FF006E', '#00FF87', '#8B5CF6', '#FFD700', '#00D4FF', '#FF4444'];
    for (var i = 0; i < 40; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 3 + Math.random() * 6;
      confettiParticles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1,
        decay: 0.012 + Math.random() * 0.015,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
    if (!confettiRunning) {
      confettiRunning = true;
      animateConfetti();
    }
  }

  function animateConfetti() {
    if (confettiParticles.length === 0) {
      confettiRunning = false;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      return;
    }
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (var i = confettiParticles.length - 1; i >= 0; i--) {
      var p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;
      if (p.life <= 0) { confettiParticles.splice(i, 1); continue; }
      confettiCtx.save();
      confettiCtx.globalAlpha = p.life;
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rotation * Math.PI / 180);
      confettiCtx.fillStyle = p.color;
      if (p.shape === 'rect') {
        confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      }
      confettiCtx.restore();
    }
    requestAnimationFrame(animateConfetti);
  }

  /* ============================================
     ONLINE COUNTER
     ============================================ */
  function initOnlineCounter() {
    updateOnlineCount();
    setInterval(updateOnlineCount, 5000);
  }

  function updateOnlineCount() {
    var el = $('online-count');
    if (!el) return;
    var fiveMin = Math.floor(Date.now() / 300000);
    var base = 800 + (simpleHash('global_online_' + fiveMin) % 1200);
    var jitter = Math.floor((Math.random() - 0.5) * 30);
    var count = base + jitter;
    el.textContent = count.toLocaleString('ru-RU');
  }

  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /* ============================================
     SCROLL ANIMATION OBSERVER
     ============================================ */
  var scrollObserver = null;
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      var els = document.querySelectorAll('.anim-on-scroll');
      for (var i = 0; i < els.length; i++) els[i].classList.add('anim-visible');
      return;
    }
    scrollObserver = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('anim-visible');
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -10px 0px' });

    var els = document.querySelectorAll('.anim-on-scroll');
    for (var j = 0; j < els.length; j++) {
      scrollObserver.observe(els[j]);
    }
  }

  /* ============================================
     TABS
     ============================================ */
  function switchTab(name) {
    haptic('light');
    playSound('tab');
    activeTab = name;
    elTabHome.style.display = name === 'home' ? '' : 'none';
    elTabGames.style.display = name === 'games' ? '' : 'none';
    elTabCasinos.style.display = name === 'casinos' ? '' : 'none';
    elTabProfile.style.display = name === 'profile' ? '' : 'none';

    var navBtnsAll = document.querySelectorAll('#bottom-nav .nav-btn');
    for (var i = 0; i < navBtnsAll.length; i++) {
      if (navBtnsAll[i].getAttribute('data-tab') === name) navBtnsAll[i].classList.add('active');
      else navBtnsAll[i].classList.remove('active');
    }
    elContentArea.scrollTop = 0;

    if (name === 'profile') renderProfile();
    if (name === 'casinos') renderCasinos();
    if (name === 'games') renderGamesGrid();

    /* Update TG BackButton — show on non-home tabs */
    updateBackButton();
  }

  /* ============================================
     LIVE WIN FEED
     ============================================ */
  function buildWinFeed() {
    var names = ['Ден***','Kate***','Алек***','Max***','Анна***','Игор***','Lisa***','Рома***','Стас***','Дима***','Марк***','Вера***','Лена***','Арте***','Миша***','Ник***','Ольг***','Паве***','Серг***','Юлия***','Влад***','Даша***','Тимо***','Ксен***','Илья***','Софи***','Егор***','Вика***','Кири***','Маша***'];
    var games = DataStore.getActiveGames();
    var cur = DataStore.getCurrency();
    var items = [];
    var multipliers = ['x2.1','x3.5','x5.8','x12','x24','x48','x87','x150','x320','x500','x1200'];

    function randAmount() {
      var r = Math.random();
      var base;
      if (r < 0.4) base = 10 + Math.random() * 990;
      else if (r < 0.7) base = 1000 + Math.random() * 9000;
      else if (r < 0.88) base = 10000 + Math.random() * 90000;
      else base = 100000 + Math.random() * 900000;
      return base.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    for (var i = 0; i < 25; i++) {
      var n = names[Math.floor(Math.random() * names.length)];
      var g = games.length > 0 ? games[Math.floor(Math.random() * games.length)] : { name: 'Sweet Bonanza', icon: '🍬' };
      var amt = randAmount();
      var mult = multipliers[Math.floor(Math.random() * multipliers.length)];
      var isHuge = parseFloat(amt.replace(/ /g, '')) > 50000;
      items.push(
        '<span class="wf-chip' + (isHuge ? ' wf-mega' : '') + '">' +
          '<span class="wf-icon">' + (g.icon || '🎰') + '</span>' +
          '<span class="wf-name">' + escHtml(n) + '</span>' +
          '<span class="wf-sep">→</span>' +
          '<span class="wf-amt">' + amt + ' ' + escHtml(cur.symbol) + '</span>' +
          '<span class="wf-mult">' + mult + '</span>' +
        '</span>'
      );
    }

    elWinFeedInner.innerHTML = items.join('') + items.join('');
  }

  /* ============================================
     PROMO TIMER
     ============================================ */
  function initTimer() {
    var target = getLocal('promoTimerTarget', 0);
    var now = Date.now();

    if (!target || target <= now) {
      target = now + (4 + Math.random() * 4) * 3600000;
      setLocal('promoTimerTarget', target);
    }

    function updateTimer() {
      var diff = Math.max(0, target - Date.now());
      if (diff === 0) {
        target = Date.now() + (4 + Math.random() * 4) * 3600000;
        setLocal('promoTimerTarget', target);
      }
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);

      setDigit('timer-h', h < 10 ? '0' + h : '' + h);
      setDigit('timer-m', m < 10 ? '0' + m : '' + m);
      setDigit('timer-s', s < 10 ? '0' + s : '' + s);
    }

    function setDigit(id, val) {
      var el = $(id);
      if (el && el.textContent !== val) {
        el.style.transform = 'scale(1.15)';
        el.textContent = val;
        setTimeout(function() { el.style.transform = ''; }, 150);
      }
    }

    updateTimer();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
  }

  /* ============================================
     GAME IMAGE BUILDER
     ============================================ */
  function buildGameImage(game, el) {
    var imgUrl = DataStore.getGameImageUrl(game);
    if (imgUrl) {
      var img = document.createElement('img');
      img.className = 'card-image';
      img.src = imgUrl;
      img.loading = 'lazy';
      img.setAttribute('referrerpolicy', 'no-referrer');
      img.onerror = function() {
        this.style.display = 'none';
        addEmojiIcon(el, game);
      };
      el.appendChild(img);
    } else {
      addEmojiIcon(el, game);
    }
  }

  function addEmojiIcon(el, game) {
    if (el.querySelector('.card-emoji')) return;
    var emoji = document.createElement('div');
    emoji.className = 'card-emoji';
    emoji.textContent = game.icon || '🎰';
    el.appendChild(emoji);
  }

  /* ============================================
     FAVORITE HEART (with confetti)
     ============================================ */
  function buildHeart(game, el) {
    var heart = document.createElement('div');
    heart.className = 'card-heart' + (DataStore.isFavorite(game.id) ? ' active' : '');
    heart.innerHTML = '<i class="fa-' + (DataStore.isFavorite(game.id) ? 'solid' : 'regular') + ' fa-heart"></i>';

    heart.addEventListener('click', function(e) {
      e.stopPropagation();
      haptic('light');
      playSound('favorite');
      var isFav = DataStore.toggleFavorite(game.id);
      heart.classList.toggle('active', isFav);
      heart.innerHTML = '<i class="fa-' + (isFav ? 'solid' : 'regular') + ' fa-heart"></i>';
      heart.classList.add('pop');
      setTimeout(function() { heart.classList.remove('pop'); }, 400);

      if (isFav) {
        showToast('❤️', escHtml(game.name) + ' добавлено в избранное');
        var rect = heart.getBoundingClientRect();
        fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        playSound('confetti');
      }
      renderFavorites();
      updateSectionCounts();
    });

    el.appendChild(heart);
  }

  /* ============================================
     GAME CARDS
     ============================================ */
  function buildRowCard(game, w, h, delay) {
    var el = document.createElement('div');
    el.className = 'game-card row-card-animated flex-shrink-0';
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.background = game.gradient || GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    if (delay) el.style.animationDelay = delay + 'ms';

    buildGameImage(game, el);

    var ov = document.createElement('div');
    ov.className = 'card-overlay';
    el.appendChild(ov);

    buildHeart(game, el);

    var info = document.createElement('div');
    info.className = 'card-info';
    var online = getGameOnline(game.id);
    info.innerHTML = '<div class="card-name">' + escHtml(game.name) + '</div>' +
      '<div class="card-provider">' + escHtml(game.provider || '') +
      '<span class="card-online"><span class="online-dot"></span>' + online + '</span></div>';
    el.appendChild(info);

    el.addEventListener('click', function() { haptic('heavy'); playSound('click'); openGame(game); });
    return el;
  }

  function buildGridCard(game, delay) {
    var el = document.createElement('div');
    el.className = 'game-card grid-card-animated';
    el.style.background = game.gradient || GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    if (delay) el.style.animationDelay = delay + 'ms';

    buildGameImage(game, el);

    var ov = document.createElement('div');
    ov.className = 'card-overlay';
    el.appendChild(ov);

    buildHeart(game, el);

    var info = document.createElement('div');
    info.className = 'card-info';
    var volInfo = getVolatilityLabel(game.volatility);
    var online = getGameOnline(game.id);

    info.innerHTML = '<div class="card-name">' + escHtml(game.name) + '</div>' +
      '<div class="card-provider">' +
      '<span class="card-volatility ' + volInfo.cls + '">⚡' + volInfo.text + '</span>' +
      '<span class="card-online"><span class="online-dot"></span>' + online + '</span>' +
      '</div>';
    el.appendChild(info);

    var play = document.createElement('div');
    play.className = 'card-play';
    play.innerHTML = '<i class="fa-solid fa-play"></i>';
    el.appendChild(play);

    el.addEventListener('click', function() { haptic('heavy'); playSound('click'); openGame(game); });
    return el;
  }

  function buildRecentCard(game, delay) {
    var el = document.createElement('div');
    el.className = 'recent-card row-card-animated';
    el.style.background = game.gradient || GRADIENTS[0];
    if (delay) el.style.animationDelay = delay + 'ms';

    var imgUrl = DataStore.getGameImageUrl(game);
    if (imgUrl) {
      var img = document.createElement('img');
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
      img.src = imgUrl;
      img.loading = 'lazy';
      img.setAttribute('referrerpolicy', 'no-referrer');
      img.onerror = function() { this.style.display = 'none'; };
      el.appendChild(img);
    } else if (game.icon) {
      var emoji = document.createElement('div');
      emoji.style.cssText = 'position:absolute;top:45%;left:50%;transform:translate(-50%,-55%);font-size:20px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));';
      emoji.textContent = game.icon;
      el.appendChild(emoji);
    }

    var nm = document.createElement('div');
    nm.className = 'recent-name';
    nm.textContent = game.name;
    el.appendChild(nm);

    el.addEventListener('click', function() { haptic('heavy'); playSound('click'); openGame(game); });
    return el;
  }

  /* ============================================
     SECTION COUNT BADGES
     ============================================ */
  function updateSectionCounts() {
    var games = DataStore.getActiveGames();
    var popularCount = games.filter(function(g) { return g.tag === 'popular'; }).length;
    var topCount = games.filter(function(g) { return g.tag === 'top'; }).length;
    var newCount = games.filter(function(g) { return g.tag === 'new'; }).length;
    var favCount = DataStore.getFavoriteGames().length;

    setCount('popular-count', popularCount);
    setCount('top-count', topCount);
    setCount('new-count', newCount);
    setCount('fav-count', favCount);
  }

  function setCount(id, num) {
    var el = $(id);
    if (el) el.textContent = num;
  }

  /* ============================================
     PROMO BANNER CAROUSEL
     ============================================ */
  function renderBanners() {
    if (window._storiesMode) {
      if (window.slotHub && window.slotHub.renderStoriesBanners) window.slotHub.renderStoriesBanners();
      return;
    }
    var casinos = DataStore.getActiveCasinos();
    elBannerTrack.innerHTML = '';
    elBannerDots.innerHTML = '';

    if (casinos.length === 0) {
      $('banner-carousel').style.display = 'none';
      elBannerDots.style.display = 'none';
      return;
    }

    $('banner-carousel').style.display = '';
    elBannerDots.style.display = '';

    var decoEmojis = ['🎰','💎','🎁','⚡','🏆','🔥','💰','🃏','🎲'];

    for (var i = 0; i < casinos.length; i++) {
      var c = casinos[i];
      var slide = document.createElement('div');
      slide.className = 'banner-slide';
      slide.style.background = c.color || 'linear-gradient(135deg,#FF006E,#8B5CF6)';

      if (c.bannerImage) {
        slide.innerHTML += '<img src="' + escHtml(c.bannerImage) + '" class="banner-slide-img" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'">';
      }

      var deco = decoEmojis[i % decoEmojis.length];
      var content = '<div class="banner-deco">' + deco + '</div>';
      content += '<div class="banner-slide-content">';
      if (c.badge) content += '<span class="banner-badge">' + escHtml(c.badge) + '</span>';
      content += '<p class="banner-title">' + escHtml(c.bannerTitle || c.bonus || c.name) + '</p>';
      content += '<p class="banner-subtitle">' + escHtml(c.bannerSubtitle || c.name) + '</p>';
      content += '<div class="banner-cta">Забрать <i class="fa-solid fa-arrow-right" style="font-size:10px;"></i></div>';
      content += '</div>';
      slide.innerHTML += content;

      (function(casino) {
        slide.addEventListener('click', function() { openAffiliate(casino.url); });
      })(c);

      elBannerTrack.appendChild(slide);

      var dot = document.createElement('div');
      dot.className = 'banner-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('data-index', i);
      (function(idx) {
        dot.addEventListener('click', function() { goToBanner(idx); });
      })(i);
      elBannerDots.appendChild(dot);
    }

    currentBannerIndex = 0;
    updateBannerPosition();
    startBannerAuto();
  }

  function goToBanner(idx) {
    if (window._storiesMode) return;
    var casinos = DataStore.getActiveCasinos();
    if (casinos.length === 0) return;
    currentBannerIndex = ((idx % casinos.length) + casinos.length) % casinos.length;
    updateBannerPosition();
    startBannerAuto();
  }

  function updateBannerPosition() {
    var slides = elBannerTrack.querySelectorAll('.banner-slide');
    if (slides.length > 0) {
      var slideWidth = slides[0].offsetWidth;
      var gap = 10;
      var offset = currentBannerIndex * (slideWidth + gap);
      elBannerTrack.style.transform = 'translateX(-' + offset + 'px)';
    }
    var dots = elBannerDots.querySelectorAll('.banner-dot');
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === currentBannerIndex);
    }
  }

  function startBannerAuto() {
    if (bannerAutoTimer) clearInterval(bannerAutoTimer);
    bannerAutoTimer = setInterval(function() {
      var casinoCount = DataStore.getActiveCasinos().length;
      if (casinoCount > 1) {
        currentBannerIndex = (currentBannerIndex + 1) % casinoCount;
        updateBannerPosition();
      }
    }, 5000);
  }

  /* ============================================
     RENDER — HOME
     ============================================ */
  function renderHome() {
    var games = DataStore.getActiveGames();

    renderBanners();
    renderFavorites();
    updateSectionCounts();

    elPopularRow.innerHTML = '';
    var popularGames = games.filter(function(g) { return g.tag === 'popular'; }).slice(0, 8);
    for (var i = 0; i < popularGames.length; i++) {
      elPopularRow.appendChild(buildRowCard(popularGames[i], 200, 112, i * 60));
    }

    elTopRow.innerHTML = '';
    var topGames = games.filter(function(g) { return g.tag === 'top'; }).slice(0, 8);
    for (var j = 0; j < topGames.length; j++) {
      elTopRow.appendChild(buildRowCard(topGames[j], 200, 112, j * 60));
    }

    elNewRow.innerHTML = '';
    var newGames = games.filter(function(g) { return g.tag === 'new'; }).slice(0, 8);
    for (var k = 0; k < newGames.length; k++) {
      elNewRow.appendChild(buildRowCard(newGames[k], 200, 112, k * 60));
    }

    renderHomeCasinos();
    renderRecent();
    if (window.slotHub && window.slotHub.renderBonusBuy) window.slotHub.renderBonusBuy();
  }

  function renderFavorites() {
    var favGames = DataStore.getFavoriteGames();
    if (favGames.length === 0) {
      elFavoritesSection.style.display = 'none';
      return;
    }
    elFavoritesSection.style.display = '';
    elFavoritesRow.innerHTML = '';
    for (var i = 0; i < favGames.length; i++) {
      elFavoritesRow.appendChild(buildRowCard(favGames[i], 180, 100, i * 60));
    }
  }

  function renderHomeCasinos() {
    elHomeCasinoRow.innerHTML = '';
    var casinos = DataStore.getActiveCasinos().slice(0, 4);
    for (var i = 0; i < casinos.length; i++) {
      var c = casinos[i];
      var el = document.createElement('a');
      el.href = c.url || '#';
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.className = 'flex-shrink-0 interactive rounded-2xl p-4 relative overflow-hidden row-card-animated';
      el.style.cssText = 'width:220px;min-height:120px;background:' + (c.color || 'var(--glass-bg)') + ';border:1px solid rgba(255,255,255,0.08);animation-delay:' + (i * 80) + 'ms;display:block;text-decoration:none;color:inherit;';

      var inner = '';
      if (c.badge) inner += '<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:rgba(255,255,255,0.15);color:#fff;">' + escHtml(c.badge) + '</span>';
      inner += '<p style="font-weight:700;font-size:15px;color:#fff;margin-top:8px;">' + escHtml(c.name) + '</p>';
      inner += '<p style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:4px;">' + escHtml(c.bonus) + '</p>';
      inner += '<div style="margin-top:10px;display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;background:rgba(255,255,255,0.2);color:#fff;">Получить <i class="fa-solid fa-arrow-right" style="font-size:9px;"></i></div>';
      el.innerHTML = inner;

      (function(casino) {
        el.addEventListener('click', function() { haptic('heavy'); });
      })(c);

      elHomeCasinoRow.appendChild(el);
    }
  }

  /* ============================================
     RENDER — GAMES TAB
     ============================================ */
  function buildChips() {
    elChipsRow.innerHTML = '';
    var tags = [
      { key: 'all', label: '🎰 Все' },
      { key: 'popular', label: '🔥 Popular' },
      { key: 'top', label: '🏆 Top' },
      { key: 'new', label: '✨ New' },
      { key: 'favorites', label: '❤️ Избранное' }
    ];
    for (var i = 0; i < tags.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'chip interactive' + (tags[i].key === activeFilter ? ' chip-active' : '');
      btn.setAttribute('data-filter', tags[i].key);
      btn.textContent = tags[i].label;
      (function(key) {
        btn.addEventListener('click', function() { haptic('light'); setFilter(key); });
      })(tags[i].key);
      elChipsRow.appendChild(btn);
    }
  }

  function setFilter(f) {
    activeFilter = f;
    var chips = elChipsRow.querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle('chip-active', chips[i].getAttribute('data-filter') === f);
    }
    renderGamesGrid();
  }

  function renderGamesGrid() {
    elGamesGrid.innerHTML = '';
    elGamesEmpty.style.display = 'none';

    var games;
    if (activeFilter === 'favorites') {
      games = DataStore.getFavoriteGames();
    } else {
      games = DataStore.getActiveGames();
    }

    var filtered = games.filter(function(g) {
      var matchTag = (activeFilter === 'all' || activeFilter === 'favorites') || (g.tag === activeFilter);
      var matchName = !searchQuery || g.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
      return matchTag && matchName;
    });

    if (filtered.length === 0) {
      elGamesEmpty.style.display = '';
      if (activeFilter === 'favorites') {
        elGamesEmpty.innerHTML = '<i class="fa-regular fa-heart text-3xl mb-3" style="color:var(--text-muted);"></i><p>Нажмите ❤️ на карточке, чтобы добавить</p>';
      } else {
        elGamesEmpty.innerHTML = '<i class="fa-solid fa-dice text-3xl mb-3" style="color:var(--text-muted);"></i><p>Ничего не найдено</p>';
      }
    } else {
      for (var i = 0; i < filtered.length; i++) {
        elGamesGrid.appendChild(buildGridCard(filtered[i], i * 50));
      }
    }
  }

  /* ============================================
     RENDER — CASINOS TAB
     ============================================ */
  function renderCasinos() {
    elCasinosList.innerHTML = '';
    var casinos = DataStore.getActiveCasinos();
    for (var i = 0; i < casinos.length; i++) {
      var c = casinos[i];
      var el = document.createElement('div');
      el.className = 'casino-card mb-4 grid-card-animated';
      el.style.background = c.color || 'var(--glass-bg)';
      el.style.animationDelay = (i * 80) + 'ms';

      var html = '';
      if (c.badge) html += '<span class="casino-badge">' + escHtml(c.badge) + '</span>';
      html += '<div class="flex items-center gap-3" style="position:relative;z-index:2;">';
      if (c.logo) {
        html += '<img src="' + escHtml(c.logo) + '" style="width:48px;height:48px;border-radius:12px;object-fit:cover;border:1px solid rgba(255,255,255,0.1);" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'">';
      } else {
        html += '<div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;border:1px solid rgba(255,255,255,0.1);">' + escHtml(c.name.charAt(0)) + '</div>';
      }
      html += '<div style="flex:1;min-width:0;">';
      html += '<p style="font-weight:700;font-size:16px;color:#fff;">' + escHtml(c.name) + '</p>';
      html += '<p style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:2px;">' + escHtml(c.bonus) + '</p>';
      html += '</div></div>';
      html += '<p style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:12px;line-height:1.5;position:relative;z-index:2;">' + escHtml(c.description) + '</p>';
      html += '<a href="' + escHtml(c.url) + '" target="_blank" rel="noopener noreferrer" class="btn-cta interactive w-full py-3 rounded-xl text-sm font-bold mt-4 affiliate-btn" style="position:relative;z-index:2;display:block;text-align:center;text-decoration:none;color:#fff;"><span class="cta-glow"></span>Получить бонус →</a>';

      el.innerHTML = html;

      (function(casino) {
        el.querySelector('.affiliate-btn').addEventListener('click', function(e) {
          e.stopPropagation();
          haptic('heavy');
        });
      })(c);

      elCasinosList.appendChild(el);
    }

    if (casinos.length === 0) {
      elCasinosList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-crown text-3xl mb-3" style="color:var(--text-muted);"></i><p>Казино не добавлены</p></div>';
    }

    var disc = document.createElement('p');
    disc.style.cssText = 'text-align:center;font-size:11px;color:var(--text-muted);padding:16px 0 32px;';
    disc.textContent = 'Рекламные предложения от партнёров. 18+';
    elCasinosList.appendChild(disc);
  }

  /* ============================================
     RENDER — PROFILE
     ============================================ */
  function renderProfile() {
    if (window.slotHub && window.slotHub.updateStats) window.slotHub.updateStats();
    updateUserUI();
    var levelEl = $('profile-level-badge');
    var statLevel = $('stat-level');
    if (levelEl && statLevel) levelEl.textContent = statLevel.textContent;
    var cur = DataStore.getCurrency();
    $('currency-flag').textContent = cur.flag;
    $('currency-code').textContent = cur.code;
    $('currency-name').textContent = cur.name;
    $('currency-symbol-display').textContent = cur.symbol;
  }

  /* ============================================
     CURRENCY MODAL
     ============================================ */
  function renderCurrencyList(query) {
    var list = $('currency-list');
    list.innerHTML = '';
    var currentCode = DataStore.settings.currencyCode;
    var q = (query || '').toLowerCase().trim();

    for (var i = 0; i < CURRENCIES.length; i++) {
      var c = CURRENCIES[i];
      if (q) {
        var match = c.code.toLowerCase().indexOf(q) !== -1 || c.name.toLowerCase().indexOf(q) !== -1 || c.symbol.toLowerCase().indexOf(q) !== -1;
        if (!match) continue;
      }

      var item = document.createElement('div');
      item.className = 'currency-item' + (c.code === currentCode ? ' selected' : '');

      var inner = '<span class="text-xl flex-shrink-0" style="width:32px;text-align:center;">' + c.flag + '</span>';
      inner += '<div style="flex:1;min-width:0;">';
      inner += '<p style="font-weight:600;font-size:14px;color:var(--text-primary);">' + escHtml(c.code) + '</p>';
      inner += '<p style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escHtml(c.name) + '</p>';
      inner += '</div>';
      inner += '<span style="font-size:14px;font-weight:500;color:var(--text-secondary);flex-shrink:0;">' + escHtml(c.symbol) + '</span>';
      if (c.code === currentCode) {
        inner += '<i class="fa-solid fa-check text-sm flex-shrink-0" style="color:var(--accent-green);margin-left:8px;"></i>';
      }

      item.innerHTML = inner;

      (function(currency) {
        item.addEventListener('click', function() {
          haptic('medium');
          DataStore.setCurrency(currency.code);
          hideModal(elModalCurrency);
          renderProfile();
          buildWinFeed();
          showToast('💱', 'Валюта изменена на ' + currency.code + ' ' + currency.symbol);
        });
      })(c);

      list.appendChild(item);
    }

    if (list.children.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>Валюта не найдена</p></div>';
    }
  }

  /* ============================================
     RENDER — RECENT
     ============================================ */
  function renderRecent() {
    var recent = getLocal('recentGames', []);
    if (recent.length === 0) { elRecentSection.style.display = 'none'; return; }
    elRecentSection.style.display = '';
    elRecentGames.innerHTML = '';
    var games = DataStore.getActiveGames();
    var idx = 0;
    for (var i = 0; i < recent.length; i++) {
      var found = null;
      for (var j = 0; j < games.length; j++) {
        if (games[j].id === recent[i]) { found = games[j]; break; }
      }
      if (found) {
        elRecentGames.appendChild(buildRecentCard(found, idx * 50));
        idx++;
      }
    }
  }

  function saveRecent(gameId) {
    var recent = getLocal('recentGames', []);
    recent = recent.filter(function(id) { return id !== gameId; });
    recent.unshift(gameId);
    if (recent.length > 6) recent = recent.slice(0, 6);
    setLocal('recentGames', recent);
  }

  /* ============================================
     GAME VIEW
     ============================================ */
  function openGame(game) {
    playSound('open-game');
    var url = DataStore.getGameUrl(game);
    currentGameUrl = url;
    currentGameObj = game;

    elApp.style.display = 'none';
    elGameView.style.display = 'flex';
    elGameLoader.style.display = 'flex';
    elGameFallbackBtn.style.display = 'none';
    elGameLoadingText.textContent = 'Загрузка ' + game.name + '...';
    elGameTitle.textContent = game.name;

    elGameIframe.src = url;
    elGameIframe.onload = function() { elGameLoader.style.display = 'none'; };

    if (gameLoadTimeout) clearTimeout(gameLoadTimeout);
    gameLoadTimeout = setTimeout(function() {
      if (elGameLoader.style.display !== 'none') {
        elGameLoadingText.textContent = 'Загрузка затянулась...';
        elGameFallbackBtn.style.display = '';
      }
    }, 15000);

    updateBackButton();

    try {
      if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function() {});
    } catch(e) {}

    saveRecent(game.id);
    if (window.slotHub && window.slotHub.trackGamePlayed) window.slotHub.trackGamePlayed(game.id);
  }

  function closeGame() {
    playSound('close-game');
    elGameIframe.src = '';
    elGameIframe.onload = null;
    if (gameLoadTimeout) { clearTimeout(gameLoadTimeout); gameLoadTimeout = null; }

    elGameView.style.display = 'none';
    elApp.style.display = 'flex';
    updateBackButton();

    try {
      if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
    } catch(e) {}

    renderRecent();
    renderFavorites();

    gameCloseCount++;
    if (gameCloseCount >= 2 && gameCloseCount % 2 === 0 && currentGameObj) {
      showPostgamePopup(currentGameObj);
    }
  }

  /* ============================================
     POST-GAME POPUP
     ============================================ */
  function showPostgamePopup(game) {
    $('postgame-emoji').textContent = game.icon || '🎰';
    $('postgame-game-name').textContent = game.name;
    var ptTitle = document.querySelector('.postgame-title');
    if (ptTitle && userFirstName) {
      ptTitle.textContent = userFirstName + ', понравилась игра?';
    }
    showModal(elModalPostgame);
  }

  /* ============================================
     MODALS
     ============================================ */
  function showModal(el) {
    haptic('medium');
    playSound('click');
    el.style.display = 'flex';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { el.classList.add('active'); });
    });
    updateBackButton();
  }

  function hideModal(el) {
    el.classList.remove('active');
    setTimeout(function() {
      el.style.display = 'none';
      updateBackButton();
    }, 350);
  }

  /* ============================================
     TOAST
     ============================================ */
  function showToast(icon, text) {
    playSound('notification');
    if (toastTimer) clearTimeout(toastTimer);
    elToastIcon.textContent = icon || '🎉';
    elToastText.textContent = text;
    elToast.classList.add('show');
    toastTimer = setTimeout(function() { elToast.classList.remove('show'); }, 4000);
  }

  /* ---- Admin Auth Functions ---- */
  function tryOpenAdmin() {
    if (isAdminAuthed) { window.openAdminPanel(); showAdminBtn(); return; }
    showAdminPassModal();
  }

  function showAdminBtn() {
    var btn = $('btn-admin-profile');
    if (btn) btn.style.display = '';
  }

  function showAdminPassModal() {
    var modal = $('modal-admin-pass');
    $('admin-pass-input').value = '';
    $('admin-pass-error').style.display = 'none';
    showModal(modal);
    setTimeout(function() { $('admin-pass-input').focus(); }, 400);
  }

  function submitAdminPass() {
    var val = $('admin-pass-input').value.trim();
    if (val === ADMIN_PASS) {
      isAdminAuthed = true;
      try { sessionStorage.setItem('sh_admin', '1'); } catch(e) {}
      hideModal($('modal-admin-pass'));
      showAdminBtn();
      window.openAdminPanel();
    } else {
      $('admin-pass-error').style.display = '';
      haptic('heavy');
      $('admin-pass-input').value = '';
    }
  }

  /* ============================================
     EVENT LISTENERS
     ============================================ */

  // Bottom nav
  var elBottomNav = $('bottom-nav');
  var navBtns = elBottomNav.querySelectorAll('.nav-btn');
  for (var ni = 0; ni < navBtns.length; ni++) {
    (function(btn) {
      btn.addEventListener('click', function() { switchTab(btn.getAttribute('data-tab')); });
    })(navBtns[ni]);
  }

  // CTAs
  $('cta-mid-banner').addEventListener('click', function() { switchTab('casinos'); });
  $('btn-real-play').addEventListener('click', function() { haptic('heavy'); });

  // Section links
  $('link-popular').addEventListener('click', function() { switchTab('games'); setTimeout(function() { setFilter('popular'); }, 50); });
  $('link-top').addEventListener('click', function() { switchTab('games'); setTimeout(function() { setFilter('top'); }, 50); });
  $('link-new').addEventListener('click', function() { switchTab('games'); setTimeout(function() { setFilter('new'); }, 50); });
  $('link-casinos').addEventListener('click', function() { switchTab('casinos'); });

  // Search
  elSearchInput.addEventListener('input', function() {
    searchQuery = elSearchInput.value.trim();
    renderGamesGrid();
  });

  // Profile: currency
  $('btn-currency').addEventListener('click', function() {
    haptic('light');
    $('currency-search').value = '';
    renderCurrencyList('');
    showModal(elModalCurrency);
  });
  $('currency-search').addEventListener('input', function() { renderCurrencyList(this.value); });

  // Admin
  $('btn-admin-profile').addEventListener('click', function() { haptic('medium'); tryOpenAdmin(); });

  // Secret admin entry: 5 taps on logo
  (function() {
    var logoEl = document.querySelector('.header-logo');
    if (logoEl) {
      logoEl.style.cursor = 'pointer';
      logoEl.addEventListener('click', function() {
        logoTapCount++;
        if (logoTapTimer) clearTimeout(logoTapTimer);
        logoTapTimer = setTimeout(function() { logoTapCount = 0; }, 2000);
        if (logoTapCount >= 5) {
          logoTapCount = 0;
          tryOpenAdmin();
        }
      });
    }
  })();

  // Admin password modal
  $('admin-pass-submit').addEventListener('click', submitAdminPass);
  $('admin-pass-input').addEventListener('keydown', function(e) { if (e.key === 'Enter') submitAdminPass(); });
  $('modal-admin-pass').addEventListener('click', function(e) { if (e.target === $('modal-admin-pass')) hideModal($('modal-admin-pass')); });

  // Game controls (still needed for non-TG browsers)
  elGameBackBtn.addEventListener('click', closeGame);
  elGameLandscapeBack.addEventListener('click', closeGame);
  elGameFallbackBtn.addEventListener('click', function() { if (currentGameUrl) window.open(currentGameUrl, '_blank'); });
  elGameFullscreenBtn.addEventListener('click', function() {
    try {
      if (elGameIframe.requestFullscreen) elGameIframe.requestFullscreen();
      else if (elGameIframe.webkitRequestFullscreen) elGameIframe.webkitRequestFullscreen();
    } catch(e) {}
  });

  // Modal closes (X buttons — still visible for non-TG)
  var closeBtns = document.querySelectorAll('.modal-close');
  for (var ci = 0; ci < closeBtns.length; ci++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        var modal = btn.closest('.modal-overlay');
        if (modal) hideModal(modal);
      });
    })(closeBtns[ci]);
  }

  // Post-game popup
  $('postgame-cta').addEventListener('click', function() { hideModal(elModalPostgame); switchTab('casinos'); });
  $('postgame-skip').addEventListener('click', function() { hideModal(elModalPostgame); });

  elModalCurrency.addEventListener('click', function(e) { if (e.target === elModalCurrency) hideModal(elModalCurrency); });
  elModalPostgame.addEventListener('click', function(e) { if (e.target === elModalPostgame) hideModal(elModalPostgame); });

  // Toast
  elToast.addEventListener('click', function() { openAffiliate(); });

  // Resize
  window.addEventListener('resize', function() { updateBannerPosition(); });

  // Hardware back
  window.addEventListener('popstate', function() {
    if (elGameView.style.display === 'flex') closeGame();
  });

  /* ============================================
     INIT
     ============================================ */
  async function init() {
    if (window.SoundFX) SoundFX.init();

    await DataStore.init();

    var casinoCount = DataStore.getActiveCasinos().length;
    var badge = elBottomNav.querySelector('.badge-pulse');
    if (badge) badge.textContent = casinoCount > 0 ? casinoCount : '';

    buildChips();
    renderHome();
    renderGamesGrid();
    buildWinFeed();
    initTimer();
    initOnlineCounter();
    initScrollAnimations();

    elModalCurrency.style.display = 'none';
    elModalPostgame.style.display = 'none';
    $('modal-admin-pass').style.display = 'none';

    initTgUser();

    if (isAdminAuthed) showAdminBtn();

    if (userFirstName) {
      var splashSub = document.querySelector('.splash-sub');
      if (splashSub) splashSub.textContent = 'Привет, ' + userFirstName + '! 👋';
    }

    setTimeout(hideSplash, 1800);

    /* Initial BackButton state */
    updateBackButton();
  }

  window.appRefresh = function() {
    renderHome();
    buildChips();
    renderGamesGrid();
    buildWinFeed();
    updateSectionCounts();
    if (window.slotHub && window.slotHub.renderBonusBuy) window.slotHub.renderBonusBuy();
    if (activeTab === 'casinos') renderCasinos();
    if (activeTab === 'profile') renderProfile();
  };

  /* Expose API for features.js */
  window.slotHub = {
    openGame: openGame, openAffiliate: openAffiliate, makeAffiliateLink: makeAffiliateLink, haptic: haptic, playSound: playSound,
    switchTab: switchTab, showModal: showModal, hideModal: hideModal,
    fireConfetti: fireConfetti, buildRowCard: buildRowCard,
    renderFavorites: renderFavorites, updateSectionCounts: updateSectionCounts,
    setFilter: setFilter, escHtml: escHtml, getLocal: getLocal, setLocal: setLocal,
    GRADIENTS: GRADIENTS
  };

  init();
});
