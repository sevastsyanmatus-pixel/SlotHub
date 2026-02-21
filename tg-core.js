/**
 * TG Core v1.0 — Universal Telegram Mini App API Wrapper
 * Works in Telegram WebApp and falls back gracefully in browser.
 */
var TG = (function() {
  'use strict';

  var webapp = null;
  var ver = 0;
  var backStack = [];
  var handlingBack = false;
  var mainBtnCb = null;

  var api = {
    platform: 'browser',
    isIOS: false,
    isAndroid: false,
    isDesktop: false
  };

  /* ========================================
     CORE
     ======================================== */

  Object.defineProperty(api, 'isAvailable', {
    get: function() { return !!webapp; }
  });

  api.versionAtLeast = function(v) {
    return ver >= parseFloat(v);
  };

  api._safeCall = function(fn, fallback) {
    try { return fn(); }
    catch (e) {
      if (fallback !== undefined) return typeof fallback === 'function' ? fallback() : fallback;
    }
  };

  /* ========================================
     INIT
     ======================================== */

  api.init = function(options) {
    options = options || {};

    if (window.Telegram && window.Telegram.WebApp) {
      webapp = window.Telegram.WebApp;
      ver = parseFloat(webapp.version) || 0;

      api._safeCall(function() { webapp.ready(); });
      api._safeCall(function() { webapp.expand(); });

      /* Colors */
      var hdr = options.headerColor || '#0a0a1a';
      var bg = options.bgColor || hdr;
      var bot = options.bottomColor || hdr;

      if (api.versionAtLeast(6.1)) {
        api._safeCall(function() { webapp.setHeaderColor(hdr); });
        api._safeCall(function() { webapp.setBackgroundColor(bg); });
      }
      if (api.versionAtLeast(7.10)) {
        api._safeCall(function() { webapp.setBottomBarColor(bot); });
      }

      /* Disable swipe close */
      if (options.disableSwipeClose !== false && api.versionAtLeast(7.7)) {
        api._safeCall(function() { webapp.disableVerticalSwipes(); });
      }

      /* Closing confirmation */
      if (options.closingConfirmation !== false && api.versionAtLeast(6.1)) {
        api._safeCall(function() { webapp.enableClosingConfirmation(); });
      }

      /* Fullscreen */
      if (options.fullscreen !== false) {
        api.requestFullscreen();
        setTimeout(function() { api.requestFullscreen(); }, 500);
        setTimeout(function() { api.requestFullscreen(); }, 1500);
      }

      /* Theme */
      api._applyTheme();
      api._safeCall(function() {
        webapp.onEvent('themeChanged', function() {
          api._applyTheme();
          if (hdr) api._safeCall(function() { webapp.setHeaderColor(hdr); });
          if (bg) api._safeCall(function() { webapp.setBackgroundColor(bg); });
        });
      });

      /* Viewport */
      api._applyViewport();
      api._safeCall(function() {
        webapp.onEvent('viewportChanged', function() {
          api._applyViewport();
          api.requestFullscreen();
        });
      });

      /* Safe area */
      api._applySafeArea();
      setTimeout(function() { api._applySafeArea(); }, 600);
      setTimeout(function() { api._applySafeArea(); }, 2000);

      /* Fullscreen change → re-apply safe areas */
      api._safeCall(function() {
        webapp.onEvent('fullscreenChanged', function() {
          setTimeout(function() { api._applySafeArea(); api._applyViewport(); }, 100);
          setTimeout(function() { api._applySafeArea(); api._applyViewport(); }, 500);
        });
      });

      /* Back button */
      api._safeCall(function() {
        webapp.onEvent('backButtonClicked', _onBackPressed);
      });

      /* Main button hide by default */
      api._safeCall(function() { webapp.MainButton.hide(); });

      /* Device & platform */
      api._detectDevice();

      /* Mark HTML */
      document.documentElement.classList.add('tg-app');

    } else {
      api._applyBrowserFallback();
    }

    return api;
  };

  /* ========================================
     THEME & COLORS
     ======================================== */

  api._applyTheme = function() {
    var root = document.documentElement;
    var tp = (webapp && webapp.themeParams) ? webapp.themeParams : {};

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
      '--tg-section-header': tp.section_header_text_color || '#999999',
      '--tg-subtitle': tp.subtitle_text_color || '#999999',
      '--tg-destructive': tp.destructive_text_color || '#ff3b30',
      '--tg-accent': tp.accent_text_color || tp.link_color || '#5eadff'
    };

    for (var k in vars) root.style.setProperty(k, vars[k]);

    /* Light or dark */
    var hex = (vars['--tg-bg'] || '#000').replace('#', '');
    var r = parseInt(hex.substr(0, 2), 16) || 0;
    var g = parseInt(hex.substr(2, 2), 16) || 0;
    var b = parseInt(hex.substr(4, 2), 16) || 0;
    var brightness = (r * 299 + g * 587 + b * 114) / 1000;
    root.setAttribute('data-theme', brightness > 128 ? 'light' : 'dark');
  };

  api.setColors = function(bg, header, bottom) {
    if (!webapp) return;
    if (bg && api.versionAtLeast(6.1)) api._safeCall(function() { webapp.setBackgroundColor(bg); });
    if (header && api.versionAtLeast(6.1)) api._safeCall(function() { webapp.setHeaderColor(header); });
    if (bottom && api.versionAtLeast(7.10)) api._safeCall(function() { webapp.setBottomBarColor(bottom); });
  };

  /* ========================================
     VIEWPORT
     ======================================== */

  api._applyViewport = function() {
    var root = document.documentElement;
    if (webapp) {
      root.style.setProperty('--tg-viewport-height', (webapp.viewportHeight || window.innerHeight) + 'px');
      root.style.setProperty('--tg-viewport-stable-height', (webapp.viewportStableHeight || window.innerHeight) + 'px');
      root.style.setProperty('--tg-is-expanded', webapp.isExpanded ? '1' : '0');
    } else {
      root.style.setProperty('--tg-viewport-height', window.innerHeight + 'px');
      root.style.setProperty('--tg-viewport-stable-height', window.innerHeight + 'px');
      root.style.setProperty('--tg-is-expanded', '1');
    }
  };

  /* ========================================
     SAFE AREA
     ======================================== */

  api._applySafeArea = function() {
    var root = document.documentElement;

    if (webapp && api.versionAtLeast(7.7)) {
      var sa = webapp.safeAreaInset || {};
      var csa = webapp.contentSafeAreaInset || {};

      root.style.setProperty('--tg-safe-top', Math.min(sa.top || 0, 80) + 'px');
      root.style.setProperty('--tg-safe-bottom', Math.min(sa.bottom || 0, 50) + 'px');
      root.style.setProperty('--tg-safe-left', (sa.left || 0) + 'px');
      root.style.setProperty('--tg-safe-right', (sa.right || 0) + 'px');

      root.style.setProperty('--tg-content-safe-top', Math.min(csa.top || 0, 80) + 'px');
      root.style.setProperty('--tg-content-safe-bottom', (csa.bottom || 0) + 'px');
      root.style.setProperty('--tg-content-safe-left', (csa.left || 0) + 'px');
      root.style.setProperty('--tg-content-safe-right', (csa.right || 0) + 'px');
    } else {
      var z = '0px';
      var props = ['--tg-safe-top','--tg-safe-bottom','--tg-safe-left','--tg-safe-right',
                   '--tg-content-safe-top','--tg-content-safe-bottom','--tg-content-safe-left','--tg-content-safe-right'];
      for (var i = 0; i < props.length; i++) root.style.setProperty(props[i], z);
    }
  };

  /* ========================================
     DEVICE DETECTION
     ======================================== */

  api._detectDevice = function() {
    var ua = navigator.userAgent || '';
    var p = 'desktop';

    if (webapp && webapp.platform) {
      var tp = webapp.platform.toLowerCase();
      if (tp === 'ios' || tp === 'macos') p = 'ios';
      else if (tp === 'android') p = 'android';
      else if (tp === 'tdesktop' || tp === 'web' || tp === 'weba') p = 'desktop';
    } else {
      if (/iPhone|iPad|iPod/i.test(ua)) p = 'ios';
      else if (/Android/i.test(ua)) p = 'android';
    }

    if (!webapp) p = 'browser';

    api.platform = p;
    api.isIOS = (p === 'ios');
    api.isAndroid = (p === 'android');
    api.isDesktop = (p === 'desktop');

    document.documentElement.setAttribute('data-platform', p);
  };

  /* ========================================
     HAPTIC FEEDBACK
     ======================================== */

  api.haptic = {
    light:   function() { api._safeCall(function() { webapp.HapticFeedback.impactOccurred('light'); }); },
    medium:  function() { api._safeCall(function() { webapp.HapticFeedback.impactOccurred('medium'); }); },
    heavy:   function() { api._safeCall(function() { webapp.HapticFeedback.impactOccurred('heavy'); }); },
    rigid:   function() { api._safeCall(function() { webapp.HapticFeedback.impactOccurred('rigid'); }); },
    soft:    function() { api._safeCall(function() { webapp.HapticFeedback.impactOccurred('soft'); }); },
    success: function() { api._safeCall(function() { webapp.HapticFeedback.notificationOccurred('success'); }); },
    warning: function() { api._safeCall(function() { webapp.HapticFeedback.notificationOccurred('warning'); }); },
    error:   function() { api._safeCall(function() { webapp.HapticFeedback.notificationOccurred('error'); }); },
    select:  function() { api._safeCall(function() { webapp.HapticFeedback.selectionChanged(); }); }
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
    if (!webapp) return;
    api._safeCall(function() {
      backStack.length > 0 ? webapp.BackButton.show() : webapp.BackButton.hide();
    });
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
    if (!webapp) return;
    options = options || {};

    if (mainBtnCb) api._safeCall(function() { webapp.MainButton.offClick(mainBtnCb); });
    mainBtnCb = callback;

    api._safeCall(function() {
      var mb = webapp.MainButton;
      mb.setText(text);
      if (options.color) mb.color = options.color;
      if (options.textColor) mb.textColor = options.textColor;
      if (options.disabled) mb.disable(); else mb.enable();
      if (callback) mb.onClick(callback);
      mb.show();
    });
  };

  api.hideMainButton = function() {
    if (!webapp) return;
    api._safeCall(function() {
      if (mainBtnCb) webapp.MainButton.offClick(mainBtnCb);
      mainBtnCb = null;
      webapp.MainButton.hide();
    });
  };

  api.mainButtonLoading = function(show) {
    if (!webapp) return;
    api._safeCall(function() {
      show !== false ? webapp.MainButton.showProgress() : webapp.MainButton.hideProgress();
    });
  };

  /* ========================================
     POPUPS
     ======================================== */

  api.popup = function(title, message, buttons) {
    if (webapp && api.versionAtLeast(6.2)) {
      return new Promise(function(resolve) {
        api._safeCall(function() {
          webapp.showPopup({
            title: title || '',
            message: message,
            buttons: buttons || [{ type: 'ok' }]
          }, function(id) { resolve(id); });
        }, function() { alert(message); resolve('ok'); });
      });
    }
    alert((title ? title + '\n' : '') + message);
    return Promise.resolve('ok');
  };

  api.confirm = function(message) {
    if (webapp && api.versionAtLeast(6.2)) {
      return new Promise(function(resolve) {
        api._safeCall(function() {
          webapp.showConfirm(message, function(ok) { resolve(!!ok); });
        }, function() { resolve(confirm(message)); });
      });
    }
    return Promise.resolve(confirm(message));
  };

  api.alert = function(message) {
    if (webapp && api.versionAtLeast(6.2)) {
      return new Promise(function(resolve) {
        api._safeCall(function() {
          webapp.showAlert(message, function() { resolve(); });
        }, function() { alert(message); resolve(); });
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
    if (webapp) {
      api._safeCall(function() {
        webapp.openLink(url, { try_instant_view: !!options.tryInstantView });
      }, function() { window.open(url, '_blank'); });
    } else {
      window.open(url, '_blank');
    }
  };

  api.openTelegramLink = function(url) {
    if (!url) return;
    if (webapp) {
      api._safeCall(function() { webapp.openTelegramLink(url); },
                     function() { window.open(url, '_blank'); });
    } else {
      window.open(url, '_blank');
    }
  };

  /* ========================================
     CLOUD STORAGE
     ======================================== */

  function _lsKey(k) { return 'tg_' + k; }

  function _lsKeys() {
    var res = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('tg_') === 0) res.push(k.substr(3));
      }
    } catch (e) {}
    return res;
  }

  api.storage = {
    set: function(key, value) {
      var str = typeof value === 'string' ? value : JSON.stringify(value);
      if (webapp && webapp.CloudStorage && api.versionAtLeast(6.9)) {
        return new Promise(function(resolve) {
          api._safeCall(function() {
            webapp.CloudStorage.setItem(key, str, function(err) { resolve(!err); });
          }, function() {
            try { localStorage.setItem(_lsKey(key), str); resolve(true); } catch (e) { resolve(false); }
          });
        });
      }
      try { localStorage.setItem(_lsKey(key), str); return Promise.resolve(true); }
      catch (e) { return Promise.resolve(false); }
    },

    get: function(key, defaultValue) {
      if (webapp && webapp.CloudStorage && api.versionAtLeast(6.9)) {
        return new Promise(function(resolve) {
          api._safeCall(function() {
            webapp.CloudStorage.getItem(key, function(err, val) {
              if (err || val === null || val === undefined || val === '') return resolve(defaultValue);
              try { resolve(JSON.parse(val)); } catch (e) { resolve(val); }
            });
          }, function() {
            _lsGet(key, defaultValue, resolve);
          });
        });
      }
      return new Promise(function(resolve) { _lsGet(key, defaultValue, resolve); });
    },

    remove: function(key) {
      if (webapp && webapp.CloudStorage && api.versionAtLeast(6.9)) {
        return new Promise(function(resolve) {
          api._safeCall(function() {
            webapp.CloudStorage.removeItem(key, function(err) { resolve(!err); });
          }, function() {
            try { localStorage.removeItem(_lsKey(key)); resolve(true); } catch (e) { resolve(false); }
          });
        });
      }
      try { localStorage.removeItem(_lsKey(key)); return Promise.resolve(true); }
      catch (e) { return Promise.resolve(false); }
    },

    keys: function() {
      if (webapp && webapp.CloudStorage && api.versionAtLeast(6.9)) {
        return new Promise(function(resolve) {
          api._safeCall(function() {
            webapp.CloudStorage.getKeys(function(err, keys) { resolve(err ? [] : (keys || [])); });
          }, function() { resolve(_lsKeys()); });
        });
      }
      return Promise.resolve(_lsKeys());
    }
  };

  function _lsGet(key, def, resolve) {
    try {
      var raw = localStorage.getItem(_lsKey(key));
      if (raw === null) return resolve(def);
      try { resolve(JSON.parse(raw)); } catch (e) { resolve(raw); }
    } catch (e) { resolve(def); }
  }

  /* ========================================
     USER DATA (getters)
     ======================================== */

  Object.defineProperty(api, 'user', {
    get: function() {
      return (webapp && webapp.initDataUnsafe && webapp.initDataUnsafe.user) ? webapp.initDataUnsafe.user : null;
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
    get: function() { return webapp ? (webapp.initData || '') : ''; }
  });

  Object.defineProperty(api, 'isFullscreen', {
    get: function() { return webapp ? !!webapp.isFullscreen : false; }
  });

  /* ========================================
     UTILITIES
     ======================================== */

  api.close = function() {
    if (webapp) api._safeCall(function() { webapp.close(); });
    else window.close();
  };

  api.sendData = function(data) {
    if (!webapp) return;
    var str = typeof data === 'string' ? data : JSON.stringify(data);
    api._safeCall(function() { webapp.sendData(str); });
  };

  api.requestContact = function() {
    if (webapp && api.versionAtLeast(6.9)) {
      return new Promise(function(resolve) {
        api._safeCall(function() {
          webapp.requestContact(function(ok) { resolve(!!ok); });
        }, function() { resolve(false); });
      });
    }
    return Promise.resolve(false);
  };

  api.switchInlineQuery = function(query, chatTypes) {
    if (webapp && api.versionAtLeast(6.7)) {
      api._safeCall(function() { webapp.switchInlineQuery(query, chatTypes); });
    }
  };

  api.requestFullscreen = function() {
    if (webapp && api.versionAtLeast(8.0)) {
      api._safeCall(function() { webapp.requestFullscreen(); });
    }
  };

  api.exitFullscreen = function() {
    if (webapp && api.versionAtLeast(8.0)) {
      api._safeCall(function() { webapp.exitFullscreen(); });
    }
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
      '--tg-section-bg': '#1a1a2e', '--tg-section-header': '#999999',
      '--tg-subtitle': '#999999', '--tg-destructive': '#ff3b30',
      '--tg-accent': '#5eadff',
      '--tg-viewport-height': window.innerHeight + 'px',
      '--tg-viewport-stable-height': window.innerHeight + 'px',
      '--tg-is-expanded': '1',
      '--tg-safe-top': '0px', '--tg-safe-bottom': '0px',
      '--tg-safe-left': '0px', '--tg-safe-right': '0px',
      '--tg-content-safe-top': '0px', '--tg-content-safe-bottom': '0px',
      '--tg-content-safe-left': '0px', '--tg-content-safe-right': '0px'
    };

    for (var k in defaults) root.style.setProperty(k, defaults[k]);

    root.setAttribute('data-theme', 'dark');
    root.setAttribute('data-platform', 'browser');

    api.platform = 'browser';
    api.isIOS = false;
    api.isAndroid = false;
    api.isDesktop = false;

    window.addEventListener('resize', function() {
      root.style.setProperty('--tg-viewport-height', window.innerHeight + 'px');
      root.style.setProperty('--tg-viewport-stable-height', window.innerHeight + 'px');
    });
  };

  return api;
})();
