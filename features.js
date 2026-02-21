/* ============================================
   FEATURES.JS — Stories-Banners (from casinos), Leaderboard,
   Bonus Buy, Notifications, Themes, Stats, Skeleton
   ============================================ */

/* ---- SKELETON (runs immediately before DOMContentLoaded) ---- */
(function() {
  var rows = ['popular-row', 'top-row', 'new-row', 'bonusbuy-row'];
  for (var r = 0; r < rows.length; r++) {
    var el = document.getElementById(rows[r]);
    if (el && el.children.length === 0) {
      var html = '';
      for (var i = 0; i < 4; i++) {
        html += '<div class="skeleton-card flex-shrink-0" style="width:200px;height:112px;border-radius:16px;"></div>';
      }
      el.innerHTML = html;
    }
  }
})();

document.addEventListener('DOMContentLoaded', function() {

  var SH;

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function waitReady(cb) {
    if (window.slotHub && DataStore && DataStore._ready) return cb();
    setTimeout(function() { waitReady(cb); }, 80);
  }

  waitReady(function() {
    SH = window.slotHub;
    initStoriesBanners();
    initBonusBuy();
    initLeaderboard();
    initStats();
    initThemes();
    setTimeout(initNotifications, 30000);
  });

  /* ============================================
     BANNER CAROUSEL (built from casinos — single source of truth)
     ============================================ */
  var storyData = [];
  var currentStoryIdx = 0;
  var storyAutoTimer = null;
  var storyProgressInterval = null;
  var STORY_DURATION = 5000;

  var bannerIdx = 0;
  var bannerAutoTimer = null;

  function initStoriesBanners() {
    buildStoryData();
    renderStoryBanners();
    initStoryViewer();
    initBannerSwipe();

    /* Take over banner rendering from app.js */
    window._storiesMode = true;
    window.slotHub.renderStoriesBanners = function() {
      buildStoryData();
      renderStoryBanners();
    };
  }

  function buildStoryData() {
    storyData = [];
    var casinos = DataStore.getActiveCasinos();
    var decoEmojis = ['🎰','💎','🎁','⚡','🏆','🔥','💰','🃏','🎲'];

    for (var i = 0; i < casinos.length; i++) {
      var c = casinos[i];
      storyData.push({
        id: 'sc_' + c.id,
        gradient: c.color || 'linear-gradient(135deg,#FF006E,#8B5CF6)',
        image: c.bannerImage || '',
        title: c.bannerTitle || c.bonus || c.name,
        subtitle: c.bannerSubtitle || c.name,
        url: c.url,
        badge: c.badge,
        deco: decoEmojis[i % decoEmojis.length],
        cta: 'Забрать бонус →'
      });
    }
  }

  function renderStoryBanners() {
    var track = document.getElementById('banner-track');
    var dots = document.getElementById('banner-dots');
    var carousel = document.getElementById('banner-carousel');
    if (!track) return;

    track.innerHTML = '';
    dots.innerHTML = '';

    if (storyData.length === 0) {
      carousel.style.display = 'none';
      dots.style.display = 'none';
      return;
    }

    carousel.style.display = '';
    dots.style.display = '';

    for (var i = 0; i < storyData.length; i++) {
      var s = storyData[i];
      var slide = document.createElement('a');
      slide.href = s.url || '#';
      slide.target = '_blank';
      slide.rel = 'noopener noreferrer';
      slide.className = 'banner-slide';
      slide.style.background = s.gradient;
      slide.style.textDecoration = 'none';
      slide.style.color = 'inherit';

      var inner = '';
      if (s.image) {
        inner += '<img src="' + esc(s.image) + '" class="banner-slide-img" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'">';
      }

      inner += '<div class="banner-deco">' + s.deco + '</div>';
      inner += '<div class="banner-slide-content">';
      if (s.badge) inner += '<span class="banner-badge">' + esc(s.badge) + '</span>';
      inner += '<p class="banner-title">' + esc(s.title) + '</p>';
      inner += '<p class="banner-subtitle">' + esc(s.subtitle) + '</p>';
      inner += '<div class="banner-cta">' + esc(s.cta) + ' <i class="fa-solid fa-arrow-right" style="font-size:10px;"></i></div>';
      inner += '</div>';

      slide.innerHTML = inner;

      (function(idx, slideEl) {
        slideEl.addEventListener('click', function() {
          if (SH) SH.haptic('medium');
        });
      })(i, slide);

      track.appendChild(slide);

      var dot = document.createElement('div');
      dot.className = 'banner-dot' + (i === 0 ? ' active' : '');
      (function(idx) {
        dot.addEventListener('click', function(e) {
          e.stopPropagation();
          goToBannerLocal(idx);
        });
      })(i);
      dots.appendChild(dot);
    }

    bannerIdx = 0;
    updateBannerPosLocal();
    startBannerAutoLocal();
  }

  function goToBannerLocal(idx) {
    if (storyData.length === 0) return;
    bannerIdx = ((idx % storyData.length) + storyData.length) % storyData.length;
    updateBannerPosLocal();
    startBannerAutoLocal();
  }

  function updateBannerPosLocal() {
    var track = document.getElementById('banner-track');
    var slides = track.querySelectorAll('.banner-slide');
    if (slides.length > 0) {
      var w = slides[0].offsetWidth;
      var gap = 10;
      track.style.transform = 'translateX(-' + (bannerIdx * (w + gap)) + 'px)';
    }
    var dots = document.getElementById('banner-dots').querySelectorAll('.banner-dot');
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === bannerIdx);
    }
  }

  function startBannerAutoLocal() {
    if (bannerAutoTimer) clearInterval(bannerAutoTimer);
    bannerAutoTimer = setInterval(function() {
      if (storyData.length > 1) {
        bannerIdx = (bannerIdx + 1) % storyData.length;
        updateBannerPosLocal();
      }
    }, 5000);
  }

  function initBannerSwipe() {
    var carousel = document.getElementById('banner-carousel');
    var startX = 0, isDragging = false;
    carousel.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX; isDragging = true;
    }, { passive: true });
    carousel.addEventListener('touchend', function(e) {
      if (!isDragging) return; isDragging = false;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) goToBannerLocal(bannerIdx + 1);
        else goToBannerLocal(bannerIdx - 1);
      }
    }, { passive: true });
  }

  /* ---- Story Viewer (fullscreen) ---- */
  function initStoryViewer() {
    var viewer = document.getElementById('story-viewer');
    if (!viewer) return;

    document.getElementById('story-close').addEventListener('click', closeStory);
    document.getElementById('story-nav-left').addEventListener('click', function() {
      showStoryAt(currentStoryIdx - 1);
    });
    document.getElementById('story-nav-right').addEventListener('click', function() {
      showStoryAt(currentStoryIdx + 1);
    });
  }

  function openStory(idx) {
    currentStoryIdx = idx;
    var viewer = document.getElementById('story-viewer');
    if (!viewer) return;
    viewer.style.display = 'flex';
    if (window.updateBackButton) window.updateBackButton();
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { viewer.classList.add('active'); });
    });
    showStoryAt(idx);
  }

  function closeStory() {
    var viewer = document.getElementById('story-viewer');
    if (!viewer) return;
    viewer.classList.remove('active');
    if (window.updateBackButton) window.updateBackButton();
    if (storyAutoTimer) clearTimeout(storyAutoTimer);
    if (storyProgressInterval) clearInterval(storyProgressInterval);
    setTimeout(function() { viewer.style.display = 'none'; }, 300);
  }

  function showStoryAt(idx) {
    if (idx < 0 || idx >= storyData.length) {
      closeStory();
      return;
    }
    currentStoryIdx = idx;
    var s = storyData[idx];

    /* Sync carousel */
    bannerIdx = idx;
    updateBannerPosLocal();

    var progress = document.getElementById('story-progress');
    var dotsH = '';
    for (var i = 0; i < storyData.length; i++) {
      var cls = i < idx ? 'story-dot filled' : i === idx ? 'story-dot active' : 'story-dot';
      dotsH += '<div class="' + cls + '"><div class="story-dot-fill"></div></div>';
    }
    progress.innerHTML = dotsH;

    var content = document.getElementById('story-content');
    var h = '<div class="story-bg" style="background:' + s.gradient + ';">';
    if (s.image) h += '<img src="' + esc(s.image) + '" class="story-bg-img" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'">';
    h += '<div class="story-overlay"></div>';
    h += '<div class="story-body">';
    h += '<p class="story-title">' + esc(s.title) + '</p>';
    h += '<p class="story-subtitle">' + esc(s.subtitle || '') + '</p>';
    h += '<button id="story-cta" class="btn-cta interactive story-cta-btn"><span class="cta-glow"></span>' + esc(s.cta) + '</button>';
    h += '</div></div>';
    content.innerHTML = h;

    document.getElementById('story-cta').addEventListener('click', function(e) {
      e.stopPropagation();
      closeStory();
      if (SH) SH.openAffiliate(s.url);
    });

    if (storyAutoTimer) clearTimeout(storyAutoTimer);
    if (storyProgressInterval) clearInterval(storyProgressInterval);

    var startTime = Date.now();
    var activeFill = progress.querySelector('.story-dot.active .story-dot-fill');
    storyProgressInterval = setInterval(function() {
      var pct = Math.min(100, ((Date.now() - startTime) / STORY_DURATION) * 100);
      if (activeFill) activeFill.style.width = pct + '%';
    }, 30);

    storyAutoTimer = setTimeout(function() {
      clearInterval(storyProgressInterval);
      showStoryAt(currentStoryIdx + 1);
    }, STORY_DURATION);
  }

  /* ============================================
     BONUS BUY SECTION
     ============================================ */
  function initBonusBuy() {
    window.slotHub.renderBonusBuy = renderBonusBuy;
    renderBonusBuy();

    var link = document.getElementById('link-bonusbuy');
    if (link) {
      link.addEventListener('click', function() {
        SH.switchTab('games');
      });
    }
  }

  function renderBonusBuy() {
    var row = document.getElementById('bonusbuy-row');
    var section = document.getElementById('bonusbuy-section');
    var countEl = document.getElementById('bonusbuy-count');
    if (!row) return;

    var games = DataStore.getBonusBuyGames();
    if (countEl) countEl.textContent = games.length;

    if (games.length === 0) {
      if (section) section.style.display = 'none';
      return;
    }
    if (section) section.style.display = '';
    row.innerHTML = '';
    for (var i = 0; i < games.length; i++) {
      row.appendChild(SH.buildRowCard(games[i], 200, 112, i * 60));
    }
  }

  /* ============================================
     LEADERBOARD
     ============================================ */
  function initLeaderboard() {
    renderLeaderboard('day');
    var tabs = document.querySelectorAll('.lb-tab');
    for (var i = 0; i < tabs.length; i++) {
      (function(tab) {
        tab.addEventListener('click', function() {
          for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
          tab.classList.add('active');
          renderLeaderboard(tab.getAttribute('data-lb'));
          if (SH) SH.haptic('light');
        });
      })(tabs[i]);
    }
  }

  function renderLeaderboard(period) {
    var el = document.getElementById('leaderboard');
    if (!el) return;

    var names = ['Ден***','Kate***','Алек***','Max***','Анна***','Игор***','Lisa***','Рома***','Стас***','Дима***','Марк***','Вера***','Лена***','Арте***','Миша***','Ник***','Юлия***','Влад***','Тимо***','Софи***'];
    var games = DataStore.getActiveGames();
    var cur = DataStore.getCurrency();
    var seed = period === 'day' ? Math.floor(Date.now() / 86400000) : Math.floor(Date.now() / 604800000);

    var entries = [];
    for (var i = 0; i < 8; i++) {
      var hash = simpleHash(period + '_lb_' + seed + '_' + i);
      var game = games.length > 0 ? games[hash % games.length] : { name: 'Sweet Bonanza', icon: '🍬' };
      var amt = period === 'week' ? 100000 + (hash % 4000000) : 10000 + (hash % 800000);
      entries.push({
        name: names[hash % names.length],
        game: game,
        amount: amt,
        mult: 'x' + (5 + (hash % 995))
      });
    }
    entries.sort(function(a, b) { return b.amount - a.amount; });

    var h = '';
    for (var j = 0; j < entries.length; j++) {
      var e = entries[j];
      var medal = j === 0 ? '🥇' : j === 1 ? '🥈' : j === 2 ? '🥉' : '<span class="lb-rank-num">' + (j + 1) + '</span>';
      var amtStr = e.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      h += '<div class="lb-row' + (j < 3 ? ' lb-top' : '') + '">';
      h += '<div class="lb-medal">' + medal + '</div>';
      h += '<div class="lb-player">';
      h += '<span class="lb-name">' + esc(e.name) + '</span>';
      h += '<span class="lb-game">' + (e.game.icon || '🎰') + ' ' + esc(e.game.name) + '</span>';
      h += '</div>';
      h += '<div class="lb-win">';
      h += '<span class="lb-amount">' + amtStr + ' ' + esc(cur.symbol) + '</span>';
      h += '<span class="lb-mult">' + e.mult + '</span>';
      h += '</div>';
      h += '</div>';
    }
    el.innerHTML = h;
  }

  /* ============================================
     STATS (Profile) — with Level system
     ============================================ */
  function initStats() {
    window.slotHub.trackGamePlayed = trackGamePlayed;
    window.slotHub.updateStats = updateStats;
    updateStats();

    setInterval(function() {
      var t = SH.getLocal('timeInApp', 0);
      SH.setLocal('timeInApp', t + 60000);
    }, 60000);
  }

  function trackGamePlayed(gameId) {
    var stats = SH.getLocal('gameStats', { played: 0, games: {} });
    stats.played++;
    stats.games[gameId] = (stats.games[gameId] || 0) + 1;
    SH.setLocal('gameStats', stats);
  }

  function getLevel(played) {
    if (played >= 100) return '👑 Легенда';
    if (played >= 50) return '💎 Мастер';
    if (played >= 20) return '⭐ Профи';
    if (played >= 5) return '🎮 Игрок';
    return '🆕 Новичок';
  }

  function updateStats() {
    if (!SH) return;
    var stats = SH.getLocal('gameStats', { played: 0, games: {} });

    var el = document.getElementById('stat-played');
    if (el) el.textContent = stats.played;

    el = document.getElementById('stat-favorites');
    if (el) el.textContent = DataStore.favorites.length;

    var timeMs = SH.getLocal('timeInApp', 0);
    var m = Math.floor(timeMs / 60000);
    el = document.getElementById('stat-time');
    if (el) el.textContent = m < 60 ? m + 'м' : Math.floor(m / 60) + 'ч ' + (m % 60) + 'м';

    el = document.getElementById('stat-level');
    if (el) el.textContent = getLevel(stats.played);

    /* Update profile level badge */
    var lvlBadge = document.getElementById('profile-level-badge');
    if (lvlBadge) lvlBadge.textContent = getLevel(stats.played);
  }

  /* ============================================
     NOTIFICATIONS
     ============================================ */
  var notifQueue = [];

  function initNotifications() {
    buildNotifQueue();
    showNextNotif();
  }

  function buildNotifQueue() {
    var games = DataStore.getActiveGames();
    var cur = DataStore.getCurrency();
    var names = ['Kate***', 'Max***', 'Алек***', 'Анна***', 'Стас***', 'Дима***', 'Лена***'];
    var gName = games.length > 0 ? games[Math.floor(Math.random() * games.length)].name : 'Sweet Bonanza';

    var uName = (window.getUserFirstName && window.getUserFirstName()) || '';
    var hey = uName ? (uName + ', ') : '';

    notifQueue = [
      { icon: '🔥', title: 'Новый слот добавлен!', text: hey + 'попробуйте ' + gName + ' прямо сейчас!' },
      { icon: '⏰', title: 'Бонус истекает!', text: hey + 'успейте забрать 500% бонус — осталось 2 часа!' },
      { icon: '🏆', title: 'Мега-выигрыш!', text: names[Math.floor(Math.random() * names.length)] + ' выиграл 450,000 ' + cur.symbol + '!' },
      { icon: '💎', title: 'VIP-предложение', text: hey + 'эксклюзивный кэшбэк 15% ждёт вас!' },
      { icon: '🎁', title: hey + 'фриспины без депозита!', text: '100 бесплатных вращений — активируйте!' },
      { icon: '⚡', title: 'Турнир начался!', text: 'Призовой фонд 1,000,000 ' + cur.symbol + '!' }
    ];

    for (var i = notifQueue.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = notifQueue[i]; notifQueue[i] = notifQueue[j]; notifQueue[j] = tmp;
    }
  }

  function showNextNotif() {
    if (notifQueue.length === 0) buildNotifQueue();
    var n = notifQueue.shift();
    showNotifPopup(n.icon, n.title, n.text);
    setTimeout(showNextNotif, 60000 + Math.random() * 90000);
  }

  function showNotifPopup(icon, title, text) {
    var el = document.getElementById('notification-popup');
    if (!el) return;
    if (SH && SH.playSound) SH.playSound('notification');
    document.getElementById('notif-icon').textContent = icon;
    document.getElementById('notif-title').textContent = title;
    document.getElementById('notif-text').textContent = text;
    el.classList.add('show');
    setTimeout(function() { el.classList.remove('show'); }, 6000);
  }

  var nc = document.getElementById('notif-close');
  if (nc) nc.addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('notification-popup').classList.remove('show');
  });

  var np = document.getElementById('notification-popup');
  if (np) np.addEventListener('click', function() {
    np.classList.remove('show');
    if (window.slotHub) window.slotHub.switchTab('casinos');
  });

  /* ============================================
     THEMES
     ============================================ */
  function initThemes() {
    var saved = 'neon';
    try { saved = localStorage.getItem('sh_theme') || 'neon'; } catch(e) {}
    applyTheme(saved);

    var btns = document.querySelectorAll('.theme-btn');
    for (var i = 0; i < btns.length; i++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          var theme = btn.getAttribute('data-theme');
          applyTheme(theme);
          try { localStorage.setItem('sh_theme', theme); } catch(e) {}
          if (SH) SH.haptic('light');
        });
      })(btns[i]);
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btns = document.querySelectorAll('.theme-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-theme') === theme);
    }
  }

  /* ---- Resize handler for banner position ---- */
  window.addEventListener('resize', function() {
    if (window._storiesMode) updateBannerPosLocal();
  });

});
