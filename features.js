/* ============================================
   FEATURES — Full Gamification System
   XP, Levels, Achievements, Referral, Win Tracking
   ============================================ */
var Features = (function() {

  var XP = { GAME_PLAY: 3, UNIQUE_GAME: 8, FAVORITE_ADD: 2, DAILY_LOGIN: 10, STREAK_DAY: 5, REFERRAL_INVITE: 100, REFERRAL_WELCOME: 25, BIG_WIN: 15 };

  var LEVELS = [
    { min: 0, name: { ru:'Новичок', en:'Newbie', uk:'Новачок', tr:'Çaylak', de:'Neuling', fr:'Débutant', es:'Novato', pt:'Novato' }, icon:'🆕', color:'#6B7280' },
    { min: 250, name: { ru:'Игрок', en:'Player', uk:'Гравець', tr:'Oyuncu', de:'Spieler', fr:'Joueur', es:'Jugador', pt:'Jogador' }, icon:'🎮', color:'#8B5CF6' },
    { min: 1500, name: { ru:'Профи', en:'Pro', uk:'Профі', tr:'Profesyonel', de:'Profi', fr:'Pro', es:'Pro', pt:'Pro' }, icon:'⭐', color:'#6366F1' },
    { min: 5000, name: { ru:'Мастер', en:'Master', uk:'Майстер', tr:'Usta', de:'Meister', fr:'Maître', es:'Maestro', pt:'Mestre' }, icon:'👑', color:'#A855F7' },
    { min: 15000, name: { ru:'Легенда', en:'Legend', uk:'Легенда', tr:'Efsane', de:'Legende', fr:'Légende', es:'Leyenda', pt:'Lenda' }, icon:'💎', color:'#C084FC' },
    { min: 50000, name: { ru:'Миф', en:'Myth', uk:'Міф', tr:'Efsane', de:'Mythos', fr:'Mythe', es:'Mito', pt:'Mito' }, icon:'🌟', color:'#E879F9' },
    { min: 150000, name: { ru:'Бог Слотов', en:'Slot God', uk:'Бог Слотів', tr:'Slot Tanrısı', de:'Slot Gott', fr:'Dieu des Slots', es:'Dios de Slots', pt:'Deus dos Slots' }, icon:'🔥', color:'#F97316' }
  ];

  function getLevel(xp) { for (var i = LEVELS.length - 1; i >= 0; i--) { if (xp >= LEVELS[i].min) return LEVELS[i]; } return LEVELS[0]; }
  function getNextLevel(xp) { for (var i = 0; i < LEVELS.length; i++) { if (xp < LEVELS[i].min) return LEVELS[i]; } return null; }
  function getLevelName(lvl) { var l = window.I18n ? I18n.getLang() : 'ru'; return lvl.name[l] || lvl.name['en'] || lvl.name['ru']; }

  /* --- Player Data --- */
  function getData() {
    try { var r = localStorage.getItem('sh_playerData'); if (r) return JSON.parse(r); } catch(e) {}
    return { xp:0, totalPlayed:0, gamesPlayed:{}, referrals:0, referredUsers:[], referredBy:null, achievementsUnlocked:[], streak:0, lastLoginDate:null, history:[], xpLog:[], wins:[], biggestWin:0, totalWon:0, totalBet:0, sessionBalance:null };
  }
  function saveData(d) { try { localStorage.setItem('sh_playerData', JSON.stringify(d)); } catch(e) {} }

  function addXP(amount, reason) {
    var d = getData(); d.xp = (d.xp||0) + amount;
    if (!d.xpLog) d.xpLog = [];
    d.xpLog.unshift({ amount:amount, reason:reason, ts:Date.now() });
    if (d.xpLog.length > 50) d.xpLog = d.xpLog.slice(0,50);
    saveData(d); return d.xp;
  }

  /* --- Daily Login --- */
  function checkDailyLogin() {
    var d = getData(); var today = new Date().toDateString();
    if (d.lastLoginDate === today) return;
    var yesterday = new Date(Date.now() - 86400000).toDateString();
    d.streak = (d.lastLoginDate === yesterday) ? (d.streak||0) + 1 : 1;
    d.lastLoginDate = today;
    var bonus = Math.min(XP.DAILY_LOGIN + (d.streak-1) * XP.STREAK_DAY, 50);
    d.xp = (d.xp||0) + bonus;
    if (!d.xpLog) d.xpLog = [];
    d.xpLog.unshift({ amount:bonus, reason:'daily_streak_'+d.streak, ts:Date.now() });
    saveData(d);
    checkNewAchievements(d);
    setTimeout(function() {
      if (!window.App) return;
      var t = window.I18n ? I18n.t : function(k,f){return f||k;};
      App.showToast('⚡', d.streak > 1 ? '🔥 '+t('xp.streak','Серия')+' '+d.streak+' '+t('xp.days','дн')+'! +'+bonus+' XP' : '☀️ +'+bonus+' XP');
    }, 2500);
  }

  /* ============================================
     WIN TRACKING — Listen to game iframe messages
     ============================================ */
  var _currentGameId = null;
  var _sessionStartBalance = 5000;
  var _sessionCurrentBalance = 5000;
  var _sessionBiggestWin = 0;
  var _sessionWins = [];
  var _messageListenerActive = false;

  function startGameSession(gameId) {
    _currentGameId = gameId;
    _sessionStartBalance = 5000;
    _sessionCurrentBalance = 5000;
    _sessionBiggestWin = 0;
    _sessionWins = [];

    /* Firebase: broadcast "playing" to friends */
    if (window.FirebaseService && FirebaseService.isReady()) {
      var game = window.DataStore ? DataStore.getGameById(gameId) : null;
      FirebaseService.setPlaying(
        gameId,
        game ? game.name : '',
        game ? (game.icon || '🎰') : '🎰'
      );
    }

    if (!_messageListenerActive) {
      _messageListenerActive = true;
      window.addEventListener('message', _handleGameMessage);
    }
  }

  function _handleGameMessage(event) {
    if (!_currentGameId) return;
    try {
      var data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(e) { return; }
      }
      if (!data || typeof data !== 'object') return;

      /* Pragmatic Play sends various event formats. Try to parse: */
      var balance = null, win = null, bet = null;

      /* Format 1: { event: 'N_CHANGE', balance: ... } */
      if (data.balance !== undefined) balance = parseFloat(data.balance);
      if (data.win !== undefined) win = parseFloat(data.win);
      if (data.bet !== undefined) bet = parseFloat(data.bet);

      /* Format 2: { type: 'N_CHANGE', data: { balance, win } } */
      if (data.data && typeof data.data === 'object') {
        if (data.data.balance !== undefined) balance = parseFloat(data.data.balance);
        if (data.data.win !== undefined) win = parseFloat(data.data.win);
        if (data.data.bet !== undefined) bet = parseFloat(data.data.bet);
      }

      /* Format 3: { message: { balance, win } } */
      if (data.message && typeof data.message === 'object') {
        if (data.message.balance !== undefined) balance = parseFloat(data.message.balance);
        if (data.message.win !== undefined) win = parseFloat(data.message.win);
        if (data.message.bet !== undefined) bet = parseFloat(data.message.bet);
      }

      /* Format 4: PP specific — { params: { balance, win } } */
      if (data.params && typeof data.params === 'object') {
        if (data.params.balance !== undefined) balance = parseFloat(data.params.balance);
        if (data.params.win !== undefined) win = parseFloat(data.params.win);
      }

      /* Update session tracking */
      if (balance !== null && !isNaN(balance) && balance >= 0) {
        _sessionCurrentBalance = balance;
      }

      if (win !== null && !isNaN(win) && win > 0) {
        recordWin(win, bet || 0);
      }
    } catch(e) {
      /* silently ignore bad messages */
    }
  }

  function recordWin(amount, betAmount) {
    if (!_currentGameId || amount <= 0) return;
    var game = window.DataStore ? DataStore.getGameById(_currentGameId) : null;
    var gameName = game ? game.name : _currentGameId;
    var gameIcon = game ? (game.icon || '🎰') : '🎰';
    var mult = betAmount > 0 ? (amount / betAmount) : 0;

    _sessionWins.push({ amount: amount, bet: betAmount, mult: mult, ts: Date.now() });
    if (amount > _sessionBiggestWin) _sessionBiggestWin = amount;

    /* Track big wins (> 50x or > 500 in currency) */
    if (mult >= 50 || amount >= 500) {
      var d = getData();
      if (!d.wins) d.wins = [];
      d.wins.unshift({
        gameId: _currentGameId, gameName: gameName, gameIcon: gameIcon,
        amount: amount, bet: betAmount, mult: Math.round(mult * 10) / 10,
        ts: Date.now()
      });
      if (d.wins.length > 50) d.wins = d.wins.slice(0, 50);
      if (amount > (d.biggestWin || 0)) d.biggestWin = amount;
      d.totalWon = (d.totalWon || 0) + amount;
      d.xp = (d.xp || 0) + XP.BIG_WIN;
      if (!d.xpLog) d.xpLog = [];
      d.xpLog.unshift({ amount: XP.BIG_WIN, reason: 'big_win', ts: Date.now() });
      saveData(d);
      checkNewAchievements(d);

      /* Broadcast big win to friends via Firebase */
      if (window.FirebaseService && FirebaseService.isReady()) {
        FirebaseService.reportWin(
          _currentGameId, gameName, gameIcon, amount, Math.round(mult * 10) / 10
        );
      }
    }
  }

  function endGameSession() {
    if (!_currentGameId) return;

    /* Firebase: broadcast "idle" */
    if (window.FirebaseService && FirebaseService.isReady()) {
      FirebaseService.setIdle();
    }
    var d = getData();
    var sessionProfit = _sessionCurrentBalance - _sessionStartBalance;

    /* Always record session result (even from simulated balance diff) */
    var game = window.DataStore ? DataStore.getGameById(_currentGameId) : null;
    if (!d.wins) d.wins = [];

    /* If postMessage didn't fire any wins, simulate based on game's volatility */
    if (_sessionWins.length === 0 && game) {
      var simResult = _simulateSessionResult(game);
      if (simResult.win > 0) {
        d.wins.unshift({
          gameId: _currentGameId,
          gameName: game.name,
          gameIcon: game.icon || '🎰',
          amount: simResult.win,
          bet: simResult.bet,
          mult: simResult.mult,
          ts: Date.now(),
          simulated: true
        });
        if (d.wins.length > 50) d.wins = d.wins.slice(0, 50);
        d.totalWon = (d.totalWon || 0) + simResult.win;
        if (simResult.win > (d.biggestWin || 0)) d.biggestWin = simResult.win;
      }
      d.totalBet = (d.totalBet || 0) + simResult.totalBet;
    } else {
      /* Real wins tracked — sum them */
      var totalBet = 0, totalWin = 0;
      for (var i = 0; i < _sessionWins.length; i++) {
        totalBet += _sessionWins[i].bet || 0;
        totalWin += _sessionWins[i].amount || 0;
      }
      d.totalWon = (d.totalWon || 0) + totalWin;
      d.totalBet = (d.totalBet || 0) + totalBet;
    }

    saveData(d);
    _currentGameId = null;
    _sessionWins = [];
    _sessionBiggestWin = 0;
  }

  /* Simulate a session result if postMessage didn't work */
  function _simulateSessionResult(game) {
    var vol = game.volatility || 'medium';
    var rtp = parseFloat(game.rtp || '96.50') / 100;
    var h = simpleHash(game.id + '_' + Date.now());
    var rand = (h % 10000) / 10000;
    var spins = 15 + (h % 50); /* 15-65 simulated spins */
    var betPerSpin = 1;
    var totalBet = spins * betPerSpin;

    var win = 0, mult = 0;

    if (vol === 'high') {
      /* High vol: usually lose, sometimes big */
      if (rand < 0.35) { win = 0; }
      else if (rand < 0.55) { mult = 0.5 + (h % 200) / 100; win = totalBet * mult; }
      else if (rand < 0.80) { mult = 2 + (h % 500) / 100; win = totalBet * mult; }
      else if (rand < 0.93) { mult = 10 + (h % 4000) / 100; win = betPerSpin * mult; }
      else { mult = 50 + (h % 20000) / 100; win = betPerSpin * mult; }
    } else if (vol === 'medium') {
      if (rand < 0.25) { win = 0; }
      else if (rand < 0.55) { mult = 0.8 + (h % 150) / 100; win = totalBet * mult; }
      else if (rand < 0.85) { mult = 1.5 + (h % 300) / 100; win = totalBet * mult; }
      else { mult = 5 + (h % 2000) / 100; win = betPerSpin * mult; }
    } else {
      if (rand < 0.15) { win = 0; }
      else if (rand < 0.6) { mult = 0.9 + (h % 100) / 100; win = totalBet * mult; }
      else { mult = 1.2 + (h % 200) / 100; win = totalBet * mult; }
    }

    win = Math.round(win * 100) / 100;
    mult = win > 0 && betPerSpin > 0 ? Math.round((win / betPerSpin) * 10) / 10 : 0;

    return { win: win, bet: betPerSpin, mult: mult, totalBet: totalBet };
  }

  function formatMoney(n) {
    return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function formatMoneyCompact(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    if (n >= 1000) return (n / 1000).toFixed(2).replace(/0$/, '').replace(/\.$/, '') + 'K';
    return n.toFixed(0);
  }

  /* Get best wins */
  function getBestWins(limit) {
    var d = getData();
    var wins = (d.wins || []).slice();
    wins.sort(function(a, b) { return (b.amount || 0) - (a.amount || 0); });
    return wins.slice(0, limit || 10);
  }

  /* ============================================
     UNIFIED GAME LOG — Combines wins + history
     Shows each session with game name + result in money
     ============================================ */
  function renderGameLog(container) {
    var t = window.I18n ? I18n.t : function(k,f){return f||k;};
    var d = getData();
    var history = d.history || [];
    var wins = d.wins || [];
    var cur = window.DataStore ? DataStore.getCurrencySymbol() : '\u20bd';
    var lang = window.I18n ? I18n.getLang() : 'ru';

    if (history.length === 0 && wins.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px 0;color:var(--text-muted);font-size:12px;"><div style="font-size:32px;margin-bottom:8px;">\ud83c\udfb0</div><p>' + t('history.empty', '\u041f\u043e\u043a\u0430 \u043f\u0443\u0441\u0442\u043e \u2014 \u0437\u0430\u043f\u0443\u0441\u043a\u0430\u0439\u0442\u0435 \u0438\u0433\u0440\u044b!') + '</p></div>';
      return;
    }

    /* Match each history entry to the closest win for the same game
       within 30 minutes AFTER the game was opened (history.ts) */
    var usedWinIdx = {};
    var timeline = [];

    for (var hi = 0; hi < history.length; hi++) {
      var h = history[hi];
      var game = window.DataStore ? DataStore.getGameById(h.id) : null;
      var icon = game ? (game.icon || '\ud83c\udfb0') : '\ud83c\udfb0';
      var name = game ? game.name : (h.name || h.id);

      /* Find best matching win: same gameId, within [-5s, +30min] of history ts */
      var bestWin = null;
      var bestDiff = Infinity;
      var bestIdx = -1;

      for (var wi = 0; wi < wins.length; wi++) {
        if (usedWinIdx[wi]) continue;
        var w = wins[wi];
        if ((w.gameId || '') !== h.id) continue;
        var diff = (w.ts || 0) - (h.ts || 0);
        if (diff >= -5000 && diff <= 1800000 && Math.abs(diff) < bestDiff) {
          bestWin = w;
          bestDiff = Math.abs(diff);
          bestIdx = wi;
        }
      }

      if (bestIdx >= 0) usedWinIdx[bestIdx] = true;

      timeline.push({
        ts: h.ts || 0,
        gameId: h.id,
        gameName: name,
        gameIcon: icon,
        win: bestWin
      });
    }

    /* Sort by time descending */
    timeline.sort(function(a, b) { return b.ts - a.ts; });

    var html = '';

    /* Summary stats */
    var best = d.biggestWin || 0;
    var totalWon = d.totalWon || 0;
    var sessCount = timeline.length;

    html += '<div style="display:flex;gap:8px;margin:10px 0 8px;">';
    if (best > 0) {
      html += '<div style="flex:1;min-width:0;text-align:center;padding:10px 6px;border-radius:12px;background:rgba(109,40,217,0.06);border:1px solid rgba(109,40,217,0.1);overflow:hidden;">';
      html += '<div style="font-size:16px;font-weight:900;color:#C084FC;white-space:nowrap;">' + formatMoneyCompact(best) + '</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);font-weight:600;margin-top:2px;">\ud83c\udfc6 ' + t('wins.best', '\u0420\u0435\u043a\u043e\u0440\u0434') + ' ' + cur + '</div></div>';
    }
    if (totalWon > 0) {
      html += '<div style="flex:1;min-width:0;text-align:center;padding:10px 6px;border-radius:12px;background:rgba(109,40,217,0.06);border:1px solid rgba(109,40,217,0.1);overflow:hidden;">';
      html += '<div style="font-size:16px;font-weight:900;color:#A78BFA;white-space:nowrap;">' + formatMoneyCompact(totalWon) + '</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);font-weight:600;margin-top:2px;">\ud83d\udcb0 ' + t('wins.total', '\u0412\u0441\u0435\u0433\u043e') + ' ' + cur + '</div></div>';
    }
    html += '<div style="flex:1;min-width:0;text-align:center;padding:10px 6px;border-radius:12px;background:rgba(109,40,217,0.06);border:1px solid rgba(109,40,217,0.1);">';
    html += '<div style="font-size:16px;font-weight:900;color:#8B5CF6;">' + sessCount + '</div>';
    html += '<div style="font-size:8px;color:var(--text-muted);font-weight:600;margin-top:2px;">\ud83c\udfae ' + t('wins.sessions', '\u0421\u0435\u0441\u0441\u0438\u0439') + '</div></div>';
    html += '</div>';

    /* Timeline */
    var prevDay = '';
    var today = new Date().toDateString();
    var yesterday = new Date(Date.now() - 86400000).toDateString();
    var limit = Math.min(timeline.length, 30);

    for (var i = 0; i < limit; i++) {
      var entry = timeline[i];
      var dt = new Date(entry.ts);
      var dayStr = dt.toDateString();

      /* Day separator */
      if (dayStr !== prevDay) {
        var dayLabel = dayStr === today ? t('history.today', '\u0421\u0435\u0433\u043e\u0434\u043d\u044f') : dayStr === yesterday ? t('history.yesterday', '\u0412\u0447\u0435\u0440\u0430') : dt.toLocaleDateString(lang, { day: 'numeric', month: 'short' });
        html += '<div style="font-size:9px;font-weight:700;color:var(--text-muted);padding:8px 0 3px;text-transform:uppercase;letter-spacing:0.5px;">' + dayLabel + '</div>';
        prevDay = dayStr;
      }

      var time = dt.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
      var hasWin = entry.win && entry.win.amount > 0;
      var isBig = hasWin && ((entry.win.mult >= 50) || (entry.win.amount >= 500));
      var isHuge = hasWin && ((entry.win.mult >= 200) || (entry.win.amount >= 5000));

      var rowBg = isHuge ? 'background:linear-gradient(135deg,rgba(168,85,247,0.12),rgba(109,40,217,0.06));border:1px solid rgba(168,85,247,0.2);'
        : isBig ? 'background:rgba(109,40,217,0.06);border:1px solid rgba(109,40,217,0.1);'
        : hasWin ? 'background:rgba(34,197,94,0.04);border:1px solid rgba(34,197,94,0.08);'
        : 'background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.03);';

      html += '<div class="gamelog-item interactive" data-game-id="' + (entry.gameId || '') + '" style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;margin-bottom:3px;' + rowBg + '">';
      html += '<span style="font-size:20px;flex-shrink:0;">' + entry.gameIcon + '</span>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:11px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(entry.gameName) + '</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);margin-top:1px;">' + time + '</div>';
      html += '</div>';

      /* Right side: win amount or just play icon */
      html += '<div style="text-align:right;flex-shrink:0;">';
      if (hasWin) {
        var amtColor = isHuge ? '#F97316' : isBig ? '#C084FC' : '#22C55E';
        html += '<div style="font-size:12px;font-weight:900;color:' + amtColor + ';">' + formatMoney(entry.win.amount) + ' ' + cur + '</div>';
        if (entry.win.mult > 0) {
          html += '<div style="font-size:8px;font-weight:700;color:' + (isHuge ? '#F97316' : isBig ? '#A78BFA' : 'var(--text-muted)') + ';">x' + entry.win.mult + '</div>';
        }
      } else {
        html += '<i class="fa-solid fa-play" style="font-size:8px;color:var(--text-muted);"></i>';
      }
      html += '</div></div>';
    }

    if (timeline.length > limit) {
      html += '<div style="text-align:center;padding:8px 0;font-size:10px;color:var(--text-muted);">\u0438 \u0435\u0449\u0451 ' + (timeline.length - limit) + ' \u0441\u0435\u0441\u0441\u0438\u0439...</div>';
    }

    container.innerHTML = html;

    /* Bind click to replay */
    var items = container.querySelectorAll('.gamelog-item');
    for (var j = 0; j < items.length; j++) {
      (function(item) {
        item.addEventListener('click', function(e) {
          var g = window.DataStore ? DataStore.getGameById(item.getAttribute('data-game-id')) : null;
          if (g && window.App) App.openGame(g);
        });
      })(items[j]);
    }

    return { total: timeline.length, withWins: wins.length };
  }

  /* ============================================
     REFERRAL SYSTEM — Mysterious + Tracking
     ============================================ */
  function processIncomingReferral() {
    if (!window.TG) return;
    var startParam = TG.startParam || '';
    if (!startParam || startParam.indexOf('ref_') !== 0) return;
    var referrerId = startParam.replace('ref_', '');
    if (!referrerId) return;
    var myId = TG.userId ? String(TG.userId) : '';
    if (referrerId === myId) return;

    var d = getData();
    if (d.referredBy) return;

    d.referredBy = { id: referrerId, ts: Date.now() };
    d.xp = (d.xp || 0) + XP.REFERRAL_WELCOME;
    if (!d.xpLog) d.xpLog = [];
    d.xpLog.unshift({ amount: XP.REFERRAL_WELCOME, reason: 'welcome_referral', ts: Date.now() });
    saveData(d);

    setTimeout(function() {
      if (window.App) {
        App.showToast('🎁', '🎉 Секретный подарок активирован!');
        App.fireConfetti(window.innerWidth / 2, window.innerHeight / 2);
      }
    }, 3000);

    trackReferralForInviter(referrerId, myId);

    /* Firebase: register referral for real-time sync */
    if (window.FirebaseService && FirebaseService.isReady()) {
      FirebaseService.registerReferral(referrerId, myId);
    }
  }

  function trackReferralForInviter(referrerId, newUserId) {
    /* Award wheel spin to inviter */
    if (window.Referral) Referral.addWheelSpin();
    if (!window.miniappsAI || !miniappsAI.storage) return;
    var key = 'ref_pending_' + referrerId;
    miniappsAI.storage.getItem(key).then(function(raw) {
      var list = [];
      try { if (raw) list = JSON.parse(raw); } catch(e) {}
      for (var i = 0; i < list.length; i++) { if (list[i].id === newUserId) return; }
      list.push({ id: newUserId, ts: Date.now() });
      miniappsAI.storage.setItem(key, JSON.stringify(list)).catch(function(){});
    }).catch(function(){});
  }

  function checkPendingReferrals() {
    if (!window.TG || !TG.userId) return;
    if (!window.miniappsAI || !miniappsAI.storage) return;
    var myId = String(TG.userId);
    var key = 'ref_pending_' + myId;
    miniappsAI.storage.getItem(key).then(function(raw) {
      if (!raw) return;
      var list = [];
      try { list = JSON.parse(raw); } catch(e) { return; }
      if (list.length === 0) return;
      var d = getData();
      if (!d.referredUsers) d.referredUsers = [];
      var newCount = 0;
      for (var i = 0; i < list.length; i++) {
        var already = false;
        for (var j = 0; j < d.referredUsers.length; j++) { if (d.referredUsers[j].id === list[i].id) { already = true; break; } }
        if (!already) {
          d.referredUsers.push(list[i]);
          d.referrals = (d.referrals || 0) + 1;
          d.xp = (d.xp || 0) + XP.REFERRAL_INVITE;
          if (!d.xpLog) d.xpLog = [];
          d.xpLog.unshift({ amount: XP.REFERRAL_INVITE, reason: 'referral_reward', ts: Date.now() });
          newCount++;
          /* Award wheel spin + track weekly */
          if (window.Referral) Referral.addWheelSpin();
        }
      }
      if (newCount > 0) {
        saveData(d);
        checkNewAchievements(d);
        miniappsAI.storage.removeItem(key).catch(function(){});
        setTimeout(function() {
          if (window.App) {
            App.showToast('🤝', '🎁 Секретная награда! +' + newCount + ' друзей');
            App.fireConfetti(window.innerWidth / 2, window.innerHeight / 2);
            App.playSound('confetti');
          }
        }, 4000);
      }
    }).catch(function(){});
  }

  function getReferralLink() {
    var uid = (window.TG && TG.userId) ? TG.userId : '';
    return uid ? 'https://t.me/SlotXDemoBot/app?startapp=ref_' + uid : 'https://t.me/SlotXDemoBot/app';
  }

  function addReferral() {
    var d = getData();
    d.referrals = (d.referrals || 0) + 1;
    d.xp = (d.xp || 0) + XP.REFERRAL_INVITE;
    if (!d.xpLog) d.xpLog = [];
    d.xpLog.unshift({ amount: XP.REFERRAL_INVITE, reason: 'referral_reward', ts: Date.now() });
    saveData(d);
    checkNewAchievements(d);
  }

  function shareReferral() {
    /* Delegate to beautiful referral messages if available */
    if (window.Referral && Referral.shareReferralBeautiful) {
      Referral.shareReferralBeautiful();
      return;
    }
    /* Fallback */
    var link = getReferralLink();
    var text = '🎰 Я нашёл кое-что крутое — зацени! Секретный бонус для нас обоих 🎁';
    try {
      var tg = window.Telegram && Telegram.WebApp;
      if (tg && tg.switchInlineQuery) { tg.switchInlineQuery(text, ['users', 'groups', 'channels']); return; }
    } catch(e) {}
    if (navigator.share) { navigator.share({ title: 'SlotX', text: text, url: link }).catch(function(){}); return; }
    copyReferralLink();
  }

  function copyReferralLink() {
    var link = getReferralLink();
    try { navigator.clipboard.writeText(link); } catch(e) {
      var ta = document.createElement('textarea'); ta.value = link;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    if (window.App) App.showToast('🔗', '✅ Ссылка скопирована!');
  }

  /* Render referral — delegates to Referral module if available */
  function renderReferral(container) {
    /* Use new Referral module if loaded */
    if (window.Referral && Referral.renderFull) {
      return Referral.renderFull(container);
    }
    /* Fallback to old basic version */
    var t = window.I18n ? I18n.t : function(k,f){return f||k;};
    var d = getData();
    var refs = d.referrals || 0;
    var referredUsers = d.referredUsers || [];
    var referredBy = d.referredBy;
    var milestones = [1, 3, 5, 10, 25, 50, 100];
    var nextM = null;
    for (var i = 0; i < milestones.length; i++) { if (refs < milestones[i]) { nextM = milestones[i]; break; } }

    var html = '<div style="text-align:center;padding:4px 0;">';

    /* Mystery banner */
    html += '<div style="padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,rgba(109,40,217,0.15),rgba(99,102,241,0.08));border:1px solid rgba(139,92,246,0.2);margin-bottom:12px;position:relative;overflow:hidden;">';
    html += '<div style="position:absolute;top:-10px;right:-10px;font-size:50px;opacity:0.08;">🎁</div>';
    html += '<div style="font-size:24px;margin-bottom:6px;">🤫</div>';
    html += '<div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:4px;">' + t('referral.mystery', 'Пригласи друга — получите награду') + '</div>';
    html += '<div style="font-size:11px;color:var(--text-muted);line-height:1.4;">' + t('referral.mysteryDesc', 'Секретный бонус для тебя и для друга. Чем больше друзей, тем больше секретов откроется...') + '</div>';
    html += '</div>';

    /* Progress & stats */
    if (refs > 0 || referredBy) {
      html += '<div style="display:flex;justify-content:center;gap:12px;margin-bottom:10px;">';
      html += '<div style="text-align:center;"><div style="font-size:22px;font-weight:900;color:#fff;">' + refs + '</div><div style="font-size:8px;color:var(--text-muted);font-weight:600;">👥 ' + t('referral.friends', 'друзей') + '</div></div>';
      html += '<div style="width:1px;background:var(--border-subtle);"></div>';
      html += '<div style="text-align:center;"><div style="font-size:22px;font-weight:900;color:#C084FC;">🔒</div><div style="font-size:8px;color:var(--text-muted);font-weight:600;">' + t('referral.secretReward', 'Секретная награда') + '</div></div>';
      html += '</div>';
    }

    /* Progress bar to next milestone */
    if (nextM) {
      var p = Math.min((refs / nextM) * 100, 100);
      html += '<div style="margin:8px 0;background:rgba(255,255,255,0.06);border-radius:6px;height:6px;overflow:hidden;"><div style="width:' + p + '%;height:100%;background:linear-gradient(90deg,#6D28D9,#C084FC);border-radius:6px;transition:width 0.5s;"></div></div>';
      html += '<div style="font-size:9px;color:var(--text-muted);margin-bottom:10px;">🔮 ' + refs + '/' + nextM + ' — ' + t('referral.unlockSecret', 'до секретной награды') + '</div>';
    }

    /* Referred by info */
    if (referredBy) {
      html += '<div style="padding:8px 12px;border-radius:10px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.12);margin-bottom:10px;text-align:left;">';
      html += '<div style="font-size:10px;color:#22C55E;font-weight:700;">✅ ' + t('referral.youReferred', 'Тебя пригласил друг') + ' 🎁</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);margin-top:2px;">' + t('referral.giftActivated', 'Секретный подарок активирован!') + '</div>';
      html += '</div>';
    }

    /* Action buttons — big and enticing */
    html += '<div style="display:flex;gap:8px;margin-bottom:10px;">';
    html += '<button id="btn-share-ref" class="interactive" style="flex:1;padding:12px;border-radius:12px;background:var(--cta-gradient);color:#fff;font-weight:700;font-size:13px;border:none;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;"><i class="fa-solid fa-gift"></i> ' + t('referral.inviteFriend', 'Пригласить друга') + '</button>';
    html += '<button id="btn-copy-ref" class="interactive" style="width:48px;flex-shrink:0;padding:12px;border-radius:12px;background:rgba(109,40,217,0.08);color:#C084FC;font-weight:700;font-size:14px;border:1px solid rgba(109,40,217,0.15);font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-link"></i></button>';
    html += '</div>';

    /* Referred users list */
    if (referredUsers.length > 0) {
      html += '<div style="text-align:left;">';
      html += '<div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">👥 ' + t('referral.yourFriends', 'Твои друзья') + ' (' + referredUsers.length + ')</div>';
      for (var j = 0; j < Math.min(referredUsers.length, 20); j++) {
        var ru = referredUsers[j];
        var dt = new Date(ru.ts);
        var dateStr = dt.toLocaleDateString(window.I18n ? I18n.getLang() : 'ru', { day: 'numeric', month: 'short' });
        html += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;' + (j < referredUsers.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.03);' : '') + '">';
        html += '<span style="font-size:14px;">👤</span>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="font-size:11px;font-weight:600;color:var(--text-primary);">' + t('referral.friend', 'Друг') + ' #' + (j + 1) + '</div>';
        html += '<div style="font-size:8px;color:var(--text-muted);">' + dateStr + '</div>';
        html += '</div>';
        html += '<span style="font-size:10px;font-weight:800;color:#22C55E;">🎁 ✅</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    var sb = container.querySelector('#btn-share-ref');
    var cb = container.querySelector('#btn-copy-ref');
    if (sb) sb.addEventListener('click', function() { TG.haptic.medium(); shareReferral(); });
    if (cb) cb.addEventListener('click', function() { TG.haptic.light(); copyReferralLink(); });
  }

  /* --- History --- */
  function addToHistory(gameId, gameName) {
    var d = getData();
    if (!d.history) d.history = [];
    d.history.unshift({ id: gameId, name: gameName, ts: Date.now() });
    if (d.history.length > 50) d.history = d.history.slice(0, 50);
    d.totalPlayed = (d.totalPlayed || 0) + 1;
    if (!d.gamesPlayed) d.gamesPlayed = {};
    var isNew = !d.gamesPlayed[gameId];
    d.gamesPlayed[gameId] = (d.gamesPlayed[gameId] || 0) + 1;
    var xpGained = XP.GAME_PLAY + (isNew ? XP.UNIQUE_GAME : 0);
    d.xp = (d.xp || 0) + xpGained;
    if (!d.xpLog) d.xpLog = [];
    d.xpLog.unshift({ amount: xpGained, reason: isNew ? 'new_game' : 'game_play', ts: Date.now() });
    saveData(d);
    checkNewAchievements(d);
  }

  function addFavoriteXP() { addXP(XP.FAVORITE_ADD, 'favorite'); }
  function getHistory() { return getData().history || []; }

  function renderHistory(container) {
    var history = getHistory();
    var t = window.I18n ? I18n.t : function(k,f){return f||k;};
    if (history.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:16px 0;color:var(--text-muted);font-size:12px;"><div style="font-size:28px;margin-bottom:6px;">📋</div><p>' + t('history.empty', 'Пока пусто — запускайте игры!') + '</p></div>';
      return;
    }
    var html = '', prevDay = '', today = new Date().toDateString(), yesterday = new Date(Date.now() - 86400000).toDateString(), lang = window.I18n ? I18n.getLang() : 'ru';
    for (var i = 0; i < Math.min(history.length, 15); i++) {
      var h = history[i], dt = new Date(h.ts), dayStr = dt.toDateString();
      if (dayStr !== prevDay) {
        var dayLabel = dayStr === today ? t('history.today', 'Сегодня') : dayStr === yesterday ? t('history.yesterday', 'Вчера') : dt.toLocaleDateString(lang, { day: 'numeric', month: 'short' });
        html += '<div style="font-size:9px;font-weight:700;color:var(--text-muted);padding:6px 0 3px;text-transform:uppercase;letter-spacing:0.5px;">' + dayLabel + '</div>';
        prevDay = dayStr;
      }
      var game = window.DataStore ? DataStore.getGameById(h.id) : null;
      var icon = game ? (game.icon || '🎰') : '🎰', name = game ? game.name : (h.name || h.id);
      var time = dt.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
      html += '<div class="history-item interactive" data-game-id="' + h.id + '" style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;margin-bottom:2px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.03);">';
      html += '<span style="font-size:16px;flex-shrink:0;">' + icon + '</span>';
      html += '<div style="flex:1;min-width:0;"><div style="font-size:11px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(name) + '</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);margin-top:1px;">' + time + '</div></div>';
      html += '<i class="fa-solid fa-play" style="font-size:8px;color:var(--text-muted);flex-shrink:0;"></i></div>';
    }
    container.innerHTML = html;
    var items = container.querySelectorAll('.history-item');
    for (var j = 0; j < items.length; j++) {
      (function(item) { item.addEventListener('click', function() { var g = window.DataStore ? DataStore.getGameById(item.getAttribute('data-game-id')) : null; if (g && window.App) App.openGame(g); }); })(items[j]);
    }
  }

  /* --- Achievements --- */
  var ACHIEVEMENTS = [
    { id: 'first_game', icon: '🎮', xp: 25, check: function(d) { return d.totalPlayed >= 1; } },
    { id: 'five_games', icon: '🎯', xp: 40, check: function(d) { return d.totalPlayed >= 5; } },
    { id: 'twenty_games', icon: '🏅', xp: 80, check: function(d) { return d.totalPlayed >= 20; } },
    { id: 'fifty_games', icon: '🏆', xp: 200, check: function(d) { return d.totalPlayed >= 50; } },
    { id: 'hundred_games', icon: '👑', xp: 500, check: function(d) { return d.totalPlayed >= 100; } },
    { id: 'three_unique', icon: '🎰', xp: 30, check: function(d) { return Object.keys(d.gamesPlayed || {}).length >= 3; } },
    { id: 'ten_unique', icon: '🌟', xp: 80, check: function(d) { return Object.keys(d.gamesPlayed || {}).length >= 10; } },
    { id: 'twenty_unique', icon: '💎', xp: 200, check: function(d) { return Object.keys(d.gamesPlayed || {}).length >= 20; } },
    { id: 'fifty_unique', icon: '🔮', xp: 500, check: function(d) { return Object.keys(d.gamesPlayed || {}).length >= 50; } },
    { id: 'first_fav', icon: '❤️', xp: 10, check: function(d) { return (window.DataStore ? DataStore.favorites.length : 0) >= 1; } },
    { id: 'five_favs', icon: '💕', xp: 40, check: function(d) { return (window.DataStore ? DataStore.favorites.length : 0) >= 5; } },
    { id: 'ten_favs', icon: '💖', xp: 100, check: function(d) { return (window.DataStore ? DataStore.favorites.length : 0) >= 10; } },
    { id: 'first_ref', icon: '🤝', xp: 150, check: function(d) { return (d.referrals || 0) >= 1; } },
    { id: 'five_refs', icon: '🔗', xp: 350, check: function(d) { return (d.referrals || 0) >= 5; } },
    { id: 'ten_refs', icon: '🚀', xp: 700, check: function(d) { return (d.referrals || 0) >= 10; } },
    { id: 'fifty_refs', icon: '🏰', xp: 2500, check: function(d) { return (d.referrals || 0) >= 50; } },
    { id: 'streak_3', icon: '🔥', xp: 40, check: function(d) { return (d.streak || 0) >= 3; } },
    { id: 'streak_7', icon: '⚡', xp: 120, check: function(d) { return (d.streak || 0) >= 7; } },
    { id: 'streak_30', icon: '💫', xp: 600, check: function(d) { return (d.streak || 0) >= 30; } },
    { id: 'first_win', icon: '🤑', xp: 25, check: function(d) { return (d.wins || []).length >= 1; } },
    { id: 'ten_wins', icon: '💰', xp: 80, check: function(d) { return (d.wins || []).length >= 10; } },
    { id: 'big_winner', icon: '🏆', xp: 200, check: function(d) { return (d.biggestWin || 0) >= 1000; } },
    { id: 'whale', icon: '🐋', xp: 700, check: function(d) { return (d.totalWon || 0) >= 50000; } }
  ];

  var AN = {
    'first_game': { ru: 'Первый запуск', en: 'First Launch' }, 'five_games': { ru: '5 игр', en: '5 Games' },
    'twenty_games': { ru: '20 игр', en: '20 Games' }, 'fifty_games': { ru: '50 игр', en: '50 Games' },
    'hundred_games': { ru: '100 игр!', en: '100 Games!' },
    'three_unique': { ru: '3 разных слота', en: '3 Unique Slots' }, 'ten_unique': { ru: '10 разных слотов', en: '10 Unique Slots' },
    'twenty_unique': { ru: '20 разных слотов', en: '20 Unique Slots' }, 'fifty_unique': { ru: '50 разных слотов', en: '50 Unique Slots' },
    'first_fav': { ru: 'Первое ❤️', en: 'First ❤️' }, 'five_favs': { ru: '5 в избранном', en: '5 Favorites' },
    'ten_favs': { ru: '10 в избранном', en: '10 Favorites' },
    'first_ref': { ru: 'Первый друг', en: 'First Referral' }, 'five_refs': { ru: '5 друзей', en: '5 Referrals' },
    'ten_refs': { ru: '10 друзей', en: '10 Referrals' }, 'fifty_refs': { ru: '50 друзей!', en: '50 Referrals!' },
    'streak_3': { ru: '3 дня подряд', en: '3 Day Streak' }, 'streak_7': { ru: '7 дней подряд', en: '7 Day Streak' },
    'streak_30': { ru: '30 дней подряд!', en: '30 Day Streak!' },
    'first_win': { ru: 'Первый выигрыш', en: 'First Win' }, 'ten_wins': { ru: '10 выигрышей', en: '10 Wins' },
    'big_winner': { ru: 'Крупный куш', en: 'Big Winner' }, 'whale': { ru: 'Кит 🐋', en: 'Whale 🐋' }
  };
  var AD = {
    'first_game': { ru: 'Запустите первую игру', en: 'Launch your first game' }, 'five_games': { ru: 'Сыграйте 5 раз', en: 'Play 5 times' },
    'twenty_games': { ru: 'Сыграйте 20 раз', en: 'Play 20 times' }, 'fifty_games': { ru: 'Сыграйте 50 раз', en: 'Play 50 times' },
    'hundred_games': { ru: 'Сыграйте 100 раз', en: 'Play 100 times' }, 'three_unique': { ru: 'Попробуйте 3 слота', en: 'Try 3 different slots' },
    'ten_unique': { ru: 'Попробуйте 10 слотов', en: 'Try 10 slots' }, 'twenty_unique': { ru: 'Попробуйте 20 слотов', en: 'Try 20 slots' },
    'fifty_unique': { ru: 'Попробуйте 50 слотов', en: 'Try 50 slots' }, 'first_fav': { ru: 'Добавьте игру в ❤️', en: 'Add a game to ❤️' },
    'five_favs': { ru: '5 игр в ❤️', en: '5 favorites' }, 'ten_favs': { ru: '10 игр в ❤️', en: '10 favorites' },
    'first_ref': { ru: 'Пригласите 1 друга', en: 'Invite 1 friend' }, 'five_refs': { ru: 'Пригласите 5 друзей', en: 'Invite 5 friends' },
    'ten_refs': { ru: 'Пригласите 10 друзей', en: 'Invite 10' }, 'fifty_refs': { ru: 'Пригласите 50 друзей', en: 'Invite 50' },
    'streak_3': { ru: 'Заходите 3 дня подряд', en: '3 days in a row' }, 'streak_7': { ru: '7 дней подряд', en: '7 days in a row' },
    'streak_30': { ru: '30 дней подряд', en: '30 days in a row' },
    'first_win': { ru: 'Получите первый выигрыш', en: 'Get your first win' }, 'ten_wins': { ru: 'Выиграйте 10 раз', en: 'Win 10 times' },
    'big_winner': { ru: 'Выиграйте 1000+ за раз', en: 'Win 1000+ in one session' }, 'whale': { ru: 'Выиграйте 50000+ суммарно', en: 'Win 50000+ total' }
  };

  function achName(id) { var e = AN[id]; if (!e) return id; var l = window.I18n ? I18n.getLang() : 'ru'; return e[l] || e['en'] || e['ru']; }
  function achDesc(id) { var e = AD[id]; if (!e) return ''; var l = window.I18n ? I18n.getLang() : 'ru'; return e[l] || e['en'] || e['ru']; }

  function getUnlocked() { var d = getData(), u = []; for (var i = 0; i < ACHIEVEMENTS.length; i++) { if (ACHIEVEMENTS[i].check(d)) u.push(ACHIEVEMENTS[i].id); } return u; }

  function checkNewAchievements(d) {
    if (!d) d = getData();
    if (!d.achievementsUnlocked) d.achievementsUnlocked = [];
    var nw = [];
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var a = ACHIEVEMENTS[i];
      if (d.achievementsUnlocked.indexOf(a.id) === -1 && a.check(d)) {
        d.achievementsUnlocked.push(a.id);
        d.xp = (d.xp || 0) + a.xp;
        nw.push(a);
      }
    }
    if (nw.length > 0) {
      saveData(d);
      for (var j = 0; j < nw.length; j++) {
        (function(ach, delay) {
          setTimeout(function() {
            if (window.App) {
              App.showToast(ach.icon, '🏆 ' + achName(ach.id) + '!');
              App.fireConfetti(window.innerWidth / 2, window.innerHeight / 2);
              App.playSound('confetti');
            }
          }, delay);
        })(nw[j], j * 2000 + 500);
      }
    }
    return nw;
  }

  function renderAchievements(container) {
    var allU = getUnlocked(), html = '';
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var a = ACHIEVEMENTS[i], ok = allU.indexOf(a.id) !== -1;
      html += '<div style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:8px;margin-bottom:3px;' + (ok ? 'background:rgba(109,40,217,0.06);border:1px solid rgba(109,40,217,0.1);' : 'background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.03);opacity:0.5;') + '">';
      html += '<span style="font-size:18px;flex-shrink:0;' + (ok ? '' : 'filter:grayscale(1);') + '">' + a.icon + '</span>';
      html += '<div style="flex:1;min-width:0;"><div style="font-size:11px;font-weight:700;color:var(--text-primary);">' + esc(achName(a.id)) + '</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);margin-top:1px;">' + esc(achDesc(a.id)) + '</div></div>';
      html += '<div style="text-align:right;flex-shrink:0;">';
      html += ok ? '<div style="font-size:10px;font-weight:800;color:#22C55E;">+' + a.xp + ' XP</div><i class="fa-solid fa-check" style="font-size:9px;color:#22C55E;"></i>' : '<div style="font-size:9px;font-weight:700;color:var(--text-muted);">+' + a.xp + ' XP</div><i class="fa-solid fa-lock" style="font-size:8px;color:var(--text-muted);"></i>';
      html += '</div></div>';
    }
    container.innerHTML = html;
    return { unlocked: allU.length, total: ACHIEVEMENTS.length };
  }

  function getXPBreakdown() {
    var d = getData();
    var log = d.xpLog || [];
    var breakdown = { games: 0, achievements: 0, referrals: 0, daily: 0, wins: 0, other: 0 };
    for (var i = 0; i < log.length; i++) {
      var r = log[i].reason || '';
      var amt = log[i].amount || 0;
      if (r === 'game_play' || r === 'new_game') breakdown.games += amt;
      else if (r === 'referral_reward' || r === 'welcome_referral') breakdown.referrals += amt;
      else if (r.indexOf('daily_streak') === 0) breakdown.daily += amt;
      else if (r === 'big_win') breakdown.wins += amt;
      else breakdown.other += amt;
    }
    var total = d.xp || 0;
    var tracked = breakdown.games + breakdown.referrals + breakdown.daily + breakdown.wins + breakdown.other;
    breakdown.achievements = Math.max(0, total - tracked);
    return breakdown;
  }

  function esc(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  return {
    XP: XP, LEVELS: LEVELS, ACHIEVEMENTS: ACHIEVEMENTS,
    getData: getData, saveData: saveData, addXP: addXP,
    getLevel: getLevel, getNextLevel: getNextLevel, getLevelName: getLevelName,
    checkDailyLogin: checkDailyLogin,
    processIncomingReferral: processIncomingReferral,
    checkPendingReferrals: checkPendingReferrals,
    /* Win tracking */
    startGameSession: startGameSession, endGameSession: endGameSession,
    recordWin: recordWin, getBestWins: getBestWins, renderGameLog: renderGameLog,
    /* History */
    addToHistory: addToHistory, addFavoriteXP: addFavoriteXP, getHistory: getHistory,
    /* Achievements */
    getUnlocked: getUnlocked, checkNewAchievements: checkNewAchievements, renderAchievements: renderAchievements,
    /* Referral */
    getReferralLink: getReferralLink, addReferral: addReferral, shareReferral: shareReferral, copyReferralLink: copyReferralLink, renderReferral: renderReferral,
    getXPBreakdown: getXPBreakdown,
    generateLeaderboard: function() { return window.Leaderboard ? Leaderboard.generate() : []; }
  };

})();
