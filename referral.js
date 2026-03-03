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
     BEAUTIFUL WIN CARD GENERATOR — Canvas
     ============================================ */
  function generateWinCard(win) {
    var canvas = document.createElement('canvas');
    var W = 720, H = 480;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');

    /* --- Background gradient --- */
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#030510');
    grad.addColorStop(0.3, '#0C0620');
    grad.addColorStop(0.6, '#1E0A4B');
    grad.addColorStop(1, '#2E1065');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    /* --- Decorative circles --- */
    ctx.globalAlpha = 0.08;
    ctx.beginPath(); ctx.arc(600, 60, 160, 0, Math.PI * 2);
    ctx.fillStyle = '#7C3AED'; ctx.fill();
    ctx.beginPath(); ctx.arc(120, 420, 120, 0, Math.PI * 2);
    ctx.fillStyle = '#4338CA'; ctx.fill();
    ctx.beginPath(); ctx.arc(360, 240, 200, 0, Math.PI * 2);
    ctx.fillStyle = '#6D28D9'; ctx.fill();
    ctx.globalAlpha = 1;

    /* --- Stars/sparkles decoration --- */
    ctx.globalAlpha = 0.15;
    var sparkles = [[80,60], [650,100], [100,350], [620,380], [300,50], [500,430], [180,180], [550,250]];
    for (var si = 0; si < sparkles.length; si++) {
      _drawStar(ctx, sparkles[si][0], sparkles[si][1], 3 + (si % 3) * 2);
    }
    ctx.globalAlpha = 1;

    /* --- Top bar with logo --- */
    ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText('Slot', 30, 42);
    ctx.fillStyle = '#C084FC';
    ctx.fillText('X', 82, 42);
    ctx.font = '600 11px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('DEMO SLOTS', 110, 42);

    /* --- Date --- */
    ctx.textAlign = 'right';
    ctx.font = '500 12px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    var dt = new Date(win.ts || Date.now());
    ctx.fillText(dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }), W - 30, 42);

    /* --- BIG WIN banner --- */
    ctx.textAlign = 'center';
    var isMega = (win.mult >= 100) || (win.amount >= 5000);
    var isHuge = (win.mult >= 50) || (win.amount >= 1000);

    /* Glow behind text */
    ctx.shadowColor = isMega ? 'rgba(249,115,22,0.6)' : 'rgba(192,132,252,0.5)';
    ctx.shadowBlur = 40;
    ctx.font = 'bold 18px Nunito, sans-serif';
    ctx.fillStyle = isMega ? '#F97316' : isHuge ? '#C084FC' : '#A78BFA';
    var winLabel = isMega ? '🔥 MEGA WIN! 🔥' : isHuge ? '🏆 BIG WIN!' : '⭐ WIN!';
    ctx.fillText(winLabel, W / 2, 100);
    ctx.shadowBlur = 0;

    /* --- Game icon + name --- */
    ctx.font = '600 20px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText((win.gameIcon || '🎰') + '  ' + (win.gameName || 'SlotX'), W / 2, 140);

    /* --- Divider line --- */
    var divGrad = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.5, 'rgba(192,132,252,0.3)');
    divGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = divGrad;
    ctx.fillRect(W * 0.15, 158, W * 0.7, 1);

    /* --- Main win amount --- */
    var amt = _fmtMoney(win.amount);
    var cur = window.DataStore ? DataStore.getCurrencySymbol() : '₽';

    ctx.shadowColor = isMega ? 'rgba(249,115,22,0.5)' : 'rgba(192,132,252,0.4)';
    ctx.shadowBlur = 30;
    ctx.font = 'bold 56px Nunito, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(amt + ' ' + cur, W / 2, 225);
    ctx.shadowBlur = 0;

    /* --- Multiplier --- */
    if (win.mult > 0) {
      var multColor = isMega ? '#F97316' : '#C084FC';
      /* Pill background */
      var multText = 'x' + win.mult;
      ctx.font = 'bold 28px Nunito, sans-serif';
      var mw = ctx.measureText(multText).width + 32;
      _roundRect(ctx, (W - mw) / 2, 248, mw, 40, 20);
      ctx.fillStyle = isMega ? 'rgba(249,115,22,0.15)' : 'rgba(192,132,252,0.12)';
      ctx.fill();
      ctx.strokeStyle = isMega ? 'rgba(249,115,22,0.3)' : 'rgba(192,132,252,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = multColor;
      ctx.textAlign = 'center';
      ctx.fillText(multText, W / 2, 276);
    }

    /* --- Player info --- */
    var name = (window.TG && TG.userFirstName) ? TG.userFirstName : 'Player';
    ctx.font = '600 14px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('👤 Игрок: ' + name, W / 2, 325);

    /* --- Bottom CTA card --- */
    _roundRect(ctx, 140, 360, W - 280, 56, 28);
    var ctaGrad = ctx.createLinearGradient(140, 360, W - 140, 416);
    ctaGrad.addColorStop(0, '#2E1065');
    ctaGrad.addColorStop(0.5, '#4338CA');
    ctaGrad.addColorStop(1, '#6D28D9');
    ctx.fillStyle = ctaGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(192,132,252,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = 'bold 15px Nunito, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🎰 Играй бесплатно в SlotX!', W / 2, 394);

    /* --- Bottom note --- */
    ctx.font = '500 10px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText('t.me/SlotXDemoBot/app', W / 2, 445);

    /* --- Border frame --- */
    ctx.strokeStyle = 'rgba(139,92,246,0.15)';
    ctx.lineWidth = 2;
    _roundRect(ctx, 6, 6, W - 12, H - 12, 20);
    ctx.stroke();

    return canvas;
  }

  function _drawStar(ctx, x, y, r) {
    ctx.save();
    ctx.fillStyle = '#C084FC';
    ctx.beginPath();
    for (var i = 0; i < 4; i++) {
      var a = (i / 4) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      var a2 = a + Math.PI / 4;
      ctx.lineTo(x + Math.cos(a2) * r * 0.4, y + Math.sin(a2) * r * 0.4);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function _fmtMoney(n) {
    return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function _roundRect(ctx, x, y, w, h, r) {
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

  /* ============================================
     BEAUTIFUL SHARE MESSAGES
     ============================================ */

  /* Share win — with image if possible */
  function shareWin(win) {
    var link = window.Features ? Features.getReferralLink() : 'https://t.me/SlotXDemoBot/app';
    var amt = _fmtMoney(win.amount);
    var cur = window.DataStore ? DataStore.getCurrencySymbol() : '₽';
    var isMega = (win.mult >= 100) || (win.amount >= 5000);
    var isHuge = (win.mult >= 50) || (win.amount >= 1000);

    /* Build beautiful text message */
    var text = '';
    if (isMega) {
      text += '🔥🔥🔥 МЕГА ВЫИГРЫШ! 🔥🔥🔥\n\n';
    } else if (isHuge) {
      text += '🏆💰 КРУПНЫЙ ВЫИГРЫШ! 💰🏆\n\n';
    } else {
      text += '⭐ Мой выигрыш в SlotX! ⭐\n\n';
    }

    text += '🎰 Игра: ' + (win.gameName || 'SlotX') + '\n';
    text += '💎 Выигрыш: ' + amt + ' ' + cur + '\n';
    if (win.mult > 0) text += '⚡ Множитель: x' + win.mult + '\n';
    text += '\n';
    text += '━━━━━━━━━━━━━━━━\n';
    text += '🎁 Попробуй сам — демо-слоты бесплатно!\n';
    text += '👉 ' + link;

    /* Try to share as image first */
    _shareWithImage(win, text, link);
  }

  function _shareWithImage(win, text, link) {
    /* Generate canvas image */
    var canvas = generateWinCard(win);

    /* Try Web Share API with file (image) */
    if (navigator.share && navigator.canShare) {
      canvas.toBlob(function(blob) {
        if (!blob) { _shareTextOnly(text, link); return; }
        var file = new File([blob], 'slotx-win.png', { type: 'image/png' });
        var shareData = { text: text, files: [file] };

        if (navigator.canShare(shareData)) {
          navigator.share(shareData).catch(function() {
            _shareTextOnly(text, link);
          });
        } else {
          _shareTextOnly(text, link);
        }
      }, 'image/png');
      return;
    }

    /* Fallback: try TG inline share */
    _shareTextOnly(text, link);
  }

  function _shareTextOnly(text, link) {
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
    if (window.App) App.showToast('📋', '✅ Скопировано!');
  }

  /* Beautiful referral invite messages */
  function shareReferralBeautiful() {
    var link = window.Features ? Features.getReferralLink() : 'https://t.me/SlotXDemoBot/app';
    var d = window.Features ? Features.getData() : {};
    var wins = d.wins || [];
    var bestWin = d.biggestWin || 0;
    var cur = window.DataStore ? DataStore.getCurrencySymbol() : '₽';

    /* Pick a random invite style */
    var styles = [];

    styles.push(
      '🎰✨ Нашёл крутые демо-слоты! ✨🎰\n\n' +
      '🎮 100+ игр от Pragmatic Play\n' +
      '💎 Полностью бесплатно\n' +
      '🏆 Соревнуйся с друзьями\n\n' +
      '🎁 Секретный бонус для нас обоих!\n' +
      '👉 ' + link
    );

    styles.push(
      '🤫 Пссс... нашёл кое-что интересное!\n\n' +
      '🎰 SlotX — бесплатные демо-слоты\n' +
      '⚡ Играй без вложений\n' +
      '🔥 Реальный азарт, нулевой риск\n\n' +
      '🎁 Заходи по ссылке — получишь бонус 🎁\n' +
      '👉 ' + link
    );

    styles.push(
      '💥 Зацени — играю в слоты бесплатно!\n\n' +
      '🎰 Pragmatic Play слоты в демо-режиме\n' +
      '🌍 49 валют, 100+ игр\n' +
      '🏆 Топовые хиты: Sweet Bonanza, Gates of Olympus\n\n' +
      '🎁 Тебе бонус за регистрацию!\n' +
      '👉 ' + link
    );

    /* If user has wins, add a brag message */
    if (bestWin > 500) {
      styles.push(
        '🔥 Только что выиграл ' + _fmtMoney(bestWin) + ' ' + cur + ' в SlotX!\n\n' +
        '🎰 Бесплатные демо-слоты — никакого риска\n' +
        '💎 Попробуй переплюнуть мой рекорд!\n\n' +
        '🎁 Бонус при регистрации по моей ссылке:\n' +
        '👉 ' + link
      );
    }

    if (wins.length > 5) {
      styles.push(
        '🏆 У меня уже ' + wins.length + ' выигрышей в SlotX!\n\n' +
        '🎰 Крутые демо-слоты Pragmatic Play\n' +
        '💰 Рекорд: ' + _fmtMoney(bestWin) + ' ' + cur + '\n' +
        '⚡ Абсолютно бесплатно\n\n' +
        '🎁 Заходи — бонус активируется автоматически:\n' +
        '👉 ' + link
      );
    }

    var text = styles[Math.floor(Math.random() * styles.length)];

    /* Try TG native share first */
    try {
      var tg = window.Telegram && Telegram.WebApp;
      if (tg && tg.switchInlineQuery) {
        tg.switchInlineQuery(text, ['users', 'groups', 'channels']);
        return;
      }
    } catch(e) {}

    if (navigator.share) {
      navigator.share({ title: 'SlotX — Бесплатные демо-слоты', text: text, url: link }).catch(function(){});
      return;
    }

    try { navigator.clipboard.writeText(text); } catch(e) {
      var ta = document.createElement('textarea'); ta.value = text;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    if (window.App) App.showToast('📋', '✅ Ссылка скопирована!');
  }

  /* Friend activity — notifications removed, status display only */
  function startFriendActivity() {
    /* Only start Firebase watching for status badges — no toasts */
    if (window.FirebaseService && FirebaseService.isConfigured() && FirebaseService.isReady()) {
      var ids = FirebaseService.getFriendIds();
      if (ids.length > 0) {
        FirebaseService.watchFriends(ids);
      }
    }
  }

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

    /* --- WIN SHARING — Best wins with share buttons --- */
    var _rawBestWins = window.Features ? Features.getBestWins(10) : [];
    /* Deduplicate: only show best win per unique game */
    var _seenGames = {};
    var bestWins = [];
    for (var _uw = 0; _uw < _rawBestWins.length && bestWins.length < 3; _uw++) {
      var _wKey = (_rawBestWins[_uw].gameId || '') + '_' + Math.round(_rawBestWins[_uw].amount);
      if (!_seenGames[_rawBestWins[_uw].gameId || '']) {
        _seenGames[_rawBestWins[_uw].gameId || ''] = true;
        bestWins.push(_rawBestWins[_uw]);
      }
    }
    if (bestWins.length > 0) {
      html += '<div style="margin:12px 0;">';
      html += '<div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">📤 Поделиться выигрышем</div>';
      for (var w = 0; w < bestWins.length; w++) {
        var win = bestWins[w];
        var amt = _fmtMoney(win.amount);
        var cur = window.DataStore ? DataStore.getCurrencySymbol() : '₽';
        var isBig = (win.mult >= 50) || (win.amount >= 500);
        var rowBg = isBig ? 'background:rgba(109,40,217,0.06);border:1px solid rgba(109,40,217,0.12);' : 'background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);';
        html += '<div class="win-share-row interactive" data-win-idx="' + w + '" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:12px;margin-bottom:4px;' + rowBg + 'cursor:pointer;">';
        html += '<span style="font-size:20px;">' + (win.gameIcon || '🎰') + '</span>';
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="font-size:11px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(win.gameName || '') + '</div>';
        html += '<div style="font-size:13px;font-weight:900;color:#C084FC;">' + amt + ' ' + esc(cur) + (win.mult > 0 ? ' <span style="color:#F97316;">x' + win.mult + '</span>' : '') + '</div>';
        html += '</div>';
        html += '<button class="btn-share-win interactive" style="padding:7px 12px;border-radius:10px;background:linear-gradient(135deg,rgba(109,40,217,0.15),rgba(67,56,202,0.08));color:#C084FC;font-size:10px;font-weight:700;border:1px solid rgba(139,92,246,0.2);font-family:inherit;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:4px;"><i class="fa-solid fa-share-nodes"></i> Шеринг</button>';
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

    container.innerHTML = html;

    /* --- Bind events --- */
    var invBtn = container.querySelector('#btn-ref-invite');
    var cpBtn = container.querySelector('#btn-ref-copy');
    if (invBtn) invBtn.addEventListener('click', function() { TG.haptic.medium(); shareReferralBeautiful(); });
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
    var t = window.I18n ? I18n.t : function(k, f) { return f || k; };
    var cur = window.DataStore ? DataStore.getCurrencySymbol() : '₽';
    var d = window.Features ? Features.getData() : {};
    var wins = d.wins || [];
    var html = '<div style="margin:8px 0;">';
    html += '<div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">🌳 ' + t('referral.friendTree', 'Дерево друзей') + ' (' + friends.length + ')</div>';

    var limit = Math.min(friends.length, 15);
    var avatarEmojis = ['🎮', '⭐', '💎', '🔥', '🎯', '🚀', '🌟', '💫', '🎪', '🎲'];
    var bgColors = ['#6D28D9', '#4338CA', '#7C3AED', '#2E1065', '#3730A3', '#4F46E5', '#6366F1', '#8B5CF6'];
    var lang = window.I18n ? I18n.getLang() : 'ru';

    for (var i = 0; i < limit; i++) {
      var f = friends[i];
      var seed = simpleHash('friend_av_' + (f.id || i));
      var avatar = avatarEmojis[seed % avatarEmojis.length];
      var bgColor = bgColors[seed % bgColors.length];
      var joinDate = f.ts ? new Date(f.ts) : null;
      var dateStr = joinDate ? joinDate.toLocaleDateString(lang, { day: 'numeric', month: 'short' }) : '';

      /* Find best win for this friend (simulated — based on friend seed) */
      var friendBestWin = _simulateFriendBestWin(f.id || String(i), seed);

      var isLast = (i === limit - 1) && (friends.length <= limit);

      html += '<div class="friend-status" data-friend-id="' + (f.id || '') + '" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);margin-bottom:4px;">';

      /* Avatar circle */
      html += '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,' + bgColor + ',rgba(139,92,246,0.3));display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;border:2px solid rgba(139,92,246,0.2);">' + avatar + '</div>';

      /* Info block */
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="display:flex;align-items:center;gap:6px;">';
      html += '<span style="font-size:12px;font-weight:700;color:var(--text-primary);">' + t('referral.friend', 'Друг') + ' #' + (i + 1) + '</span>';
      if (dateStr) html += '<span style="font-size:8px;color:var(--text-muted);font-weight:500;">с ' + dateStr + '</span>';
      html += '</div>';

      /* Best win line */
      if (friendBestWin) {
        html += '<div style="display:flex;align-items:center;gap:4px;margin-top:2px;">';
        html += '<span style="font-size:11px;">' + friendBestWin.icon + '</span>';
        html += '<span style="font-size:10px;font-weight:600;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(friendBestWin.game) + '</span>';
        html += '<span style="font-size:10px;font-weight:800;color:#C084FC;white-space:nowrap;margin-left:auto;">' + _fmtMoney(friendBestWin.amount) + ' ' + esc(cur) + '</span>';
        html += '</div>';
      } else {
        html += '<div style="font-size:9px;color:var(--text-muted);margin-top:2px;">🎰 Ещё не играл</div>';
      }

      html += '</div>';

      /* Status badge — online/offline */
      html += '<div class="friend-online-badge" data-friend-id="' + (f.id || '') + '" style="text-align:right;flex-shrink:0;">';
      html += '<div style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);">';
      html += '<span style="width:6px;height:6px;border-radius:50%;background:var(--text-muted);flex-shrink:0;"></span>';
      html += '<span style="font-size:9px;font-weight:600;color:var(--text-muted);">Оффлайн</span>';
      html += '</div></div>';

      html += '</div>';
    }

    if (friends.length > limit) {
      html += '<div style="text-align:center;padding:6px;border-radius:10px;background:rgba(109,40,217,0.04);border:1px solid rgba(109,40,217,0.08);margin-top:4px;">';
      html += '<span style="font-size:10px;font-weight:700;color:#C084FC;">+ ещё ' + (friends.length - limit) + ' друзей</span>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /* Simulate a "best win" for a friend based on their ID seed */
  function _simulateFriendBestWin(friendId, seed) {
    var games = window.DataStore ? DataStore.getActiveGames() : [];
    if (games.length === 0) return null;

    /* 70% chance friend has a notable win */
    if (seed % 100 > 70) return null;

    var gameIdx = seed % games.length;
    var game = games[gameIdx];
    var h = simpleHash(friendId + '_bestwin');

    /* Generate realistic win amount */
    var amounts = [45.50, 78.20, 123.00, 256.80, 312.50, 489.70, 567.00, 890.40, 1250.00, 1875.50, 2340.00, 3456.00, 5678.90];
    var amount = amounts[h % amounts.length];

    return {
      game: game.name,
      icon: game.icon || '🎰',
      amount: amount
    };
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
    if (!window.FirebaseService || !FirebaseService.isReady()) {
      /* No Firebase — simulate random online/offline for demo */
      _simulateOnlineStatuses(container);
      return;
    }
    var ids = FirebaseService.getFriendIds();
    if (ids.length === 0) { _simulateOnlineStatuses(container); return; }

    FirebaseService.getFriendsStatus(ids).then(function(statuses) {
      if (!statuses || statuses.length === 0) { _simulateOnlineStatuses(container); return; }
      var statusMap = {};
      for (var i = 0; i < statuses.length; i++) {
        statusMap[statuses[i].id] = statuses[i];
      }

      var badges = container.querySelectorAll('.friend-online-badge');
      for (var j = 0; j < badges.length; j++) {
        var fid = badges[j].getAttribute('data-friend-id');
        if (!fid || !statusMap[fid]) continue;
        var s = statusMap[fid];
        var isRecent = (Date.now() - (s.updatedAt || 0)) < 300000;

        if (s.status === 'playing' && isRecent) {
          _setBadge(badges[j], 'playing', s.gameName || 'Играет');
        } else if (isRecent) {
          _setBadge(badges[j], 'online', 'Онлайн');
        } else {
          _setBadge(badges[j], 'offline', 'Оффлайн');
        }
      }
    }).catch(function() { _simulateOnlineStatuses(container); });
  }

  function _simulateOnlineStatuses(container) {
    var badges = container.querySelectorAll('.friend-online-badge');
    for (var j = 0; j < badges.length; j++) {
      /* Demo: hardcode different statuses so user sees all 3 variants */
      if (j === 0) {
        /* First friend — playing a game */
        var games = window.DataStore ? DataStore.getActiveGames() : [];
        var gameName = games.length > 0 ? games[0].name : 'Sweet Bonanza';
        _setBadge(badges[j], 'playing', gameName);
      } else if (j === 1) {
        /* Second friend — online */
        _setBadge(badges[j], 'online', 'Онлайн');
      } else {
        /* Third+ friend — offline */
        _setBadge(badges[j], 'offline', 'Оффлайн');
      }
    }
  }

  function _setBadge(el, status, label) {
    var dotHtml, textColor, bgColor, borderColor;
    if (status === 'playing') {
      dotHtml = '<span style="width:6px;height:6px;border-radius:50%;background:#22C55E;flex-shrink:0;box-shadow:0 0 4px #22C55E;animation:pulse-dot 1.5s infinite;"></span>';
      textColor = '#22C55E';
      bgColor = 'rgba(34,197,94,0.08)';
      borderColor = 'rgba(34,197,94,0.15)';
    } else if (status === 'online') {
      dotHtml = '<span style="width:6px;height:6px;border-radius:50%;background:#22C55E;flex-shrink:0;"></span>';
      textColor = '#22C55E';
      bgColor = 'rgba(34,197,94,0.06)';
      borderColor = 'rgba(34,197,94,0.12)';
    } else {
      dotHtml = '<span style="width:6px;height:6px;border-radius:50%;background:var(--text-muted);flex-shrink:0;opacity:0.4;"></span>';
      textColor = 'var(--text-muted)';
      bgColor = 'rgba(255,255,255,0.03)';
      borderColor = 'rgba(255,255,255,0.05)';
    }
    var truncLabel = label.length > 14 ? label.substring(0, 13) + '…' : label;
    el.innerHTML = '<div style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;background:' + bgColor + ';border:1px solid ' + borderColor + ';">' +
      dotHtml +
      '<span style="font-size:9px;font-weight:600;color:' + textColor + ';white-space:nowrap;">' + esc(truncLabel) + '</span>' +
      '</div>';
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
    shareReferralBeautiful: shareReferralBeautiful,
    /* Activity */
    startFriendActivity: startFriendActivity,
    /* Render */
    renderFull: renderFull
  };

})();
