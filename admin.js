/* ============================================
   ADMIN PANEL — Games, Casinos (unified), Settings, Data
   ============================================ */
(function() {

  var elPanel = document.getElementById('admin-panel');
  var elFormOverlay = document.getElementById('admin-form-overlay');
  var elAdminContent = document.getElementById('admin-content');
  var elAdminFormBody = document.getElementById('admin-form-body');
  var elAdminFormTitle = document.getElementById('admin-form-title');
  var elAdminFab = document.getElementById('admin-fab');
  var activeAdminTab = 'games';
  var editingItem = null;
  var editingType = '';

  /* ---- Open / Close ---- */
  window.openAdminPanel = function() {
    elPanel.classList.add('open');
    if (window.updateBackButton) window.updateBackButton();
    activeAdminTab = 'games';
    setAdminTab('games');
  };

  document.getElementById('admin-close').addEventListener('click', function() {
    elPanel.classList.remove('open');
    if (window.updateBackButton) window.updateBackButton();
    if (window.appRefresh) window.appRefresh();
  });

  /* ---- Admin Tabs ---- */
  var adminTabBtns = document.querySelectorAll('[data-admin-tab]');
  for (var i = 0; i < adminTabBtns.length; i++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        setAdminTab(btn.getAttribute('data-admin-tab'));
      });
    })(adminTabBtns[i]);
  }

  function setAdminTab(tab) {
    activeAdminTab = tab;
    for (var j = 0; j < adminTabBtns.length; j++) {
      adminTabBtns[j].classList.toggle('active', adminTabBtns[j].getAttribute('data-admin-tab') === tab);
    }
    elAdminFab.style.display = (tab === 'games' || tab === 'casinos') ? '' : 'none';

    if (tab === 'games') renderAdminGames();
    else if (tab === 'casinos') renderAdminCasinos();
    else if (tab === 'stats') renderAdminStats();
    else if (tab === 'settings') renderAdminSettings();
    else if (tab === 'data') renderAdminData();
  }

  /* ---- FAB (Add) ---- */
  document.getElementById('admin-add-btn').addEventListener('click', function() {
    editingItem = null;
    if (activeAdminTab === 'games') { editingType = 'game'; openGameForm(null); }
    else if (activeAdminTab === 'casinos') { editingType = 'casino'; openCasinoForm(null); }
  });

  /* ---- Form Close ---- */
  document.getElementById('admin-form-back').addEventListener('click', function() {
    elFormOverlay.classList.remove('open');
  });

  /* ---- Form Save ---- */
  document.getElementById('admin-form-save').addEventListener('click', function() {
    if (editingType === 'game') saveGameForm();
    else if (editingType === 'casino') saveCasinoForm();
  });

  /* ============================================
     RENDER ADMIN GAMES
     ============================================ */
  function renderAdminGames() {
    var games = DataStore.getAllGames();
    var html = '<div style="margin-bottom:12px;"><span style="font-weight:600;font-size:14px;color:var(--text-secondary);">' + games.length + ' игр</span></div>';

    for (var i = 0; i < games.length; i++) {
      var g = games[i];
      html += '<div class="admin-item">';
      html += '<div class="admin-item-thumb" style="background:' + (g.gradient || '#333') + ';">';
      if (g.image) {
        html += '<img src="' + esc(g.image) + '" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'">';
      } else {
        html += '<span style="font-size:20px;">' + (g.icon || '🎰') + '</span>';
      }
      html += '</div>';
      html += '<div class="admin-item-info">';
      html += '<div class="admin-item-title">' + esc(g.name) + '</div>';
      html += '<div class="admin-item-sub">' + esc(g.provider || '') + ' &bull; ' + esc(g.tag) + (g.active ? '' : ' &bull; <span style="color:#EF4444;">выкл</span>') + '</div>';
      html += '</div>';
      html += '<div class="admin-item-actions">';
      html += '<button class="admin-btn-sm admin-edit-game" data-id="' + g.id + '"><i class="fa-solid fa-pen text-xs"></i></button>';
      html += '<button class="admin-btn-sm danger admin-del-game" data-id="' + g.id + '"><i class="fa-solid fa-trash text-xs"></i></button>';
      html += '</div></div>';
    }

    if (games.length === 0) html += '<div class="empty-state"><p>Нет игр. Нажмите + чтобы добавить.</p></div>';
    elAdminContent.innerHTML = html;
    bindListActions('.admin-edit-game', '.admin-del-game', 'game');
  }

  /* ============================================
     RENDER ADMIN CASINOS (unified with banners)
     ============================================ */
  function renderAdminCasinos() {
    var casinos = DataStore.getAllCasinos();
    var html = '<div style="margin-bottom:12px;">';
    html += '<span style="font-weight:600;font-size:14px;color:var(--text-secondary);">' + casinos.length + ' предложений</span>';
    html += '<p style="font-size:11px;color:var(--text-muted);margin-top:4px;">Каждое казино автоматически отображается и как баннер на главной, и как карточка во вкладке «Бонусы»</p>';
    html += '</div>';

    for (var i = 0; i < casinos.length; i++) {
      var c = casinos[i];
      html += '<div class="admin-item">';
      html += '<div class="admin-item-thumb" style="background:' + (c.color || '#333') + ';border-radius:12px;">';
      if (c.logo) {
        html += '<img src="' + esc(c.logo) + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'">';
      } else {
        html += '<span style="font-size:18px;font-weight:800;color:#fff;">' + esc(c.name.charAt(0)) + '</span>';
      }
      html += '</div>';
      html += '<div class="admin-item-info">';
      html += '<div class="admin-item-title">' + esc(c.name) + '</div>';
      html += '<div class="admin-item-sub">' + esc(c.bonus || '') + (c.active ? '' : ' &bull; <span style="color:#EF4444;">выкл</span>') + '</div>';
      html += '</div>';
      html += '<div class="admin-item-actions">';
      html += '<button class="admin-btn-sm admin-edit-casino" data-id="' + c.id + '"><i class="fa-solid fa-pen text-xs"></i></button>';
      html += '<button class="admin-btn-sm danger admin-del-casino" data-id="' + c.id + '"><i class="fa-solid fa-trash text-xs"></i></button>';
      html += '</div></div>';
    }

    if (casinos.length === 0) html += '<div class="empty-state"><p>Нет казино. Нажмите + чтобы добавить.</p></div>';
    elAdminContent.innerHTML = html;
    bindListActions('.admin-edit-casino', '.admin-del-casino', 'casino');
  }

  /* ---- Generic list binding ---- */
  function bindListActions(editSel, delSel, type) {
    bindListBtn(editSel, function(id) {
      var item;
      if (type === 'game') item = DataStore.getGameById(id);
      else if (type === 'casino') item = DataStore.getCasinoById(id);
      if (!item) return;
      editingType = type;
      if (type === 'game') openGameForm(item);
      else if (type === 'casino') openCasinoForm(item);
    });
    bindListBtn(delSel, function(id) {
      var label = type === 'game' ? 'игру' : 'казино';
      TG.confirm('Удалить ' + label + '?').then(function(ok) {
        if (!ok) return;
        if (type === 'game') { DataStore.deleteGame(id); renderAdminGames(); }
        else if (type === 'casino') { DataStore.deleteCasino(id); renderAdminCasinos(); }
      })
    });
  }

  function bindListBtn(sel, handler) {
    var btns = elAdminContent.querySelectorAll(sel);
    for (var i = 0; i < btns.length; i++) {
      (function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          handler(btn.getAttribute('data-id'));
        });
      })(btns[i]);
    }
  }

  /* ============================================
     GAME FORM
     ============================================ */
  function openGameForm(game) {
    editingItem = game;
    elAdminFormTitle.textContent = game ? 'Редактировать игру' : 'Новая игра';
    var g = game || {};
    var html = '';
    html += formGroup('Название игры', '<input class="form-input" id="af-name" value="' + esc(g.name || '') + '" placeholder="Sweet Bonanza">');
    html += formGroup('Провайдер', '<input class="form-input" id="af-provider" value="' + esc(g.provider || 'Pragmatic Play') + '">');
    html += formGroup('Символ (Pragmatic)', '<input class="form-input" id="af-symbol" value="' + esc(g.symbol || '') + '" placeholder="vs20fruitsw">');
    html += formGroup('Или прямая ссылка', '<input class="form-input" id="af-url" value="' + esc(g.url || '') + '" placeholder="https://...">');
    html += formGroup('Изображение баннера', buildImageUploader('af-image', g.image || ''));
    html += formGroup('Эмодзи-иконка', '<input class="form-input" id="af-icon" value="' + esc(g.icon || '🎰') + '" placeholder="🎰" style="font-size:20px;">');
    html += formGroup('Категория', '<select class="form-select" id="af-tag"><option value="popular"' + (g.tag === 'popular' ? ' selected' : '') + '>🔥 Popular</option><option value="top"' + (g.tag === 'top' ? ' selected' : '') + '>🏆 Top</option><option value="new"' + (g.tag === 'new' ? ' selected' : '') + '>✨ New</option></select>');
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
    html += formGroup('RTP %', '<input class="form-input" id="af-rtp" value="' + esc(g.rtp || '96.50') + '">');
    html += formGroup('Макс. выигрыш', '<input class="form-input" id="af-maxwin" value="' + esc(g.maxWin || '5000x') + '">');
    html += '</div>';
    html += formGroup('Порядок', '<input class="form-input" id="af-order" type="number" value="' + (g.order !== undefined ? g.order : DataStore.games.length) + '">');
    html += formGroup('Градиент фона', '<input class="form-input" id="af-gradient" value="' + esc(g.gradient || 'linear-gradient(135deg,#667eea,#764ba2)') + '">');
    html += formToggle('af-active', 'Активна', g.active !== false);

    elAdminFormBody.innerHTML = html;
    bindImageUploader('af-image');
    bindToggles();
    elFormOverlay.classList.add('open');
    if (window.updateBackButton) window.updateBackButton();
  }

  function saveGameForm() {
    var data = {
      name: val('af-name'), provider: val('af-provider'), symbol: val('af-symbol'),
      url: val('af-url'), image: val('af-image'), icon: val('af-icon') || '🎰',
      tag: val('af-tag'), rtp: val('af-rtp'), maxWin: val('af-maxwin'),
      order: parseInt(val('af-order')) || 0, gradient: val('af-gradient'),
      active: isToggleOn('af-active')
    };
    if (!data.name) { TG.alert('Введите название'); return; }
    if (editingItem) DataStore.updateGame(editingItem.id, data);
    else DataStore.addGame(data);
    elFormOverlay.classList.remove('open');
    renderAdminGames();
  }

  /* ============================================
     CASINO FORM (unified: casino card + banner)
     ============================================ */
  function openCasinoForm(casino) {
    editingItem = casino;
    elAdminFormTitle.textContent = casino ? 'Редактировать предложение' : 'Новое предложение';
    var c = casino || {};
    var html = '';

    /* Section: basic info */
    html += '<p style="font-size:12px;font-weight:700;color:var(--accent-green);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">📋 Основная информация</p>';
    html += formGroup('Название казино', '<input class="form-input" id="af-cname" value="' + esc(c.name || '') + '" placeholder="1win Casino">');
    html += formGroup('Реферальная ссылка', '<input class="form-input" id="af-curl" value="' + esc(c.url || '') + '" placeholder="https://...">');
    html += formGroup('Логотип', buildImageUploader('af-clogo', c.logo || ''));
    html += formGroup('Бонус (краткий)', '<input class="form-input" id="af-cbonus" value="' + esc(c.bonus || '') + '" placeholder="До 500% на первый депозит">');
    html += formGroup('Описание', '<textarea class="form-input" id="af-cdesc" rows="3" placeholder="Описание казино...">' + esc(c.description || '') + '</textarea>');
    html += formGroup('Бейдж', '<input class="form-input" id="af-cbadge" value="' + esc(c.badge || '') + '" placeholder="🔥 ХИТ">');

    /* Section: banner appearance */
    html += '<div style="height:1px;background:var(--border-subtle);margin:20px 0;"></div>';
    html += '<p style="font-size:12px;font-weight:700;color:var(--accent-green);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">🖼️ Баннер на главной</p>';
    html += '<p style="font-size:11px;color:var(--text-muted);margin-top:-8px;margin-bottom:16px;">Как предложение выглядит в карусели на главном экране</p>';
    html += formGroup('Заголовок баннера', '<input class="form-input" id="af-btitle" value="' + esc(c.bannerTitle || '') + '" placeholder="Бонус 500% на депозит">');
    html += formGroup('Подзаголовок баннера', '<input class="form-input" id="af-bsub" value="' + esc(c.bannerSubtitle || '') + '" placeholder="Лучшее предложение 2025">');
    html += formGroup('Фон баннера (изображение)', buildImageUploader('af-bimage', c.bannerImage || ''));
    html += formGroup('Цвет/градиент фона', '<input class="form-input" id="af-ccolor" value="' + esc(c.color || 'linear-gradient(135deg,#FF006E,#8B5CF6)') + '">');
    html += '<p style="font-size:11px;color:var(--text-muted);margin-top:-8px;margin-bottom:16px;">Используется и для баннера, и для карточки казино</p>';

    /* Section: order & active */
    html += '<div style="height:1px;background:var(--border-subtle);margin:20px 0;"></div>';
    html += formGroup('Порядок', '<input class="form-input" id="af-corder" type="number" value="' + (c.order !== undefined ? c.order : DataStore.casinos.length) + '">');
    html += formToggle('af-cactive', 'Активно', c.active !== false);

    elAdminFormBody.innerHTML = html;
    bindImageUploader('af-clogo');
    bindImageUploader('af-bimage');
    bindToggles();
    elFormOverlay.classList.add('open');
    if (window.updateBackButton) window.updateBackButton();
  }

  function saveCasinoForm() {
    var data = {
      name: val('af-cname'), url: val('af-curl'), logo: val('af-clogo'),
      bonus: val('af-cbonus'), description: val('af-cdesc'), badge: val('af-cbadge'),
      color: val('af-ccolor'), order: parseInt(val('af-corder')) || 0,
      active: isToggleOn('af-cactive'),
      bannerTitle: val('af-btitle'),
      bannerSubtitle: val('af-bsub'),
      bannerImage: val('af-bimage')
    };
    /* Auto-fill banner fields if empty */
    if (!data.bannerTitle) data.bannerTitle = data.bonus || data.name;
    if (!data.bannerSubtitle) data.bannerSubtitle = data.name;

    if (!data.name) { TG.alert('Введите название'); return; }
    if (!data.url) { TG.alert('Введите ссылку'); return; }
    if (editingItem) DataStore.updateCasino(editingItem.id, data);
    else DataStore.addCasino(data);
    elFormOverlay.classList.remove('open');
    renderAdminCasinos();
  }

  /* ============================================
     ADMIN STATS
     ============================================ */
  function renderAdminStats() {
    elAdminFab.style.display = 'none';
    var act = DataStore.getActivity();
    var games = DataStore.getActiveGames();
    var casinos = DataStore.getActiveCasinos();
    var favs = DataStore.getFavoriteGames();
    var html = '';

    /* User info from TG */
    html += '<div class="glass p-4 rounded-xl mb-4">';
    html += '<p style="font-weight:700;font-size:12px;color:var(--accent-green);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">\uD83D\uDC64 Текущий пользователь</p>';
    var userName = (window.TG && TG.userName) ? TG.userName : 'Гость';
    var userId = (window.TG && TG.userId) ? String(TG.userId) : '—';
    var userUsername = (window.TG && TG.userUsername) ? '@' + TG.userUsername : '—';
    var userLang = (window.TG && TG.userLang) ? TG.userLang : '—';
    var platform = (window.TG) ? TG.platform : 'browser';
    var isPremium = (window.TG && TG.isPremium) ? '⭐ Да' : 'Нет';
    html += infoRow('Имя', esc(userName));
    html += infoRow('Username', esc(userUsername));
    html += infoRow('ID', userId);
    html += infoRow('Платформа', platform);
    html += infoRow('Язык', userLang);
    html += infoRow('Premium', isPremium);
    html += '</div>';

    /* Activity overview */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">';
    html += statCard('\uD83C\uDFAE', act.totalPlays || 0, 'Запусков игр');
    html += statCard('\uD83D\uDCCA', act.sessions || 0, 'Сессий');
    html += statCard('❤️', favs.length, 'В избранном');
    html += statCard('\uD83D\uDD17', act.affiliateClicks || 0, 'Переходов');
    html += '</div>';

    /* Dates */
    html += '<div class="glass p-4 rounded-xl mb-4">';
    html += '<p style="font-weight:700;font-size:12px;color:var(--accent-green);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">\uD83D\uDCC5 Даты визитов</p>';
    html += infoRow('Первый визит', act.firstVisit ? formatDate(act.firstVisit) : '—');
    html += infoRow('Последний визит', act.lastVisit ? formatDate(act.lastVisit) : '—');
    html += '</div>';

    /* Top played games */
    var launches = act.gameLaunches || {};
    var topGames = Object.keys(launches).map(function(id) {
      return { id: id, count: launches[id] };
    }).sort(function(a, b) { return b.count - a.count; }).slice(0, 10);

    if (topGames.length > 0) {
      html += '<div class="glass p-4 rounded-xl mb-4">';
      html += '<p style="font-weight:700;font-size:12px;color:var(--accent-green);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">\uD83C\uDFC6 Топ играемых</p>';
      for (var i = 0; i < topGames.length; i++) {
        var g = DataStore.getGameById(topGames[i].id);
        var gName = g ? g.name : topGames[i].id;
        var gIcon = g ? (g.icon || '\uD83C\uDFB0') : '\uD83C\uDFB0';
        html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;' + (i < topGames.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : '') + '">';
        html += '<span style="font-size:10px;font-weight:800;color:var(--text-muted);width:20px;">#' + (i+1) + '</span>';
        html += '<span style="font-size:18px;">' + gIcon + '</span>';
        html += '<span style="flex:1;font-size:13px;font-weight:600;color:var(--text-primary);">' + esc(gName) + '</span>';
        html += '<span style="font-size:12px;font-weight:800;color:var(--accent-green);">' + topGames[i].count + 'x</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    /* App content summary */
    html += '<div class="glass p-4 rounded-xl mb-4">';
    html += '<p style="font-weight:700;font-size:12px;color:var(--accent-green);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">\uD83D\uDCE6 Контент приложения</p>';
    html += infoRow('Всего игр', String(DataStore.games.length));
    html += infoRow('Активных игр', String(games.length));
    html += infoRow('Предложений казино', String(casinos.length));
    var cur = DataStore.getCurrency();
    html += infoRow('Текущая валюта', cur.code + ' ' + cur.flag);
    html += '</div>';

    /* Note */
    html += '<div style="padding:14px;border-radius:var(--radius-md);background:rgba(255,165,0,0.06);border:1px solid rgba(255,165,0,0.12);margin-bottom:16px;">';
    html += '<p style="font-size:12px;color:#FFA500;font-weight:700;margin-bottom:6px;">\uD83D\uDCA1 Совет</p>';
    html += '<p style="font-size:11px;color:var(--text-muted);line-height:1.5;">Это локальная статистика текущего пользователя. Для сбора аналитики со всех пользователей подключите бэкенд (Firebase, Supabase или свой API) через бота.</p>';
    html += '</div>';

    elAdminContent.innerHTML = html;
  }

  function infoRow(label, value) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.03);">' +
      '<span style="font-size:12px;color:var(--text-muted);font-weight:500;">' + label + '</span>' +
      '<span style="font-size:12px;color:var(--text-primary);font-weight:700;">' + value + '</span></div>';
  }

  function statCard(icon, value, label) {
    return '<div style="background:rgba(255,255,255,0.025);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:16px;text-align:center;">' +
      '<div style="font-size:24px;margin-bottom:6px;">' + icon + '</div>' +
      '<div style="font-size:22px;font-weight:900;color:var(--text-primary);">' + value + '</div>' +
      '<div style="font-size:10px;color:var(--text-muted);margin-top:4px;font-weight:600;">' + label + '</div></div>';
  }

  function formatDate(isoStr) {
    try {
      var d = new Date(isoStr);
      return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch(e) { return isoStr; }
  }

  /* ============================================
     ADMIN SETTINGS
     ============================================ */
  function renderAdminSettings() {
    elAdminFab.style.display = 'none';
    var s = DataStore.getSettings();
    var cur = DataStore.getCurrency();
    var html = '';
    html += formGroup('Название приложения', '<input class="form-input" id="af-appname" value="' + esc(s.appName || 'SlotX') + '">');
    html += formGroup('Валюта демо-игр', '<div class="form-input" style="display:flex;align-items:center;gap:8px;cursor:default;">' + cur.flag + ' <span style="font-weight:600;">' + esc(cur.code) + '</span> <span style="color:var(--text-muted);">' + esc(cur.symbol) + ' — ' + esc(cur.name) + '</span></div>');
    html += '<p style="font-size:11px;color:var(--text-muted);margin-top:-8px;margin-bottom:16px;">Меняется во вкладке «Ещё» → Валюта</p>';
    html += formGroup('Шаблон URL демо-игр', '<input class="form-input" id="af-urltemplate" value="' + esc(s.demoUrlTemplate || '') + '" placeholder="https://...{symbol}...">');
    html += '<p style="font-size:11px;color:var(--text-muted);margin-top:-8px;margin-bottom:16px;">Плейсхолдеры: <code>{symbol}</code>, <code>{lang}</code>, <code>{currency}</code></p>';
    html += formGroup('Шаблон URL картинок игр', '<input class="form-input" id="af-imgtemplate" value="' + esc(s.gameImageUrlTemplate || '') + '" placeholder="https://...{symbol}...">');
    html += '<p style="font-size:11px;color:var(--text-muted);margin-top:-8px;margin-bottom:16px;">Автоматически подставляет картинку по символу. Плейсхолдер: <code>{symbol}</code></p>';
    html += '<button id="admin-save-settings" class="w-full py-3 rounded-xl text-sm font-bold interactive" style="background:var(--accent-green);color:#000;margin-top:8px;">Сохранить настройки</button>';

    elAdminContent.innerHTML = html;
    document.getElementById('admin-save-settings').addEventListener('click', function() {
      DataStore.updateSettings({ appName: val('af-appname'), demoUrlTemplate: val('af-urltemplate'), gameImageUrlTemplate: val('af-imgtemplate') });
      TG.alert('Настройки сохранены!');
    });
  }

  /* ============================================
     ADMIN DATA (Export/Import/Reset)
     ============================================ */
  function renderAdminData() {
    elAdminFab.style.display = 'none';
    var html = '';
    html += '<div class="glass p-4 rounded-xl mb-4">';
    html += '<p style="font-weight:600;font-size:14px;color:var(--text-primary);margin-bottom:8px;">📤 Экспорт</p>';
    html += '<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Скопируйте JSON как бэкап.</p>';
    html += '<textarea id="admin-export-area" class="form-input" rows="6" readonly style="font-size:11px;font-family:monospace;"></textarea>';
    html += '<button id="admin-copy-btn" class="w-full py-2.5 rounded-xl text-sm font-semibold interactive mt-3" style="background:rgba(0,255,135,0.12);color:var(--accent-green);">Копировать JSON</button>';
    html += '</div>';

    html += '<div class="glass p-4 rounded-xl mb-4">';
    html += '<p style="font-weight:600;font-size:14px;color:var(--text-primary);margin-bottom:8px;">📥 Импорт</p>';
    html += '<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Вставьте ранее экспортированный JSON.</p>';
    html += '<textarea id="admin-import-area" class="form-input" rows="6" placeholder="Вставьте JSON..." style="font-size:11px;font-family:monospace;"></textarea>';
    html += '<button id="admin-import-btn" class="w-full py-2.5 rounded-xl text-sm font-semibold interactive mt-3" style="background:rgba(0,255,135,0.12);color:var(--accent-green);">Импортировать</button>';
    html += '</div>';

    html += '<div class="glass p-4 rounded-xl">';
    html += '<p style="font-weight:600;font-size:14px;color:#EF4444;margin-bottom:8px;">⚠️ Сброс данных</p>';
    html += '<button id="admin-reset-btn" class="w-full py-2.5 rounded-xl text-sm font-semibold interactive" style="background:rgba(239,68,68,0.12);color:#EF4444;">Сбросить всё</button>';
    html += '</div>';

    elAdminContent.innerHTML = html;
    document.getElementById('admin-export-area').value = DataStore.exportConfig();

    document.getElementById('admin-copy-btn').addEventListener('click', function() {
      var area = document.getElementById('admin-export-area');
      area.select();
      try { navigator.clipboard.writeText(area.value); TG.alert('Скопировано!'); }
      catch(e) { document.execCommand('copy'); TG.alert('Скопировано!'); }
    });

    document.getElementById('admin-import-btn').addEventListener('click', async function() {
      var json = document.getElementById('admin-import-area').value.trim();
      if (!json) { TG.alert('Вставьте JSON'); return; }
      var ok = await DataStore.importConfig(json);
      if (ok) { TG.alert('Импортировано!'); renderAdminData(); }
      else TG.alert('Ошибка: неверный JSON');
    });

    document.getElementById('admin-reset-btn').addEventListener('click', async function() {
      TG.confirm('Точно сбросить ВСЕ данные?').then(async function(ok) {
        if (!ok) return;
        await DataStore.resetToDefaults();
        TG.alert('Сброшено!');
        renderAdminData();
      })
    });
  }

  document.getElementById('admin-export-btn').addEventListener('click', function() {
    setAdminTab('data');
  });

  /* ============================================
     FORM HELPERS
     ============================================ */
  function formGroup(label, inputHtml) {
    return '<div class="form-group"><label class="form-label">' + label + '</label>' + inputHtml + '</div>';
  }

  function formToggle(id, label, isOn) {
    return '<div class="form-group" style="display:flex;align-items:center;justify-content:space-between;">' +
      '<span style="font-size:14px;color:var(--text-primary);">' + label + '</span>' +
      '<div class="form-toggle' + (isOn ? ' on' : '') + '" id="' + id + '-toggle" data-field="' + id + '">' +
      '<div class="toggle-knob"></div></div>' +
      '<input type="hidden" id="' + id + '" value="' + (isOn ? '1' : '0') + '">' +
      '</div>';
  }

  function bindToggles() {
    var areas = [elAdminFormBody, elAdminContent];
    for (var a = 0; a < areas.length; a++) {
      var toggles = areas[a].querySelectorAll('.form-toggle');
      for (var i = 0; i < toggles.length; i++) {
        (function(el) {
          el.addEventListener('click', function() {
            var isOn = el.classList.contains('on');
            el.classList.toggle('on');
            var input = document.getElementById(el.getAttribute('data-field'));
            if (input) input.value = isOn ? '0' : '1';
          });
        })(toggles[i]);
      }
    }
  }

  function isToggleOn(id) { var el = document.getElementById(id); return el && el.value === '1'; }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function esc(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ============================================
     IMAGE UPLOADER
     ============================================ */
  function buildImageUploader(id, currentUrl) {
    var html = '<div style="display:flex;gap:10px;align-items:flex-start;">';
    html += '<div class="form-image-preview" id="' + id + '-preview" style="position:relative;">';
    html += '<i class="fa-solid fa-image" style="color:var(--text-muted);"></i>';
    if (currentUrl) {
      html += '<img src="' + esc(currentUrl) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);z-index:1;" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'">';
    }
    html += '</div>';
    html += '<div style="flex:1;">';
    html += '<input class="form-input" id="' + id + '" value="' + esc(currentUrl) + '" placeholder="URL картинки" style="margin-bottom:8px;">';
    html += '<label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--accent-green);cursor:pointer;padding:6px 12px;border-radius:8px;background:rgba(0,255,135,0.1);">';
    html += '<i class="fa-solid fa-upload text-xs"></i> Загрузить';
    html += '<input type="file" accept="image/*" id="' + id + '-file" style="display:none;">';
    html += '</label></div></div>';
    return html;
  }

  function setPreviewImage(preview, url) {
    preview.innerHTML = '';
    var icon = document.createElement('i');
    icon.className = 'fa-solid fa-image';
    icon.style.color = 'var(--text-muted)';
    preview.appendChild(icon);
    if (url) {
      var img = document.createElement('img');
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);z-index:1;';
      img.src = url;
      img.setAttribute('referrerpolicy', 'no-referrer');
      img.onerror = function() { this.style.display = 'none'; };
      preview.appendChild(img);
    }
  }

  function bindImageUploader(id) {
    var urlInput = document.getElementById(id);
    var fileInput = document.getElementById(id + '-file');
    var preview = document.getElementById(id + '-preview');
    if (!urlInput || !fileInput || !preview) return;

    urlInput.addEventListener('input', function() { setPreviewImage(preview, urlInput.value.trim()); });

    fileInput.addEventListener('change', async function() {
      var file = fileInput.files[0];
      if (!file) return;
      try {
        if (window.miniappsAI && miniappsAI.uploadFile) {
          preview.innerHTML = '<div class="spinner" style="width:24px;height:24px;border-width:2px;"></div>';
          var result = await miniappsAI.uploadFile(file);
          if (result && result.path) {
            urlInput.value = result.path;
            setPreviewImage(preview, result.path);
            return;
          }
        }
      } catch(e) { console.log('Upload failed, fallback to base64', e); }

      var reader = new FileReader();
      reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
          var maxW = 400, maxH = 400, w = img.width, h = img.height;
          if (w > maxW || h > maxH) { var r = Math.min(maxW / w, maxH / h); w = Math.round(w * r); h = Math.round(h * r); }
          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          urlInput.value = dataUrl;
          setPreviewImage(preview, dataUrl);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

})();
