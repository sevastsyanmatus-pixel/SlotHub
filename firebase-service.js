/* ============================================
   FIREBASE SERVICE — Real-time Friend Activity
   
   HOW TO SET UP:
   1. Go to https://console.firebase.google.com
   2. Create a new project (e.g., "slotx-app")
   3. Go to Realtime Database → Create Database
   4. Choose region closest to your users
   5. Start in TEST MODE (for development)
   6. Copy your config from Project Settings → Web App
   7. Replace FIREBASE_CONFIG below
   
   SECURITY RULES (set in Firebase Console → Realtime Database → Rules):
   {
     "rules": {
       "activity": {
         "$userId": {
           ".read": true,
           ".write": "$userId === auth.uid || !data.exists() || true"
         }
       },
       "referrals": {
         "$userId": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   
   NOTE: For production, tighten rules with proper auth.
   For now "true" write allows anonymous demo usage.
   ============================================ */
var FirebaseService = (function() {

  /* ============================================
     CONFIGURATION — REPLACE WITH YOUR FIREBASE CONFIG
     ============================================ */
  var FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:abcdef1234567890"
  };

  /* State */
  var _db = null;
  var _initialized = false;
  var _userId = null;
  var _listeners = [];
  var _friendListeners = {};
  var _activityCallbacks = [];
  var _lastNotifTime = 0;
  var _notifCooldown = 30000; /* 30 sec between toasts */
  var _notifCount = 0;
  var _maxNotifsPerSession = 15;

  /* ============================================
     CHECK IF CONFIGURED
     ============================================ */
  function isConfigured() {
    return FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY_HERE' &&
           FIREBASE_CONFIG.databaseURL.indexOf('YOUR_PROJECT') === -1;
  }

  /* ============================================
     INIT — Load Firebase SDK & Connect
     ============================================ */
  function init() {
    if (_initialized) return Promise.resolve(true);
    if (!isConfigured()) {
      console.log('[Firebase] Not configured — using simulated mode');
      return Promise.resolve(false);
    }

    return new Promise(function(resolve) {
      /* Check if Firebase already loaded */
      if (window.firebase && firebase.app) {
        _connect();
        resolve(true);
        return;
      }

      /* Load Firebase SDK from CDN */
      var loaded = 0;
      var scripts = [
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js'
      ];

      function onLoad() {
        loaded++;
        if (loaded === scripts.length) {
          try {
            _connect();
            resolve(true);
          } catch(e) {
            console.error('[Firebase] Init error:', e);
            resolve(false);
          }
        }
      }

      function onError() {
        loaded++;
        console.error('[Firebase] Failed to load SDK');
        if (loaded === scripts.length) resolve(false);
      }

      for (var i = 0; i < scripts.length; i++) {
        var s = document.createElement('script');
        s.src = scripts[i];
        s.onload = onLoad;
        s.onerror = onError;
        document.head.appendChild(s);
      }

      /* Timeout fallback */
      setTimeout(function() { if (!_initialized) resolve(false); }, 8000);
    });
  }

  function _connect() {
    if (_initialized) return;
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      _db = firebase.database();
      _userId = _getUserId();
      _initialized = true;
      console.log('[Firebase] Connected, userId:', _userId);
    } catch(e) {
      console.error('[Firebase] Connection error:', e);
    }
  }

  function _getUserId() {
    if (window.TG && TG.userId) return String(TG.userId);
    /* Fallback: generate persistent anonymous ID */
    var id = null;
    try { id = localStorage.getItem('sh_anonId'); } catch(e) {}
    if (!id) {
      id = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
      try { localStorage.setItem('sh_anonId', id); } catch(e) {}
    }
    return id;
  }

  function _getUserName() {
    if (window.TG && TG.userFirstName) return TG.userFirstName;
    return 'Игрок';
  }

  /* ============================================
     WRITE ACTIVITY — Called when user plays/wins
     ============================================ */
  function setPlaying(gameId, gameName, gameIcon) {
    if (!_initialized || !_db || !_userId) return;
    var ref = _db.ref('activity/' + _userId);
    ref.set({
      name: _getUserName(),
      status: 'playing',
      gameId: gameId || '',
      gameName: gameName || '',
      gameIcon: gameIcon || '🎰',
      lastWin: null,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    }).catch(function(e) { console.warn('[Firebase] Write error:', e.message); });

    /* Set onDisconnect to clear status */
    ref.onDisconnect().update({
      status: 'idle',
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    }).catch(function() {});
  }

  function setIdle() {
    if (!_initialized || !_db || !_userId) return;
    _db.ref('activity/' + _userId).update({
      status: 'idle',
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    }).catch(function(e) { console.warn('[Firebase] Write error:', e.message); });
  }

  function reportWin(gameId, gameName, gameIcon, amount, mult) {
    if (!_initialized || !_db || !_userId) return;
    _db.ref('activity/' + _userId).update({
      lastWin: {
        gameId: gameId,
        gameName: gameName,
        gameIcon: gameIcon || '🎰',
        amount: amount,
        mult: mult,
        ts: firebase.database.ServerValue.TIMESTAMP
      },
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    }).catch(function(e) { console.warn('[Firebase] Write error:', e.message); });
  }

  /* ============================================
     REFERRAL SYNC — Store referrals in Firebase
     ============================================ */
  function registerReferral(inviterUserId, newUserId) {
    if (!_initialized || !_db) return;
    var ref = _db.ref('referrals/' + inviterUserId + '/friends');
    ref.push({
      id: newUserId,
      name: _getUserName(),
      ts: firebase.database.ServerValue.TIMESTAMP
    }).catch(function(e) { console.warn('[Firebase] Referral write error:', e.message); });
  }

  /* ============================================
     LISTEN TO FRIENDS — Real-time notifications
     ============================================ */
  function watchFriends(friendIds) {
    if (!_initialized || !_db) return;
    /* Clean up old listeners */
    stopWatchingFriends();

    for (var i = 0; i < friendIds.length; i++) {
      _watchFriend(friendIds[i]);
    }
  }

  function _watchFriend(friendId) {
    if (!_db || friendId === _userId) return;
    if (_friendListeners[friendId]) return; /* Already watching */

    var ref = _db.ref('activity/' + friendId);
    var isFirst = true; /* Skip first event (current state) */

    var handler = ref.on('value', function(snapshot) {
      if (isFirst) { isFirst = false; return; }
      var data = snapshot.val();
      if (!data) return;
      _handleFriendUpdate(friendId, data);
    }, function(error) {
      console.warn('[Firebase] Watch error for', friendId, error.message);
    });

    _friendListeners[friendId] = { ref: ref, handler: handler };
  }

  function _handleFriendUpdate(friendId, data) {
    var now = Date.now();

    /* Cooldown between notifications */
    if (now - _lastNotifTime < _notifCooldown) return;
    if (_notifCount >= _maxNotifsPerSession) return;

    /* Only notify about recent events (within last 2 minutes) */
    var updatedAt = data.updatedAt || 0;
    if (now - updatedAt > 120000) return;

    var friendName = data.name || ('Друг');
    var gameName = data.gameName || '';
    var gameIcon = data.gameIcon || '🎰';

    /* Friend started playing */
    if (data.status === 'playing' && gameName) {
      _showFriendToast('🎮', friendName + ' играет в ' + gameName + '!');
    }

    /* Friend won */
    if (data.lastWin && data.lastWin.amount > 0) {
      var win = data.lastWin;
      var winTs = win.ts || 0;
      /* Only show if win happened recently (within 1 min) */
      if (now - winTs < 60000) {
        var cur = window.DataStore ? DataStore.getCurrencySymbol() : '₽';
        var amt = win.amount.toFixed(0);
        if (win.mult >= 50) {
          _showFriendToast('🤑', friendName + ' выиграл ' + amt + ' ' + cur + ' (x' + win.mult + ') в ' + (win.gameName || gameName) + '!');
        } else if (win.amount >= 500) {
          _showFriendToast('🔥', friendName + ' выиграл ' + amt + ' ' + cur + ' в ' + (win.gameName || gameName) + '!');
        } else {
          _showFriendToast('⚡', friendName + ' выигрывает в ' + (win.gameName || gameName) + '!');
        }
      }
    }
  }

  function _showFriendToast(icon, text) {
    _lastNotifTime = Date.now();
    _notifCount++;

    /* Notify via callbacks */
    for (var i = 0; i < _activityCallbacks.length; i++) {
      try { _activityCallbacks[i](icon, text); } catch(e) {}
    }

    /* Default: use App.showToast */
    if (_activityCallbacks.length === 0 && window.App) {
      App.showToast(icon, text);
    }
  }

  function stopWatchingFriends() {
    for (var id in _friendListeners) {
      if (_friendListeners.hasOwnProperty(id)) {
        var l = _friendListeners[id];
        try { l.ref.off('value', l.handler); } catch(e) {}
      }
    }
    _friendListeners = {};
  }

  /* ============================================
     ON ACTIVITY — Register callback for friend updates
     ============================================ */
  function onFriendActivity(callback) {
    if (typeof callback === 'function') {
      _activityCallbacks.push(callback);
    }
  }

  /* ============================================
     GET FRIENDS STATUS — One-time read
     ============================================ */
  function getFriendsStatus(friendIds) {
    if (!_initialized || !_db) return Promise.resolve([]);
    var promises = [];
    for (var i = 0; i < friendIds.length; i++) {
      (function(fid) {
        promises.push(
          _db.ref('activity/' + fid).once('value').then(function(snap) {
            var d = snap.val();
            if (!d) return null;
            return {
              id: fid,
              name: d.name || 'Друг',
              status: d.status || 'idle',
              gameName: d.gameName || '',
              gameIcon: d.gameIcon || '🎰',
              lastWin: d.lastWin || null,
              updatedAt: d.updatedAt || 0
            };
          }).catch(function() { return null; })
        );
      })(friendIds[i]);
    }
    return Promise.all(promises).then(function(results) {
      return results.filter(function(r) { return r !== null; });
    });
  }

  /* ============================================
     HELPER: Get friend IDs from referral data
     ============================================ */
  function getFriendIds() {
    if (!window.Features) return [];
    var d = Features.getData();
    var friends = d.referredUsers || [];
    var ids = [];
    for (var i = 0; i < friends.length; i++) {
      if (friends[i].id) ids.push(String(friends[i].id));
    }
    /* Also include who referred us */
    if (d.referredBy && d.referredBy.id) {
      ids.push(String(d.referredBy.id));
    }
    return ids;
  }

  /* ============================================
     AUTO-START: Initialize and start watching
     ============================================ */
  function autoStart() {
    init().then(function(ok) {
      if (!ok) {
        console.log('[Firebase] Not available, friend activity will use simulation');
        return;
      }
      /* Start watching friends */
      var ids = getFriendIds();
      if (ids.length > 0) {
        watchFriends(ids);
        console.log('[Firebase] Watching', ids.length, 'friends');
      }
    });
  }

  /* ============================================
     CLEANUP
     ============================================ */
  function destroy() {
    stopWatchingFriends();
    setIdle();
    _activityCallbacks = [];
  }

  /* ============================================
     PUBLIC API
     ============================================ */
  return {
    /* Setup */
    init: init,
    isConfigured: isConfigured,
    autoStart: autoStart,
    destroy: destroy,

    /* Write */
    setPlaying: setPlaying,
    setIdle: setIdle,
    reportWin: reportWin,
    registerReferral: registerReferral,

    /* Read/Watch */
    watchFriends: watchFriends,
    stopWatchingFriends: stopWatchingFriends,
    getFriendsStatus: getFriendsStatus,
    getFriendIds: getFriendIds,
    onFriendActivity: onFriendActivity,

    /* Util */
    isReady: function() { return _initialized; },
    getUserId: function() { return _userId; }
  };

})();
