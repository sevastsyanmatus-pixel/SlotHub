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
  var _friendListeners = {};
  var _friendsData = {}; /* Cached friend status for UI reads */

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
     WATCH FRIENDS — Real-time status for UI display
     No notifications — only caches data for UI reads
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

    var handler = ref.on('value', function(snapshot) {
      var data = snapshot.val();
      if (!data) return;
      /* Only cache data for UI — no notifications */
      _friendsData[friendId] = {
        id: friendId,
        name: data.name || 'Друг',
        status: data.status || 'idle',
        gameId: data.gameId || '',
        gameName: data.gameName || '',
        gameIcon: data.gameIcon || '🎰',
        lastWin: data.lastWin || null,
        updatedAt: data.updatedAt || 0
      };
    }, function(error) {
      console.warn('[Firebase] Watch error for', friendId, error.message);
    });

    _friendListeners[friendId] = { ref: ref, handler: handler };
  }

  function stopWatchingFriends() {
    for (var id in _friendListeners) {
      if (_friendListeners.hasOwnProperty(id)) {
        var l = _friendListeners[id];
        try { l.ref.off('value', l.handler); } catch(e) {}
      }
    }
    _friendListeners = {};
    _friendsData = {};
  }

  /* ============================================
     GET CACHED FRIEND DATA — For UI rendering
     ============================================ */
  function getCachedFriendsData() {
    var result = [];
    for (var id in _friendsData) {
      if (_friendsData.hasOwnProperty(id)) {
        result.push(_friendsData[id]);
      }
    }
    return result;
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
      if (!ok) return;
      console.log('[Firebase] Connected, watching friends (no notifications)');
      var friends = getFriendIds();
      if (friends.length > 0) {
        watchFriends(friends);
      }
    });
  }

  /* ============================================
     CLEANUP
     ============================================ */
  function destroy() {
    stopWatchingFriends();
    setIdle();
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
    getCachedFriendsData: getCachedFriendsData,
    getFriendIds: getFriendIds,

    /* Util */
    isReady: function() { return _initialized; },
    getUserId: function() { return _userId; }
  };

})();
