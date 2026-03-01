/* ============================================
   REFERRAL SYSTEM — Friend Tree, Fortune Wheel,
   Win Sharing, Friend Activity
   ============================================ */
var Referral = (function() {

  /* ============================================
     FORTUNE WHEEL
     ============================================ */
  var WHEEL_PRIZES = [
    { label: '+50 XP', value: 50, type: 'xp', color: '#6D28D9', prob: 30 },
    { label: '+100 XP', value: 100, type: 'xp', color: '#4338CA', prob: 25 },
    { label: '+200 XP', value: 200, type: 'xp', color: '#7C3AED', prob: 15 },
    { label: '+500 XP', value: 500, type: 'xp', color: '#2E1065', prob: 8 },
    { label: '🎁 Секрет', value: 300, type: 'xp', color: '#C2410C', prob: 7 },
    { label: '+75 XP', value: 75, type: 'xp', color: '#3730A3', prob: 15 }
  ];

  var _wheelSpinning = false;

  function canSpin() {
    try {
      var raw = localStorage.getItem('sh_wheelSpins');
      if (raw) {
        var data = JSON.parse(raw);
        return (data.available || 0) > 0;
      }
    } catch(e) {}
    return false;
  }

  function addWheelSpin() {
    try {
      var raw = localStorage.getItem('sh_wheelSpins');
      var data = raw ? JSON.parse(raw) : { available: 0, total: 0 };
      data.available = (data.available || 0) + 1;
      data.total = (data.total || 0) + 1;
      localStorage.setItem('sh_wheelSpins', JSON.stringify(data));
    } catch(e) {}
  }

  function useWheelSpin() {
    try {
      var raw = localStorage.getItem('sh_wheelSpins');
      var data = raw ? JSON.parse(raw) : { available: 0, total: 0 };
      if (data.available > 0) { data.available--; localStorage.setItem('sh_wheelSpins', JSON.stringify(data)); return true; }
    } catch(e) {}
    return false;
  }

  function getSpinsAvailable() {
    try {
      var raw = localStorage.getItem('sh_wheelSpins');
      if (raw) return JSON.parse(raw).available || 0;
    } catch(e) {}
    return 0;
  }

  function selectPrize() {
    var total = 0;
    for (var i = 0; i < WHEEL_PRIZES.length; i++) total += WHEEL_PRIZES[i].prob;
    var r = Math.random() * total;
    var acc = 0;
    for (var j = 0; j < WHEEL_PRIZES.length; j++) {
      acc += WHEEL_PRIZES[j].prob;
      if (r <= acc) return j;
    }
    return 0;
  }

  function renderWheel(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var cx = canvas.width / 2, cy = canvas.height / 2, R = Math.min(cx, cy) - 10;
    var n = WHEEL_PRIZES.length;
    var arc = (Math.PI * 2) / n;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R + 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139,92,246,0.3)'; ctx.lineWidth = 6; ctx.stroke();
    ctx.restore();

    for (var i = 0; i < n; i++) {
      var angle = i * arc - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, angle, angle + arc);
      ctx.closePath();
      ctx.fillStyle = WHEEL_PRIZES[i].color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 3;
      ctx.fillText(WHEEL_PRIZES[i].label, R * 0.6, 0);
      ctx.restore();
    }

    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#1E0A4B'; ctx.fill();
    ctx.strokeStyle = '#C084FC'; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = 'bold 14px Nunito'; ctx.fillStyle = '#fff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🎡', cx, cy);
  }

  function spinWheel(canvas, onComplete) {
    if (_wheelSpinning || !useWheelSpin()) return;
    _wheelSpinning = true;

    var prizeIdx = selectPrize();
    var prize = WHEEL_PRIZES[prizeIdx];
    var n = WHEEL_PRIZES.length;
    var arc = 360 / n;

    var targetAngle = 360 - (prizeIdx * arc + arc / 2);
    var totalSpin = 360 * 5 + targetAngle;

    var startTime = null;
    var duration = 4000;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function animate(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var angle = totalSpin * easeOut(progress);

      var ctx = canvas.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      renderWheel(canvas);
      ctx.restore();

      drawPointer(canvas);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        _wheelSpinning = false;
        if (window.Features) Features.addXP(prize.value, 'wheel_' + prize.label);
        if (onComplete) onComplete(prize);
      }
    }

    requestAnimationFrame(animate);
  }

  function drawPointer(canvas) {
    var ctx = canvas.getContext('2d');
    var cx = canvas.width / 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 10, 8);
    ctx.lineTo(cx + 10, 8);
    ctx.lineTo(cx, 28);
    ctx.closePath();
    ctx.fillStyle = '#F97316';
    ctx.shadowColor = 'rgba(249,115,22,0.5)'; ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }

  /* ============================================
     WIN SHARING
     ============================================ */
  function generateWinCard(win) {
    var canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 400;
    var ctx = canvas.getContext('2d');

    var grad = ctx.createLinearGradient(0, 0, 600, 400);
    grad.addColorStop(0, '#08051A');
    grad.addColorStop(0.5, '#2E1065');
    grad.addColorStop(1, '#4338CA');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 600, 400);

    ctx.globalAlpha = 0.06;
    ctx.beginPath(); ctx.arc(500, 80, 120, 0, Math.PI * 2);
    ctx.fillStyle = '#C084FC'; ctx.fill();
    ctx.beginPath(); ctx.arc(100, 350, 80, 0, Math.PI * 2);
    ctx.fillStyle = '#6D28D9'; ctx.fill();
    ctx.globalAlpha = 1;

    ctx.font = 'bold 28px Nunito, sans-serif';
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    ctx.fillText('Slot', 30, 50);
    ctx.fillStyle = '#C084FC';
    ctx.fillText('X', 95, 50);

    ctx.font = 'bold 16px Nunito, sans-serif';
    ctx.fillStyle = '#F97316'; ctx.textAlign = 'center';
    ctx.fillText('🏆 BIG WIN!', 300, 100);

    var amt = win.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    var cur = window.DataStore ? DataStore.getCurrencySymbol() : '₽';
    ctx.font = 'bold 48px Nunito, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(192,132,252,0.4)'; ctx.shadowBlur = 20;
    ctx.fillText(amt + ' ' + cur, 300, 170);
    ctx.shadowBlur = 0;

    if (win.mult > 0) {
      ctx.font = 'bold 24px Nunito, sans-serif';
      ctx.fillStyle = '#C084FC';
      ctx.fillText('x' + win.mult, 300, 210);
    }

    ctx.font = '600 18px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText((win.gameIcon || '🎰') + ' ' + (win.gameName || ''), 300, 260);

    var name = (window.TG && TG.userFirstName) ? TG.userFirstName : 'Player';
    ctx.font = '600 14px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Игрок: ' + name, 300, 300);

    ctx.fillStyle = 'rgba(109,40,217,0.3)';
    roundRect(ctx, 150, 330, 300, 44, 22); ctx.fill();
    ctx.font = 'bold 14px Nunito, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🎰 Играй бесплатно в SlotX!', 300, 357);

    return canvas;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function shareWin(win) {
    var link = window.Features ? Features.getReferralLink() : 'https://t.me/SlotXDemoBot/app';
    var amt = win.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    var cur = window.DataStore ? DataStore.getCurrencySymbol() : '₽';
    var text = '🏆 Я выиграл ' + amt + ' ' + cur;
    if (win.mult > 0) text += ' (x' + win.mult + ')';
    text += ' в ' + (win.gameName || 'SlotX') + '!\n\n';
    text += '🎁 Играй бесплатно → ' + link;

    try {
      var tg = window.Telegram && Telegram.WebApp;
      if (tg && tg.switchInlineQuery) {
        tg.switchInlineQuery(text, ['users', 'groups', 'channels']);
        return;
      }
    } catch(e) {}

    if (navigator.share) {
      navigator.share({ title: 'SlotX — Мой выигрыш!', text: text, url: link }).catch(function(){});
      return;
    }

    try { navigator.clipboard.writeText(text); } catch(e) {
      var ta = document.createElement('textarea'); ta.value = text;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    if (window.App) App.showToast('📋', '✅ Текст скопирован!');
  }

  /* ============================================
     FRIEND ACTIVITY
     ============================================ */
  var _activityTimer = null;
  var _activityShownCount = 0;
  var _usingRealActivity = false;

  function startFriendActivity() {
    if (_activityTimer) return;

    if (window.FirebaseService && FirebaseService.isConfigured() && FirebaseService.isReady()) {
      var ids = FirebaseService.getFriendIds();
      if (ids.length > 0) {
        _usingRealActivity = true;
        FirebaseService.watchFriends(ids);
        FirebaseService.onFriendActivity(function(icon, text) {
          if (window.App) App.showToast(icon, text);
        });
        return;
      }
    }

    var d = window.Features ? Features.getData() : {};
    var friends = d.referredUsers || [];
    if (friends.length === 0) return;

    var delay = 30000 + Math.random() * 30000;
    _activityTimer = setTimeout(function _tick() {
      if (_activityShownCount >= 5) return;
      _showSimulatedNotification(friends);
      _activityShownCount++;
      _activityTimer = setTimeout(_tick, 120000 + Math.random() * 180000);
    }, delay);
  }

  function _showSimulatedNotification(friends) {
    var games = window.DataStore ? DataStore.getActiveGames() : [];
    if (games.length === 0 || friends.length === 0) return;
    var h = simpleHash('friend_' + Date.now());
    var game = games[h % games.length];
    var friendIdx = h % friends.length;
    var friendNum = friendIdx + 1;
    var actions = [
      { icon: '🎮', text: 'Друг #' + friendNum + ' играет в ' + game.name + '!' },
      { icon: '🔥', text: 'Друг #' + friendNum + ' выиграл в ' + game.name + '!' },
      { icon: '⚡', text: 'Друг #' + friendNum + ' запустил ' + game.name }
    ];
    var action = actions[h % actions.length];
    if (window.App) App.showToast(action.icon, action.text);
  }

  function isUsingRealActivity() { return _usingRealActivity; }

  /* ============================================
     RENDER — Full Referral Section
     ============================================ */
  function renderFull(container) {
    var t = window.I18n ? I18n.t : function(k, f) { return f || k; };
    var d = window.Features ? Features.getData() : {};
    var refs = d.referrals || 0;
    var friends = d.referredUsers || [];
    var referredBy = d.referredBy;
    var spins = getSpinsAvailable();

    var html = '';

    /* --- MYSTERY INVITE BANNER --- */
    html += '<div style="padding:12px;border-radius:14px;background:linear-gradient(135deg,rgba(109,40,217,0.12),rgba(99,102,241,0.06));border:1px solid rgba(139,92,246,0.15);margin-bottom:10px;position:relative;overflow:hidden;text-align:center;">';
    html += '<div style="position:absolute;top:-8px;right:-8px;font-size:48px;opacity:0.05;">🎁</div>';
    html += '<div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:3px;">🤫 ' + t('referral.mystery', 'Пригласи друга — получите награду') + '</div>';
    html += '<div style="font-size:10px;color:var(--text-muted);line-height:1.4;">' + t('referral.mysteryDesc', 'Секретный бонус для тебя и для друга') + '</div>';
    if (refs > 0) {
      html += '<div style="display:flex;justify-content:center;gap:12px;margin-top:8px;">';
      html += '<span style="font-size:14px;font-weight:900;color:#fff;">' + refs + ' 👥</span>';
      html += '<span style="font-size:14px;font-weight:900;color:#C084FC;">🔒</span>';
      html += '</div>';
    }
    html += '</div>';

    /* --- FORTUNE WHEEL TEASER --- */
    if (spins > 0) {
      html += '<div id="wheel-teaser" class="interactive" style="padding:10px 12px;border-radius:12px;background:linear-gradient(135deg,rgba(249,115,22,0.1),rgba(109,40,217,0.06));border:1px solid rgba(249,115,22,0.15);margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:10px;">';
      html += '<span style="font-size:24px;">🎡</span>';
      html += '<div style="flex:1;"><div style="font-size:12px;font-weight:800;color:#F97316;">У вас ' + spins + ' спин' + pluralize(spins) + '!</div>';
      html += '<div style="font-size:9px;color:var(--text-muted);">Нажмите чтобы крутить</div></div>';
      html += '<i class="fa-solid fa-chevron-right" style="font-size:10px;color:#F97316;"></i>';
      html += '</div>';
    }

    /* --- ACTION BUTTONS --- */
    html += '<div style="display:flex;gap:6px;margin:8px 0;">';
    html += '<button id="btn-ref-invite" class="interactive" style="flex:1;padding:10px;border-radius:10px;background:var(--cta-gradient);color:#fff;font-weight:700;font-size:12px;border:none;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;"><i class="fa-solid fa-gift"></i> ' + t('referral.inviteFriend', 'Пригласить') + '</button>';
    html += '<button id="btn-ref-copy" class="interactive" style="width:42px;flex-shrink:0;padding:10px;border-radius:10px;background:rgba(109,40,217,0.08);color:#C084FC;font-size:13px;border:1px solid rgba(109,40,217,0.12);font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-link"></i></button>';
    html += '</div>';

    /* --- WIN SHARING --- */
    var bestWins = window.Features ? Features.getBestWins(3) : [];
    if (bestWins.length > 0) {
      html += '<div style="margin:12px 0;">';
      html += '<div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">📤 Поделиться выигрышем</div>';
      for (var w = 0; w < bestWins.length; w++) {
        var win = bestWins[w];
        var amt = win.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        var cur = window.DataStore ? DataStore.getCurrencySymbol() : '₽';
        var isBig = (win.mult >= 50) || (win.amount >= 500);
        var rowBg = isBig ? 'background:rgba(109,40,217,0.06);border:1px solid rgba(109,40,217,0.12);' : 'background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);';
        html += '<div class="win-share-row interactive" data-win-idx="' + w + '" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:12px;margin-bottom:4px;' + rowBg + 'cursor:pointer;">';
        html += '<span style="font-size:20px;">' + (win.gameIcon || '🎰') + '</span>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="font-size:11px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(win.gameName || '') + '</div>';
        html += '<div style="font-size:13px;font-weight:900;color:#C084FC;">' + amt + ' ' + esc(cur) + (win.mult > 0 ? ' <span style="color:#F97316;">x' + win.mult + '</span>' : '') + '</div>';
        html += '</div>';
        html += '<button class="btn-share-win interactive" style="padding:7px 12px;border-radius:10px;background:rgba(109,40,217,0.1);color:#C084FC;font-size:10px;font-weight:700;border:none;font-family:inherit;cursor:pointer;white-space:nowrap;"><i class="fa-solid fa-share-nodes"></i> Шеринг</button>';
        html += '</div>';
      }
      html += '</div>';
    }

    /* --- REFERRED BY --- */
    if (referredBy) {
      html += '<div style="padding:8px 12px;border-radius:10px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.12);margin:8px 0;text-align:left;">';
      html += '<div style="font-size:10px;color:#22C55E;font-weight:700;">✅ ' + t('referral.youReferred', 'Тебя пригласил друг') + ' 🎁</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);margin-top:2px;">' + t('referral.giftActivated', 'Секретный подарок активирован!') + '</div>';
      html += '</div>';
    }

    /* --- FRIEND TREE --- */
    if (friends.length > 0) {
      html += renderFriendTree(friends);
    } else {
      html += '<div style="text-align:center;padding:16px 0;margin:8px 0;">';
      html += '<div style="font-size:36px;margin-bottom:6px;">🌱</div>';
      html += '<div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:3px;">Дерево друзей пустое</div>';
      html += '<div style="font-size:10px;color:var(--text-muted);">Пригласите первого друга — получите спин колеса!</div>';
      html += '</div>';
    }

    /* (How it works removed) */

    container.innerHTML = html;

    /* --- Bind events --- */
    var invBtn = container.querySelector('#btn-ref-invite');
    var cpBtn = container.querySelector('#btn-ref-copy');
    if (invBtn) invBtn.addEventListener('click', function() { TG.haptic.medium(); if (window.Features) Features.shareReferral(); });
    if (cpBtn) cpBtn.addEventListener('click', function() { TG.haptic.light(); if (window.Features) Features.copyReferralLink(); });

    var wt = container.querySelector('#wheel-teaser');
    if (wt) wt.addEventListener('click', function() { TG.haptic.heavy(); openWheelModal(); });

    var shareBtns = container.querySelectorAll('.btn-share-win');
    for (var si = 0; si < shareBtns.length; si++) {
      (function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          TG.haptic.medium();
          var idx = parseInt(btn.closest('.win-share-row').getAttribute('data-win-idx'));
          if (bestWins[idx]) shareWin(bestWins[idx]);
        });
      })(shareBtns[si]);
    }

    startFriendActivity();
    _updateFriendStatuses(container);
  }

  /* ============================================
     FRIEND TREE — Compact chips
     ============================================ */
  function renderFriendTree(friends) {
    var html = '<div style="margin:8px 0;">';
    html += '<div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">🌳 Друзья (' + friends.length + ')</div>';

    var limit = Math.min(friends.length, 10);
    var avatarEmojis = ['🎮', '⭐', '💎', '🔥', '🎯', '🚀', '🌟', '💫', '🎪', '🎲'];
    var bgColors = ['#6D28D9', '#4338CA', '#7C3AED', '#2E1065', '#3730A3', '#4F46E5', '#6366F1', '#8B5CF6'];

    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    for (var i = 0; i < limit; i++) {
      var f = friends[i];
      var seed = simpleHash('friend_av_' + (f.id || i));
      var avatar = avatarEmojis[seed % avatarEmojis.length];
      var bgColor = bgColors[seed % bgColors.length];

      html += '<div class="friend-status" data-friend-id="' + (f.id || '') + '" style="display:flex;align-items:center;gap:6px;padding:4px 8px 4px 4px;border-radius:20px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.04);">';
      html += '<div style="width:22px;height:22px;border-radius:50%;background:' + bgColor + ';display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;">' + avatar + '</div>';
      html += '<span style="font-size:10px;font-weight:600;color:var(--text-secondary);">#' + (i + 1) + '</span>';
      html += '</div>';
    }
    if (friends.length > limit) {
      html += '<div style="display:flex;align-items:center;padding:4px 10px;border-radius:20px;background:rgba(109,40,217,0.06);border:1px solid rgba(109,40,217,0.1);">';
      html += '<span style="font-size:10px;font-weight:700;color:#C084FC;">+' + (friends.length - limit) + '</span>';
      html += '</div>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  /* ============================================
     HOW IT WORKS — plain text, no emojis
     ============================================ */
  function renderHowItWorks() {
    var html = '<div style="margin:8px 0;padding:10px 12px;border-radius:12px;background:rgba(109,40,217,0.04);border:1px solid rgba(109,40,217,0.08);">';
    html += '<div style="font-size:9px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Как это работает</div>';

    html += '<div style="display:flex;flex-direction:column;gap:4px;">';

    html += '<div style="display:flex;align-items:center;gap:6px;">';
    html += '<span style="width:14px;height:14px;border-radius:50%;background:rgba(109,40,217,0.15);color:#A78BFA;font-size:7px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">1</span>';
    html += '<span style="font-size:10px;color:var(--text-secondary);">Отправьте ссылку другу</span>';
    html += '</div>';

    html += '<div style="display:flex;align-items:center;gap:6px;">';
    html += '<span style="width:14px;height:14px;border-radius:50%;background:rgba(109,40,217,0.15);color:#A78BFA;font-size:7px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">2</span>';
    html += '<span style="font-size:10px;color:var(--text-secondary);">Друг заходит и получает +50 XP</span>';
    html += '</div>';

    html += '<div style="display:flex;align-items:center;gap:6px;">';
    html += '<span style="width:14px;height:14px;border-radius:50%;background:rgba(109,40,217,0.15);color:#A78BFA;font-size:7px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">3</span>';
    html += '<span style="font-size:10px;color:var(--text-secondary);">Вы получаете +200 XP и спин колеса</span>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  /* ============================================
     FORTUNE WHEEL MODAL
     ============================================ */
  function openWheelModal() {
    var modal = document.getElementById('modal-wheel');
    if (!modal) return;
    if (window.App) App.showModal(modal);

    var canvas = document.getElementById('wheel-canvas');
    if (canvas) {
      renderWheel(canvas);
      drawPointer(canvas);
    }

    var spinBtn = document.getElementById('btn-spin-wheel');
    var spinCount = document.getElementById('wheel-spins-count');
    var resultEl = document.getElementById('wheel-result');
    if (spinCount) spinCount.textContent = getSpinsAvailable();
    if (resultEl) resultEl.style.display = 'none';

    if (spinBtn) {
      var newBtn = spinBtn.cloneNode(true);
      spinBtn.parentNode.replaceChild(newBtn, spinBtn);
      newBtn.addEventListener('click', function() {
        if (_wheelSpinning) return;
        if (!canSpin() && getSpinsAvailable() <= 0) {
          if (window.App) App.showToast('🎡', 'Нет спинов! Пригласите друга');
          return;
        }
        TG.haptic.heavy();
        if (window.App) App.playSound('click');
        spinWheel(canvas, function(prize) {
          TG.haptic.heavy();
          if (window.App) {
            App.playSound('confetti');
            App.fireConfetti(window.innerWidth / 2, window.innerHeight / 2);
          }

          if (resultEl) {
            resultEl.style.display = '';
            resultEl.innerHTML = '<div style="font-size:32px;margin-bottom:4px;">🎉</div><div style="font-size:18px;font-weight:900;color:#F97316;">' + prize.label + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:3px;">Награда начислена!</div>';
          }
          var sc = document.getElementById('wheel-spins-count');
          if (sc) sc.textContent = getSpinsAvailable();

          setTimeout(function() {
            var rc = document.getElementById('referral-container');
            if (rc) renderFull(rc);
          }, 1500);
        });
      });
    }
  }

  /* ============================================
     FRIEND STATUS — Real-time online badges
     ============================================ */
  function _updateFriendStatuses(container) {
    if (!window.FirebaseService || !FirebaseService.isReady()) return;
    var ids = FirebaseService.getFriendIds();
    if (ids.length === 0) return;

    FirebaseService.getFriendsStatus(ids).then(function(statuses) {
      if (!statuses || statuses.length === 0) return;
      var statusMap = {};
      for (var i = 0; i < statuses.length; i++) {
        statusMap[statuses[i].id] = statuses[i];
      }

      var badges = container.querySelectorAll('.friend-status');
      for (var j = 0; j < badges.length; j++) {
        var fid = badges[j].getAttribute('data-friend-id');
        if (!fid || !statusMap[fid]) continue;
        var s = statusMap[fid];
        var isRecent = (Date.now() - (s.updatedAt || 0)) < 300000;

        if (s.status === 'playing' && isRecent) {
          badges[j].innerHTML = '<span style="display:inline-flex;align-items:center;gap:3px;"><span style="width:6px;height:6px;border-radius:50%;background:#22C55E;animation:pulse-dot 1.5s infinite;"></span> ' + esc(s.gameName || 'Играет') + '</span>';
          badges[j].style.color = '#22C55E';
        } else if (s.lastWin && s.lastWin.amount > 0 && isRecent) {
          var wCur = window.DataStore ? DataStore.getCurrencySymbol() : '\u20bd';
          badges[j].innerHTML = '\ud83c\udfc6 ' + s.lastWin.amount.toFixed(0) + ' ' + wCur;
          badges[j].style.color = '#F97316';
        } else if (isRecent) {
          badges[j].innerHTML = '<span style="display:inline-flex;align-items:center;gap:3px;"><span style="width:5px;height:5px;border-radius:50%;background:var(--text-muted);"></span> Был недавно</span>';
          badges[j].style.color = 'var(--text-muted)';
        }
      }
    }).catch(function() {});
  }

  /* ============================================
     HELPERS
     ============================================ */
  function pluralize(n) {
    if (n % 10 === 1 && n % 100 !== 11) return '';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'а';
    return 'ов';
  }

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ============================================
     PUBLIC API
     ============================================ */
  return {
    /* Wheel */
    addWheelSpin: addWheelSpin,
    canSpin: canSpin,
    getSpinsAvailable: getSpinsAvailable,
    openWheelModal: openWheelModal,
    /* Win sharing */
    shareWin: shareWin,
    generateWinCard: generateWinCard,
    /* Activity */
    startFriendActivity: startFriendActivity,
    isUsingRealActivity: isUsingRealActivity,
    /* Render */
    renderFull: renderFull
  };

})();
