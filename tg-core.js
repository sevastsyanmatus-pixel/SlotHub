/**
 * TG Core v2.3 — ARTHOLST pattern with 3-level safe area protection
 * Direct _tgWebApp access, anti-swipe, aggressive fullscreen
 * Enhanced device detection for all screen sizes
 * DEBUG: Temporary overlay to diagnose safe area issues
 */
var TG = (function() {
  'use strict';

  var _tgWebApp = null;
  var backStack = [];
  var handlingBack = false;
  var mainBtnCb = null;

  /* Debug mode — set to true to see safe area overlay */
  var DEBUG_SAFE_AREA = true;

  /* ========================================
     LAZY DETECTION
     ======================================== */
  try {
    if (typeof window.Telegram !== 'undefined'
        && window.Telegram && window.Telegram.WebApp) {
      _tgWebApp = window.Telegram.WebApp;
    }
  } catch(e) {}

  function _ensureTgWebApp() {
    if (!_tgWebApp) {
      try {
        if (typeof window.Telegram !== 'undefined'
            && window.Telegram && window.Telegram.WebApp) {
          _tgWebApp = window.Telegram.WebApp;
        }
      } catch(e) {}
    }
    return _tgWebApp;
  }

  /* ========================================
     API OBJECT
     ======================================== */
  var api = {
    platform: 'browser',
    isIOS: false,
    isAndroid: false,
    isDesktop: false
  };

  Object.defineProperty(api, 'isAvailable', {
    get: function() { return !!_ensureTgWebApp(); }
  });

  api.versionAtLeast = function(v) {
    if (!_ensureTgWebApp()) return false;
    try { return _tgWebApp.isVersionAtLeast(String(v)); } catch(e) { return false; }
  };

  /* ========================================
     INIT
     ======================================== */
  api.init = function(options) {
    options = options || {};

    if (!_ensureTgWebApp()) {
      api._detectDevice();
      api._applyBrowserFallback();
      return api;
    }

    /* Ready */
    try { _tgWebApp.ready(); } catch(e) {}

    /* Colors */
    var hdr = options.headerColor || '#06080D';
    var bg = options.bgColor || hdr;
    var bot = options.bottomColor || hdr;
    try { _tgWebApp.setHeaderColor(hdr); } catch(e) {}
    try { _tgWebApp.setBackgroundColor(bg); } catch(e) {}
    try { _tgWebApp.setBottomBarColor(bot); } catch(e) {}

    /* Closing confirmation */
    if (options.closingConfirmation !== false) {
      try { _tgWebApp.enableClosingConfirmation(); } catch(e) {}
    }

    /* Back button */
    try {
      _tgWebApp.onEvent('backButtonClicked', _onBackPressed);
    } catch(e) {}

    /* Main button hide */
    try { _tgWebApp.MainButton.hide(); } catch(e) {}

    /* Theme */
    api._applyTheme();
    try {
      _tgWebApp.onEvent('themeChanged', function() {
        api._applyTheme();
        try { _tgWebApp.setHeaderColor(hdr); } catch(e) {}
        try { _tgWebApp.setBackgroundColor(bg); } catch(e) {}
      });
    } catch(e) {}

    /* Device detection */
    api._detectDevice();

    /* Mark HTML */
    document.documentElement.classList.add('tg-app');
    document.body.classList.add('is-telegram');

    /* === PREVENT TELEGRAM COLLAPSE (ARTHOLST PATTERN) === */
    _preventTelegramCollapse(options);

    return api;
  };

  /* ========================================
     ANTI-SWIPE & FULLSCREEN (ARTHOLST)
     ======================================== */
  function _preventTelegramCollapse(options) {
    if (!_tgWebApp) return;

    /* 1. Expand + disable swipes + fullscreen */
    try { _tgWebApp.expand(); } catch(e) {}
    try { _tgWebApp.disableVerticalSwipes(); } catch(e) {}
    try { _tgWebApp.requestFullscreen(); } catch(e) {}

    /* 2. CSS classes */
    document.documentElement.classList.add('tg-fullscreen');

    /* 3. Viewport height CSS variable */
    _updateViewportHeight();

    /* 4. Listen viewport changes */
    try {
      _tgWebApp.onEvent('viewportChanged', function() {
        try { _tgWebApp.expand(); } catch(e) {}
        try { _tgWebApp.disableVerticalSwipes(); } catch(e) {}
        _updateViewportHeight();
        _applyScreenClasses();
      });
    } catch(e) {}

    /* 5. Fullscreen change event */
    try {
      _tgWebApp.onEvent('fullscreenChanged', function() {
        document.documentElement.classList.toggle('tg-fullscreen', !!_tgWebApp.isFullscreen);
        /* Delay to let TG settle safe areas */
        setTimeout(_applySafeArea, 50);
        setTimeout(_applySafeArea, 200);
        setTimeout(_applySafeArea, 500);
        _updateViewportHeight();
        _applyScreenClasses();
      });
    } catch(e) {}

    /* 6. Safe area change events */
    try {
      _tgWebApp.onEvent('safeAreaChanged', function() { _applySafeArea(); });
      _tgWebApp.onEvent('contentSafeAreaChanged', function() { _applySafeArea(); });
    } catch(e) {}

    /* 7. ANTI-SWIPE: Block "pull down to close" gesture */
    var startY = 0;
    document.addEventListener('touchstart', function(e) {
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      var currentY = e.touches[0].clientY;
      var deltaY = currentY - startY;

      /* Only block downward swipe */
      if (deltaY < 5) return;

      /* Find scrollable parent */
      var scrollable = null;
      var el = e.target;
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.scrollHeight > el.clientHeight) {
          scrollable = el;
          break;
        }
        el = el.parentElement;
      }

      var scrollTop = scrollable
        ? scrollable.scrollTop
        : (window.pageYOffset || 0);

      /* If at top and pulling down — BLOCK */
      if (scrollTop <= 1 && deltaY > 5) {
        e.preventDefault();
      }
    }, { passive: false });

    /* 8. Retry expand + fullscreen every 400ms for first 6 seconds */
    var retryCount = 0;
    var retryInterval = setInterval(function() {
      retryCount++;
      try { _tgWebApp.expand(); } catch(e) {}
      try { _tgWebApp.disableVerticalSwipes(); } catch(e) {}
      try { _tgWebApp.requestFullscreen(); } catch(e) {}
      _applySafeArea();
      _updateViewportHeight();
      if (retryCount >= 15) clearInterval(retryInterval);
    }, 400);

    /* 9. On visibility change (return to app) */
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        try { _tgWebApp.expand(); } catch(e) {}
        try { _tgWebApp.disableVerticalSwipes(); } catch(e) {}
        try { _tgWebApp.requestFullscreen(); } catch(e) {}
        _applySafeArea();
        _updateViewportHeight();
      }
    });

    /* 10. On focus */
    window.addEventListener('focus', function() {
      try { _tgWebApp.expand(); } catch(e) {}
      try { _tgWebApp.requestFullscreen(); } catch(e) {}
    });

    /* 11. On first touch — some TG versions need gesture for fullscreen */
    var _firstTouch = function() {
      try { _tgWebApp.expand(); } catch(e) {}
      try { _tgWebApp.requestFullscreen(); } catch(e) {}
      document.removeEventListener('touchstart', _firstTouch);
    };
    document.addEventListener('touchstart', _firstTouch, { passive: true });

    /* 12. Apply safe areas immediately + delayed insurance */
    _applySafeArea();
    setTimeout(_applySafeArea, 100);
    setTimeout(_applySafeArea, 300);
    setTimeout(_applySafeArea, 600);
    setTimeout(_applySafeArea, 1000);
    setTimeout(_applySafeArea, 2000);
    setTimeout(_applySafeArea, 4000);
  }

  function _updateViewportHeight() {
    if (!_tgWebApp) return;
    var h = (_tgWebApp.viewportHeight || window.innerHeight) + 'px';
    var sh = (_tgWebApp.viewportStableHeight || window.innerHeight) + 'px';
    document.documentElement.style.setProperty('--tg-viewport-height', h);
    document.documentElement.style.setProperty('--tg-viewport-stable-height', sh);
  }

  /* ========================================
     SAFE AREA — 3-LEVEL ARTHOLST PROTECTION
     ======================================== */
  function _applySafeArea() {
    var root = document.documentElement;
    if (!_tgWebApp) return;

    try {
      var sa = _tgWebApp.safeAreaInset || {};
      var csa = _tgWebApp.contentSafeAreaInset || {};
      var isFullscreen = !!_tgWebApp.isFullscreen;

      /* ============================
         LAYER 1: DEVICE INSET (notch, Dynamic Island, status bar)
         ============================ */
      var deviceTop = sa.top || 0;
      var deviceBottom = sa.bottom || 0;
      var deviceLeft = sa.left || 0;
      var deviceRight = sa.right || 0;

      root.style.setProperty('--tg-safe-top', deviceTop + 'px');
      root.style.setProperty('--tg-safe-bottom', deviceBottom + 'px');
      root.style.setProperty('--tg-safe-left', deviceLeft + 'px');
      root.style.setProperty('--tg-safe-right', deviceRight + 'px');

      /* ============================
         LAYER 2: CONTENT SAFE AREA (below Telegram buttons: back, dots, close)
         ============================ */
      var contentTop = csa.top || 0;
      var contentBottom = csa.bottom || 0;

      root.style.setProperty('--tg-content-safe-bottom', contentBottom + 'px');
      root.style.setProperty('--tg-content-safe-left', (csa.left || 0) + 'px');
      root.style.setProperty('--tg-content-safe-right', (csa.right || 0) + 'px');

      /* ============================
         LAYER 3: FALLBACKS FOR FULLSCREEN
         In fullscreen mode, TG buttons (back, close, dots) are drawn
         ON TOP of our content. contentSafeAreaInset.top may be 0
         on some devices even in fullscreen — this is a Telegram API bug.
         We guarantee a minimum safe offset.
         ============================ */
      var finalTop = contentTop;

      if (isFullscreen) {
        /* Minimum: deviceTop (notch) + 12px buffer
           OR 44px (minimum height of TG overlay buttons)
           Whichever is larger */
        var minFullscreenTop = Math.max(deviceTop + 12, 44);
        finalTop = Math.max(contentTop, minFullscreenTop);
      } else if (contentTop === 0 && deviceTop === 0) {
        /* NOT fullscreen, API gave no data at all.
           Estimate native Telegram header height */
        var isIOS = api.isIOS || /iPad|iPhone|iPod/.test(navigator.userAgent || '');
        finalTop = isIOS ? 56 : 48;
      } else if (contentTop === 0 && deviceTop > 0) {
        /* Has device inset but no content inset —
           TG header is likely present but API didn't report it.
           Use safe default */
        finalTop = Math.max(deviceTop + 12, 48);
      }

      /* ============================
         FINAL: Set CSS variables
         ============================ */
      root.style.setProperty('--tg-content-safe-top', finalTop + 'px');

      /* Combined top offset — used by all UI elements */
      root.style.setProperty('--top-offset', finalTop + 'px');

      /* ============================
         DETECT DEVICE FEATURES from safe area
         ============================ */
      var body = document.body;
      if (deviceTop >= 55) {
        body.classList.add('has-dynamic-island');
        body.classList.remove('has-notch');
      } else if (deviceTop >= 44) {
        body.classList.add('has-notch');
        body.classList.remove('has-dynamic-island');
      }

      /* ============================
         DEBUG OVERLAY
         ============================ */
      if (DEBUG_SAFE_AREA) {
        _updateDebugOverlay({
          deviceTop: deviceTop,
          deviceBottom: deviceBottom,
          contentTopRaw: csa.top || 0,
          contentTop: finalTop,
          isFullscreen: isFullscreen,
          viewportH: _tgWebApp.viewportHeight || 0,
          stableH: _tgWebApp.viewportStableHeight || 0,
          platform: _tgWebApp.platform || '?',
          version: _tgWebApp.version || '?'
        });
      }

    } catch(e) {
      /* Ultimate fallback — 54px is safe for most devices */
      root.style.setProperty('--tg-content-safe-top', '54px');
      root.style.setProperty('--top-offset', '54px');
      console.error('[TG SafeArea] Error:', e);
    }
  }

  /* ========================================
     DEBUG OVERLAY — shows safe area values on screen
     ======================================== */
  function _updateDebugOverlay(data) {
    var el = document.getElementById('tg-debug-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tg-debug-overlay';
      el.style.cssText = 'position:fixed;bottom:90px;left:8px;z-index:99999;' +
        'background:rgba(0,0,0,0.85);color:#0f0;font-size:10px;font-family:monospace;' +
        'padding:8px 10px;border-radius:8px;border:1px solid #0f0;line-height:1.5;' +
        'pointer-events:none;max-width:260px;word-break:break-all;';
      document.body.appendChild(el);
    }
    el.innerHTML =
      '<b style="color:#ff0;">TG Safe Area Debug</b><br>' +
      'platform: <b>' + data.platform + '</b> v' + data.version + '<br>' +
      'fullscreen: <b style="color:' + (data.isFullscreen ? '#0f0' : '#f00') + '">' + data.isFullscreen + '</b><br>' +
      'sa.top (device/notch): <b>' + data.deviceTop + 'px</b><br>' +
      'sa.bottom (device): <b>' + data.deviceBottom + 'px</b><br>' +
      'csa.top (raw from API): <b>' + data.contentTopRaw + 'px</b><br>' +
      '--top-offset (final): <b style="color:#ff0;">' + data.contentTop + 'px</b><br>' +
      'viewport: ' + data.viewportH + ' / stable: ' + data.stableH + '<br>' +
      'window.innerH: ' + window.innerHeight;
  }

  /* ========================================
     DEVICE DETECTION (Enhanced)
     ======================================== */
  api._detectDevice = function() {
    var ua = navigator.userAgent || '';
    var p = 'desktop';

    if (_tgWebApp && _tgWebApp.platform) {
      var tp = _tgWebApp.platform.toLowerCase();
      if (tp === 'ios' || tp === 'macos') p = 'ios';
      else if (tp === 'android') p = 'android';
      else if (tp === 'tdesktop' || tp === 'web' || tp === 'weba') p = 'desktop';
    } else {
      if (/iPhone|iPad|iPod/i.test(ua)) p = 'ios';
      else if (/Android/i.test(ua)) p = 'android';
    }

    api.platform = p;
    api.isIOS = (p === 'ios');
    api.isAndroid = (p === 'android');
    api.isDesktop = (p === 'desktop');

    var root = document.documentElement;
    var body = document.body;
    root.setAttribute('data-platform', p);

    /* Platform class */
    body.classList.add('device-' + p);

    /* Screen size classes */
    _applyScreenClasses();

    /* Pixel ratio */
    var dpr = window.devicePixelRatio || 1;
    if (dpr >= 2) body.classList.add('is-retina');
    root.style.setProperty('--dpr', String(dpr));

    /* Tablet detection */
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (Math.min(w, h) >= 600) body.classList.add('is-tablet');

    /* iOS specific */
    if (p === 'ios') {
      /* iPhone SE — small screen */
      if (w <= 375 && h <= 667) body.classList.add('is-iphone-se');
      /* Notch detection via screen height (before safe area data arrives) */
      if (h >= 812 && w <= 430) body.classList.add('has-notch');
    }

    /* Android specific */
    if (p === 'android') {
      /* Detect Android small bar phones */
      if (h >= 700 && w <= 400) body.classList.add('android-tall');
    }

    /* Listen for resize and orientation */
    window.addEventListener('resize', function() {
      _applyScreenClasses();
      root.style.setProperty('--screen-w', window.innerWidth + 'px');
      root.style.setProperty('--screen-h', window.innerHeight + 'px');
    });

    if (window.screen && window.screen.orientation) {
      try {
        window.screen.orientation.addEventListener('change', function() {
          setTimeout(_applyScreenClasses, 100);
        });
      } catch(e) {}
    }
  };

  /* Screen size classes — runs on resize */
  function _applyScreenClasses() {
    var body = document.body;
    var root = document.documentElement;
    var w = window.innerWidth;
    var h = window.innerHeight;

    /* Remove old width classes */
    body.classList.remove('screen-xs', 'screen-sm', 'screen-md', 'screen-lg', 'screen-xl', 'screen-xxl');
    /* Remove old height classes */
    body.classList.remove('screen-short', 'screen-medium', 'screen-tall');
    /* Remove tablet */
    body.classList.remove('is-tablet');

    /* Width breakpoints */
    if (w <= 360)      body.classList.add('screen-xs');   /* iPhone SE, Galaxy S small */
    else if (w <= 389) body.classList.add('screen-sm');   /* iPhone 12 mini, Pixel 5 */
    else if (w <= 413) body.classList.add('screen-md');   /* iPhone 14, Pixel 7 */
    else if (w <= 479) body.classList.add('screen-lg');   /* iPhone Plus/Max, Galaxy S Ultra */
    else if (w <= 767) body.classList.add('screen-xl');   /* Large phones landscape, small tablets */
    else               body.classList.add('screen-xxl');  /* Tablets, desktop */

    /* Height breakpoints */
    if (h <= 667)      body.classList.add('screen-short');   /* iPhone SE, short phones */
    else if (h <= 811) body.classList.add('screen-medium');  /* iPhone 12 mini, older iPhones */
    else               body.classList.add('screen-tall');    /* Modern tall phones */

    /* Tablet (re-check on resize) */
    if (Math.min(w, h) >= 600) body.classList.add('is-tablet');

    /* CSS custom properties */
    root.style.setProperty('--screen-w', w + 'px');
    root.style.setProperty('--screen-h', h + 'px');

    /* Dynamic columns for game grid */
    var cols = 2;
    if (w >= 1200) cols = 5;
    else if (w >= 900) cols = 4;
    else if (w >= 600) cols = 3;
    else if (w >= 480) cols = 3;
    root.style.setProperty('--grid-cols', String(cols));
  }

  /* ========================================
     THEME
     ======================================== */
  api._applyTheme = function() {
    var root = document.documentElement;
    if (!_tgWebApp) return;
    var tp = _tgWebApp.themeParams || {};

    var vars = {
      '--tg-bg': tp.bg_color || '#1a1a2e',
      '--tg-text': tp.text_color || '#ffffff',
      '--tg-hint': tp.hint_color || '#999999',
      '--tg-link': tp.link_color || '#5eadff',
      '--tg-button': tp.button_color || '#5eadff',
      '--tg-button-text': tp.button_text_color || '#ffffff',
      '--tg-secondary-bg': tp.secondary_bg_color || '#131320',
      '--tg-header-bg': tp.header_bg_color || '#0a0a1a',
      '--tg-section-bg': tp.section_bg_color || '#1a1a2e',
      '--tg-destructive': tp.destructive_text_color || '#ff3b30',
      '--tg-accent': tp.accent_text_color || tp.link_color || '#5eadff'
    };

    for (var k in vars) root.style.setProperty(k, vars[k]);
    root.setAttribute('data-theme', 'dark');
  };

  /* ========================================
     HAPTIC FEEDBACK
     ======================================== */
  api.haptic = {
    light:   function() { if (!_ensureTgWebApp()) return; try { _tgWebApp.HapticFeedback.impactOccurred('light'); } catch(e) {} },
    medium:  function() { if (!_ensureTgWebApp()) return; try { _tgWebApp.HapticFeedback.impactOccurred('medium'); } catch(e) {} },
    heavy:   function() { if (!_ensureTgWebApp()) return; try { _tgWebApp.HapticFeedback.impactOccurred('heavy'); } catch(e) {} },
    rigid:   function() { if (!_ensureTgWebApp()) return; try { _tgWebApp.HapticFeedback.impactOccurred('rigid'); } catch(e) {} },
    soft:    function() { if (!_ensureTgWebApp()) return; try { _tgWebApp.HapticFeedback.impactOccurred('soft'); } catch(e) {} },
    success: function() { if (!_ensureTgWebApp()) return; try { _tgWebApp.HapticFeedback.notificationOccurred('success'); } catch(e) {} },
    warning: function() { if (!_ensureTgWebApp()) return; try { _tgWebApp.HapticFeedback.notificationOccurred('warning'); } catch(e) {} },
    error:   function() { if (!_ensureTgWebApp()) return; try { _tgWebApp.HapticFeedback.notificationOccurred('error'); } catch(e) {} },
    select:  function() { if (!_ensureTgWebApp()) return; try { _tgWebApp.HapticFeedback.selectionChanged(); } catch(e) {} }
  };

  /* ========================================
     BACK BUTTON (Stack)
     ======================================== */
  function _onBackPressed() {
    if (backStack.length > 0) {
      handlingBack = true;
      var cb = backStack.pop();
      _syncBackBtn();
      try { cb(); } catch (e) { console.error('[TG] Back handler error:', e); }
      handlingBack = false;
    }
  }

  function _syncBackBtn() {
    if (!_tgWebApp) return;
    try {
      backStack.length > 0 ? _tgWebApp.BackButton.show() : _tgWebApp.BackButton.hide();
    } catch(e) {}
  }

  api.showBack = function(callback) {
    if (typeof callback === 'function') backStack.push(callback);
    _syncBackBtn();
  };

  api.popBack = function() {
    if (handlingBack) return;
    if (backStack.length > 0) backStack.pop();
    _syncBackBtn();
  };

  api.hideBack = function() {
    backStack = [];
    _syncBackBtn();
  };

  api.getBackStackSize = function() {
    return backStack.length;
  };

  /* ========================================
     MAIN BUTTON
     ======================================== */
  api.showMainButton = function(text, callback, options) {
    if (!_ensureTgWebApp()) return;
    options = options || {};
    try {
      if (mainBtnCb) _tgWebApp.MainButton.offClick(mainBtnCb);
      mainBtnCb = callback;
      var mb = _tgWebApp.MainButton;
      mb.setText(text);
      if (options.color) mb.color = options.color;
      if (options.textColor) mb.textColor = options.textColor;
      if (options.disabled) mb.disable(); else mb.enable();
      if (callback) mb.onClick(callback);
      mb.show();
    } catch(e) {}
  };

  api.hideMainButton = function() {
    if (!_ensureTgWebApp()) return;
    try {
      if (mainBtnCb) _tgWebApp.MainButton.offClick(mainBtnCb);
      mainBtnCb = null;
      _tgWebApp.MainButton.hide();
    } catch(e) {}
  };

  /* ========================================
     POPUPS
     ======================================== */
  api.popup = function(title, message, buttons) {
    if (_ensureTgWebApp()) {
      return new Promise(function(resolve) {
        try {
          _tgWebApp.showPopup({
            title: title || '',
            message: message,
            buttons: buttons || [{ type: 'ok' }]
          }, function(id) { resolve(id); });
        } catch(e) { alert(message); resolve('ok'); }
      });
    }
    alert((title ? title + '\n' : '') + message);
    return Promise.resolve('ok');
  };

  api.confirm = function(message) {
    if (_ensureTgWebApp()) {
      return new Promise(function(resolve) {
        try {
          _tgWebApp.showConfirm(message, function(ok) { resolve(!!ok); });
        } catch(e) { resolve(confirm(message)); }
      });
    }
    return Promise.resolve(confirm(message));
  };

  api.alert = function(message) {
    if (_ensureTgWebApp()) {
      return new Promise(function(resolve) {
        try {
          _tgWebApp.showAlert(message, function() { resolve(); });
        } catch(e) { alert(message); resolve(); }
      });
    }
    alert(message);
    return Promise.resolve();
  };

  /* ========================================
     LINKS
     ======================================== */
  api.openLink = function(url, options) {
    if (!url) return;
    options = options || {};
    if (_ensureTgWebApp()) {
      try {
        _tgWebApp.openLink(url, { try_instant_view: !!options.tryInstantView });
        return;
      } catch(e) {}
    }
    window.open(url, '_blank');
  };

  api.openTelegramLink = function(url) {
    if (!url) return;
    if (_ensureTgWebApp()) {
      try { _tgWebApp.openTelegramLink(url); return; } catch(e) {}
    }
    window.open(url, '_blank');
  };

  /* ========================================
     USER DATA
     ======================================== */
  Object.defineProperty(api, 'user', {
    get: function() {
      if (!_ensureTgWebApp()) return null;
      return (_tgWebApp.initDataUnsafe && _tgWebApp.initDataUnsafe.user) ? _tgWebApp.initDataUnsafe.user : null;
    }
  });

  Object.defineProperty(api, 'userId', {
    get: function() { var u = api.user; return u ? u.id : null; }
  });

  Object.defineProperty(api, 'userName', {
    get: function() {
      var u = api.user;
      if (!u) return 'Guest';
      return (u.first_name || '') + (u.last_name ? ' ' + u.last_name : '');
    }
  });

  Object.defineProperty(api, 'userFirstName', {
    get: function() { var u = api.user; return u ? (u.first_name || '') : ''; }
  });

  Object.defineProperty(api, 'userUsername', {
    get: function() { var u = api.user; return u ? (u.username || null) : null; }
  });

  Object.defineProperty(api, 'userLang', {
    get: function() {
      var u = api.user;
      if (u && u.language_code) return u.language_code;
      return (navigator.language || 'en').split('-')[0];
    }
  });

  Object.defineProperty(api, 'isPremium', {
    get: function() { var u = api.user; return u ? !!u.is_premium : false; }
  });

  Object.defineProperty(api, 'initData', {
    get: function() { return _tgWebApp ? (_tgWebApp.initData || '') : ''; }
  });

  Object.defineProperty(api, 'isFullscreen', {
    get: function() { return _tgWebApp ? !!_tgWebApp.isFullscreen : false; }
  });

  /* ========================================
     UTILITIES
     ======================================== */
  api.close = function() {
    if (_ensureTgWebApp()) { try { _tgWebApp.close(); } catch(e) {} }
    else window.close();
  };

  api.sendData = function(data) {
    if (!_ensureTgWebApp()) return;
    var str = typeof data === 'string' ? data : JSON.stringify(data);
    try { _tgWebApp.sendData(str); } catch(e) {}
  };

  api.requestFullscreen = function() {
    if (_ensureTgWebApp()) { try { _tgWebApp.requestFullscreen(); } catch(e) {} }
  };

  api.exitFullscreen = function() {
    if (_ensureTgWebApp()) { try { _tgWebApp.exitFullscreen(); } catch(e) {} }
  };

  /* ========================================
     BROWSER FALLBACK
     ======================================== */
  api._applyBrowserFallback = function() {
    var root = document.documentElement;

    var defaults = {
      '--tg-bg': '#1a1a2e', '--tg-text': '#ffffff', '--tg-hint': '#999999',
      '--tg-link': '#5eadff', '--tg-button': '#5eadff', '--tg-button-text': '#ffffff',
      '--tg-secondary-bg': '#131320', '--tg-header-bg': '#0a0a1a',
      '--tg-section-bg': '#1a1a2e', '--tg-destructive': '#ff3b30',
      '--tg-accent': '#5eadff',
      '--tg-viewport-height': window.innerHeight + 'px',
      '--tg-viewport-stable-height': window.innerHeight + 'px',
      '--tg-safe-top': '0px', '--tg-safe-bottom': '0px',
      '--tg-safe-left': '0px', '--tg-safe-right': '0px',
      '--tg-content-safe-top': '0px', '--tg-content-safe-bottom': '0px',
      '--tg-content-safe-left': '0px', '--tg-content-safe-right': '0px',
      '--top-offset': '0px'
    };

    for (var k in defaults) root.style.setProperty(k, defaults[k]);

    root.setAttribute('data-theme', 'dark');
    root.setAttribute('data-platform', 'browser');
    document.body.classList.add('device-browser');

    window.addEventListener('resize', function() {
      root.style.setProperty('--tg-viewport-height', window.innerHeight + 'px');
      root.style.setProperty('--tg-viewport-stable-height', window.innerHeight + 'px');
    });
  };

  return api;
})();
