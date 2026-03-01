/* ============================================
   SlotX — Main App Controller
   Uses TG Core wrapper for all Telegram integration
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {

  /* === State === */
  var activeTab = 'home';
  var activeFilter = 'all';
  var searchQuery = '';
  var currentGameUrl = '';
  var currentGameObj = null;
  var gameLoadTimeout = null;
  var gameCloseCount = 0;
  var toastTimer = null;

  /* Admin auth — locked to owner TG ID */
  var ADMIN_ID = 479031991;
  var ADMIN_PASS = 'slotx2026'; /* Fallback for browser testing only */
  var isAdminAuthed = false;
  var logoTapCount = 0;
  var logoTapTimer = null;

  function isOwner() {
    return TG.isAvailable && TG.userId === ADMIN_ID;
  }

  /* === DOM === */
  var $ = function(id) { return document.getElementById(id); };

  /* === User UI === */
  function updateUserUI() {
    var firstName = TG.userFirstName;
    var fullName = TG.userName;
    var photo = TG.user ? TG.user.photo_url : '';

    /* Greeting */
    var greeting = $('header-greeting');
    if (greeting) {
      greeting.textContent = window.I18n ? I18n.t('header.subtitle', 'Демо-слоты бесплатно') : 'Демо-слоты бесплатно';
    }

    /* Profile card */
    var nameEl = $('profile-name'), usernameEl = $('profile-username');
    var avatarEmoji = $('profile-avatar-emoji'), avatarImg = $('profile-avatar-img');

    if (nameEl) nameEl.textContent = fullName || 'Гость';
    if (usernameEl) {
      if (TG.userUsername) usernameEl.textContent = '@' + TG.userUsername;
      else if (TG.userId) usernameEl.textContent = 'Telegram ID: ' + TG.userId;
      else usernameEl.textContent = 'Добро пожаловать в SlotX!';
    }

    if (photo && avatarImg) {
      avatarImg.src = photo;
      avatarImg.style.display = '';
      avatarImg.onerror = function() { this.style.display = 'none'; };
      if (avatarEmoji) avatarEmoji.style.display = 'none';
    }
  }

  /* === Helpers === */
  function playSound(type) { try { if (window.SoundFX) SoundFX.play(type); } catch (e) {} }
  function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function getLocal(k, fb) { try { var v = localStorage.getItem('sh_' + k); return v !== null ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function setLocal(k, v) { try { localStorage.setItem('sh_' + k, JSON.stringify(v)); } catch (e) {} }

  /* === Navigation (Back Button Stack) === */
  function updateNavigation() {
    TG.hideBack();

    /* Build stack in reverse priority — last pushed = first handled on back press */
    if (activeTab !== 'home' && $('game-view').style.display === 'none') {
      TG.showBack(function() { switchTab('home'); });
    }

    var ap = $('admin-panel'), af = $('admin-form-overlay');
    if (ap && ap.classList.contains('open')) {
      TG.showBack(function() {
        ap.classList.remove('open');
        if (window.appRefresh) appRefresh();
        updateNavigation();
      });
    }
    if (af && af.classList.contains('open')) {
      TG.showBack(function() {
        af.classList.remove('open');
        updateNavigation();
      });
    }

    var mc = $('modal-currency'), mp = $('modal-postgame'), ma = $('modal-admin-pass'), ml = $('modal-language');
    if (mc && mc.classList.contains('active')) {
      TG.showBack(function() { hideModal(mc); });
    }
    if (mp && mp.classList.contains('active')) {
      TG.showBack(function() { hideModal(mp); });
    }
    if (ma && ma.classList.contains('active')) {
      TG.showBack(function() { hideModal(ma); });
    }
    if (ml && ml.classList.contains('active')) {
      TG.showBack(function() { hideModal(ml); });
    }

    var mw = $('modal-wheel');
    if (mw && mw.classList.contains('active')) {
      TG.showBack(function() { hideModal(mw); });
    }

    var sv = $('story-viewer');
    if (sv && sv.style.display === 'flex') {
      TG.showBack(function() { $('story-close').click(); });
    }

    if ($('game-view').style.display !== 'none') {
      TG.showBack(function() { closeGame(); });
    }
  }
  window.updateBackButton = updateNavigation;

  /* === Affiliate === */
  function openAffiliate(url) {
    TG.haptic.heavy();
    var link = url || (DataStore.casinos.length > 0 ? DataStore.casinos[0].url : '');
    if (!link) return;
    DataStore.trackAffiliateClick();
    TG.openLink(link);
  }

  /* === Tabs === */
  function switchTab(name) {
    TG.haptic.light();
    playSound('tab');
    activeTab = name;

    $('tab-home').style.display = name === 'home' ? '' : 'none';
    $('tab-games').style.display = name === 'games' ? '' : 'none';
    $('tab-casinos').style.display = name === 'casinos' ? '' : 'none';
    $('tab-profile').style.display = name === 'profile' ? '' : 'none';

    var btns = document.querySelectorAll('#bottom-nav .nav-btn');
    for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('active', btns[i].getAttribute('data-tab') === name);
    $('content-area').scrollTop = 0;

    if (name === 'profile' && window.UI) UI.renderProfile();
    if (name === 'casinos' && window.UI) UI.renderCasinos();
    if (name === 'games' && window.UI) UI.renderGamesGrid();

    updateNavigation();
  }

  /* === Game View === */
  function openGame(game) {
    playSound('open-game');
    var url = DataStore.getGameUrl(game);
    currentGameUrl = url;
    currentGameObj = game;

    $('app').style.display = 'none';
    $('game-view').style.display = 'block';
    $('game-loader').style.display = 'flex';
    $('game-fallback-btn').style.display = 'none';
    $('game-loading-text').textContent = 'Загрузка ' + game.name + '...';
    $('game-title').textContent = game.name;

    var iframe = $('game-iframe');
    iframe.src = url;
    iframe.onload = function() { $('game-loader').style.display = 'none'; };

    if (gameLoadTimeout) clearTimeout(gameLoadTimeout);
    gameLoadTimeout = setTimeout(function() {
      if ($('game-loader').style.display !== 'none') {
        $('game-loading-text').textContent = 'Загрузка затянулась...';
        $('game-fallback-btn').style.display = '';
      }
    }, 15000);

    updateNavigation();
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function() {}); } catch (e) {}

    saveRecent(game.id);
    if (window.UI) UI.trackGamePlayed(game.id);
    if (window.Features) { Features.addToHistory(game.id, game.name); Features.startGameSession(game.id); }
    DataStore.trackGamePlay(game.id);
  }

  function closeGame() {
    if (window.Features) Features.endGameSession();
    playSound('close-game');
    $('game-iframe').src = '';
    $('game-iframe').onload = null;
    $('game-view').classList.remove('game-fs');
    /* NOTE: Do NOT call TG.exitFullscreen() here — that would collapse the whole Mini App */
    if (gameLoadTimeout) { clearTimeout(gameLoadTimeout); gameLoadTimeout = null; }

    $('game-view').style.display = 'none';
    $('app').style.display = 'flex';
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}

    if (window.UI) { UI.renderRecent(); UI.renderFavorites(); }

    gameCloseCount++;
    updateNavigation();
  }

  function saveRecent(gameId) {
    var r = getLocal('recentGames', []);
    r = r.filter(function(id) { return id !== gameId; });
    r.unshift(gameId);
    if (r.length > 6) r = r.slice(0, 6);
    setLocal('recentGames', r);
  }

  /* === Modals === */
  function showModal(el) {
    TG.haptic.medium();
    playSound('click');
    el.style.display = 'flex';
    requestAnimationFrame(function() { requestAnimationFrame(function() { el.classList.add('active'); }); });
    updateNavigation();
  }

  function hideModal(el) {
    el.classList.remove('active');
    setTimeout(function() { el.style.display = 'none'; updateNavigation(); }, 350);
  }

  /* === Toast === */
  function showToast(icon, text) {
    playSound('notification');
    if (toastTimer) clearTimeout(toastTimer);
    $('toast-icon').textContent = icon || '🎉';
    $('toast-text').textContent = text;
    $('toast').classList.add('show');
    toastTimer = setTimeout(function() { $('toast').classList.remove('show'); }, 4000);
  }

  /* === Confetti === */
  var confCanvas = $('confetti-canvas');
  var confCtx = confCanvas ? confCanvas.getContext('2d') : null;
  var confParts = [];
  var confRunning = false;

  function resizeConfetti() { if (confCanvas) { confCanvas.width = window.innerWidth; confCanvas.height = window.innerHeight; } }
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);

  function fireConfetti(x, y) {
    if (!confCtx) return;
    var colors = ['#2E1065', '#4338CA', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA', '#C084FC', '#DDD6FE'];
    for (var i = 0; i < 40; i++) {
      var a = Math.random() * Math.PI * 2, spd = 3 + Math.random() * 6;
      confParts.push({ x: x, y: y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 3, size: 3 + Math.random() * 5, color: colors[Math.floor(Math.random() * colors.length)], rot: Math.random() * 360, rs: (Math.random() - 0.5) * 12, life: 1, decay: 0.012 + Math.random() * 0.015, shape: Math.random() > 0.5 ? 'r' : 'c' });
    }
    if (!confRunning) { confRunning = true; animConf(); }
  }

  function animConf() {
    if (confParts.length === 0) { confRunning = false; confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height); return; }
    confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
    for (var i = confParts.length - 1; i >= 0; i--) {
      var p = confParts[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.vx *= 0.99; p.rot += p.rs; p.life -= p.decay;
      if (p.life <= 0) { confParts.splice(i, 1); continue; }
      confCtx.save(); confCtx.globalAlpha = p.life; confCtx.translate(p.x, p.y); confCtx.rotate(p.rot * Math.PI / 180); confCtx.fillStyle = p.color;
      if (p.shape === 'r') confCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      else { confCtx.beginPath(); confCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2); confCtx.fill(); }
      confCtx.restore();
    }
    requestAnimationFrame(animConf);
  }

  /* === Splash === */
  function hideSplash() {
    var s = $('splash-screen');
    if (!s) return;
    s.classList.add('hide');
    setTimeout(function() { s.style.display = 'none'; }, 700);
  }

  /* === Admin Auth === */
  function tryOpenAdmin() {
    /* In Telegram: only owner ID can access */
    if (TG.isAvailable) {
      if (!isOwner()) {
        TG.haptic.error();
        return; /* Silent deny — no hint that admin exists */
      }
      isAdminAuthed = true;
      window.openAdminPanel();
      showAdminBtn();
      return;
    }
    /* In browser: password fallback for dev/testing */
    if (isAdminAuthed) { window.openAdminPanel(); showAdminBtn(); return; }
    var modal = $('modal-admin-pass');
    $('admin-pass-input').value = '';
    $('admin-pass-error').style.display = 'none';
    showModal(modal);
    setTimeout(function() { $('admin-pass-input').focus(); }, 400);
  }

  function showAdminBtn() { var b = $('btn-admin-profile'); if (b) b.style.display = ''; }

  function submitAdminPass() {
    if ($('admin-pass-input').value.trim() === ADMIN_PASS) {
      isAdminAuthed = true;
      try { sessionStorage.setItem('sh_admin', '1'); } catch (e) {}
      hideModal($('modal-admin-pass'));
      showAdminBtn();
      window.openAdminPanel();
    } else {
      $('admin-pass-error').style.display = '';
      TG.haptic.error();
      $('admin-pass-input').value = '';
    }
  }

  /* ============================================
     EXPOSE WINDOW API
     ============================================ */
  window.App = {
    $: $, openGame: openGame, closeGame: closeGame, openAffiliate: openAffiliate,
    haptic: function(style) { if (TG.haptic[style]) TG.haptic[style](); },
    playSound: playSound, switchTab: switchTab,
    showModal: showModal, hideModal: hideModal, showToast: showToast,
    fireConfetti: fireConfetti, escHtml: escHtml,
    getLocal: getLocal, setLocal: setLocal,
    getActiveTab: function() { return activeTab; },
    getSearchQuery: function() { return searchQuery; },
    getActiveFilter: function() { return activeFilter; },
    setActiveFilter: function(f) { activeFilter = f; }
  };

  window.appRefresh = function() { if (window.UI) UI.refreshAll(); };
  window.getUserFirstName = function() { return TG.userFirstName; };

  /* ============================================
     EVENT LISTENERS
     ============================================ */
  var navBtns = document.querySelectorAll('#bottom-nav .nav-btn');
  for (var i = 0; i < navBtns.length; i++) {
    (function(btn) { btn.addEventListener('click', function() { switchTab(btn.getAttribute('data-tab')); }); })(navBtns[i]);
  }

  $('cta-mid-banner').addEventListener('click', function() { switchTab('casinos'); });
  $('promo-timer').addEventListener('click', function() { TG.haptic.light(); openAffiliate(); });
  $('link-popular').addEventListener('click', function() { switchTab('games'); setTimeout(function() { if (window.UI) UI.setFilter('popular'); }, 50); });
  $('link-top').addEventListener('click', function() { switchTab('games'); setTimeout(function() { if (window.UI) UI.setFilter('top'); }, 50); });
  $('link-new').addEventListener('click', function() { switchTab('games'); setTimeout(function() { if (window.UI) UI.setFilter('new'); }, 50); });
  var linkCasinos = $('link-casinos');
  if (linkCasinos) linkCasinos.addEventListener('click', function() { switchTab('casinos'); });

  $('search-input').addEventListener('input', function() { searchQuery = this.value.trim(); if (window.UI) UI.renderGamesGrid(); });

  $('btn-currency').addEventListener('click', function() { TG.haptic.light(); $('currency-search').value = ''; if (window.UI) UI.renderCurrencyList(''); showModal($('modal-currency')); });

  /* Language button */
  var langBtn = $('btn-language');
  if (langBtn) langBtn.addEventListener('click', function() {
    TG.haptic.light();
    renderLanguageList();
    showModal($('modal-language'));
  });

  function renderLanguageList() {
    var list = $('language-list');
    if (!list || !window.I18n) return;
    list.innerHTML = '';
    var langs = I18n.getLangs();
    var cur = I18n.getLang();
    for (var i = 0; i < langs.length; i++) {
      var l = langs[i];
      var item = document.createElement('div');
      item.className = 'currency-item' + (l.code === cur ? ' selected' : '');
      item.innerHTML = '<span class="text-xl flex-shrink-0" style="width:32px;text-align:center;">' + l.flag + '</span>' +
        '<div style="flex:1;min-width:0;"><p style="font-weight:600;font-size:14px;color:var(--text-primary);">' + escHtml(l.nativeName) + '</p></div>' +
        (l.code === cur ? '<i class="fa-solid fa-check text-sm flex-shrink-0" style="color:var(--accent-green);margin-left:8px;"></i>' : '');
      (function(lang) {
        item.addEventListener('click', function() {
          TG.haptic.medium();
          I18n.setLang(lang.code);
          hideModal($('modal-language'));
          if (window.UI) UI.renderProfile();
          showToast('🌐', lang.nativeName);
        });
      })(l);
      list.appendChild(item);
    }
  }
  $('currency-search').addEventListener('input', function() { if (window.UI) UI.renderCurrencyList(this.value); });

  $('btn-admin-profile').addEventListener('click', function() { TG.haptic.medium(); tryOpenAdmin(); });

  /* Secret admin: 5 taps on logo (only works for owner or browser) */
  var logoEl = document.querySelector('.header-logo');
  if (logoEl) {
    logoEl.style.cursor = 'pointer';
    logoEl.addEventListener('click', function() {
      /* In TG: only owner can trigger */
      if (TG.isAvailable && !isOwner()) return;
      logoTapCount++;
      if (logoTapTimer) clearTimeout(logoTapTimer);
      logoTapTimer = setTimeout(function() { logoTapCount = 0; }, 2000);
      if (logoTapCount >= 5) { logoTapCount = 0; tryOpenAdmin(); }
    });
  }

  $('admin-pass-submit').addEventListener('click', submitAdminPass);
  $('admin-pass-input').addEventListener('keydown', function(e) { if (e.key === 'Enter') submitAdminPass(); });
  $('modal-admin-pass').addEventListener('click', function(e) { if (e.target === this) hideModal(this); });

  $('game-back-btn').addEventListener('click', closeGame);
  $('game-landscape-back').addEventListener('click', closeGame);
  $('game-fallback-btn').addEventListener('click', function() { if (currentGameUrl) TG.openLink(currentGameUrl); });

  /* Real play link — intercept for TG */
  var realPlayBtn = $('btn-real-play');
  if (realPlayBtn) {
    realPlayBtn.addEventListener('click', function(e) {
      if (TG.isAvailable) {
        e.preventDefault();
        TG.haptic.heavy();
        TG.openLink(this.href);
      }
    });
  }

  var closeBtns = document.querySelectorAll('.modal-close');
  for (var ci = 0; ci < closeBtns.length; ci++) {
    (function(btn) { btn.addEventListener('click', function() { var m = btn.closest('.modal-overlay'); if (m) hideModal(m); }); })(closeBtns[ci]);
  }

      $('modal-currency').addEventListener('click', function(e) { if (e.target === this) hideModal(this); });
    var mwheel = $('modal-wheel');
    if (mwheel) mwheel.addEventListener('click', function(e) { if (e.target === this) hideModal(this); });
    var mlang = $('modal-language');
    if (mlang) mlang.addEventListener('click', function(e) { if (e.target === this) hideModal(this); });
    $('toast').addEventListener('click', function() { openAffiliate(); });
  window.addEventListener('resize', function() { if (window.UI) UI.updateBannerPosition(); });
  window.addEventListener('popstate', function() { if ($('game-view').style.display !== 'none') closeGame(); });

  /* Sound toggle */
  var soundBtn = $('sound-toggle');
  if (soundBtn) soundBtn.addEventListener('click', function() {
    if (window.SoundFX) SoundFX.toggle();
  });

  /* === Init === */
  async function init() {
    if (window.SoundFX) SoundFX.init();
    if (window.ThemeManager) ThemeManager.init();
    if (window.I18n) I18n.init();
    if (window.Features) {
      Features.checkDailyLogin();
      Features.processIncomingReferral();
      setTimeout(function() { Features.checkPendingReferrals(); }, 2000);
    }

    /* Firebase: auto-connect for real-time friend activity */
    if (window.FirebaseService) {
      setTimeout(function() { FirebaseService.autoStart(); }, 3000);
    }
    await DataStore.init();
    await DataStore.trackSession();

    var badge = document.querySelector('#bottom-nav .badge-pulse');
    if (badge) badge.textContent = DataStore.getActiveCasinos().length || '';

    updateUserUI();

    /* Auto-auth admin by TG ID */
    if (isOwner()) {
      isAdminAuthed = true;
      showAdminBtn();
    }

    /* Hide modals initially */
    $('modal-currency').style.display = 'none';
    $('modal-admin-pass').style.display = 'none';
    var _mwheel = $('modal-wheel');
    if (_mwheel) _mwheel.style.display = 'none';
    var _mlang = $('modal-language');
    if (_mlang) _mlang.style.display = 'none';

    var firstName = TG.userFirstName;
    if (firstName) {
      var sub = document.querySelector('.splash-sub');
      if (sub) sub.textContent = 'Привет, ' + firstName + '! 👋';
    }

    /* Wait for UI module */
    function waitForUI(cb, retries) {
      if (window.UI) return cb();
      if (retries <= 0) { console.warn('UI module not loaded'); return cb(); }
      setTimeout(function() { waitForUI(cb, retries - 1); }, 50);
    }

    waitForUI(function() {
      if (window.UI) UI.initAll();
      setTimeout(hideSplash, 1200);
      updateNavigation();
    }, 60);
  }

  init();
});
