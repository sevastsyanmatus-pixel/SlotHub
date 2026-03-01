/* ============================================
   LEADERBOARD — XP Rankings + Wins
   Always keeps real user below top bots for motivation
   ============================================ */
(function() {

  var FNAMES = ['Alex***','Kate***','Max***','Анна***','Дима***','Lisa***',
    'Стас***','Марк***','Вера***','Рома***','Миша***','Юлия***',
    'Влад***','Тимо***','Софи***','Артё***','Лена***','Даша***',
    'Nik***','Sam***','Eva***','Leo***','Mia***','Олег***',
    'Ира***','Поли***','Глеб***','Ксен***','Jan***','Tom***'];

  function genPlayers() {
    var d = window.Features ? Features.getData() : { xp: 0, referrals: 0, biggestWin: 0, totalWon: 0 };
    var userXP = d.xp || 0;
    var userRefs = d.referrals || 0;
    var userBestWin = d.biggestWin || 0;
    var userTotalWon = d.totalWon || 0;
    var userName = (window.TG && TG.userFirstName) ? TG.userFirstName : 'You';
    var seed = Math.floor(Date.now() / 86400000);

    var players = [];

    /* --- Always generate 3-5 bots ABOVE the user --- */
    var aboveCount = 3 + (simpleHash('above_' + seed) % 3); /* 3-5 bots above */
    for (var a = 0; a < aboveCount; a++) {
      var ha = simpleHash('lb_above_' + seed + '_' + a);
      /* XP: user's XP * 1.3 ~ 3.0 + random bonus, always higher */
      var boostFactor = 1.3 + (a * 0.4) + ((ha % 100) / 100);
      var aboveXP = Math.max(Math.round(userXP * boostFactor) + 200 + (ha % 2000), userXP + 100 + a * 300);
      /* Wins: always higher than user's best */
      var aboveBestWin = Math.max(Math.round(userBestWin * boostFactor) + 500 + (ha % 5000), userBestWin + 1000);
      var aboveTotalWon = aboveBestWin * (3 + (ha % 10));
      var aboveRefs = Math.floor(aboveXP / 300) + (ha % 5);
      players.push({
        name: FNAMES[ha % FNAMES.length],
        xp: aboveXP,
        refs: aboveRefs,
        bestWin: aboveBestWin,
        totalWon: aboveTotalWon,
        self: false
      });
    }

    /* --- Regular bots: mix of above and below user --- */
    for (var i = 0; i < 45; i++) {
      var h = simpleHash('lb_xp_' + seed + '_' + i);
      var tier = h % 100;
      var xp;
      if (tier < 5) xp = 10000 + (h % 40000);
      else if (tier < 15) xp = 5000 + (h % 10000);
      else if (tier < 35) xp = 1500 + (h % 5000);
      else if (tier < 60) xp = 300 + (h % 1500);
      else xp = 10 + (h % 500);
      var refs = Math.floor(xp / 400) + (h % 3);
      var bestWin = Math.round((h % 50000) * (xp / 5000));
      var totalWon = bestWin * (2 + (h % 8));
      players.push({ name: FNAMES[h % FNAMES.length], xp: xp, refs: refs, bestWin: bestWin, totalWon: totalWon, self: false });
    }

    /* Add current user */
    players.push({ name: userName, xp: userXP, refs: userRefs, bestWin: userBestWin, totalWon: userTotalWon, self: true });

    /* Sort by XP descending */
    players.sort(function(a, b) { return b.xp - a.xp; });

    /* Safety: if user somehow ended up at #1, swap with #2 */
    if (players.length > 1 && players[0].self) {
      var tmp = players[0];
      players[0] = players[1];
      players[1] = tmp;
    }
    /* Also ensure user isn't #2 — at least 3 above */
    while (players.length > 3) {
      var userIdx = -1;
      for (var ui = 0; ui < players.length; ui++) { if (players[ui].self) { userIdx = ui; break; } }
      if (userIdx < 3 && userIdx >= 0) {
        /* Boost the bot below to be above */
        var swapIdx = userIdx > 0 ? userIdx : 1;
        if (players[swapIdx] && !players[swapIdx].self) break;
        /* Move user down */
        var u = players.splice(userIdx, 1)[0];
        var insertAt = Math.min(3 + (simpleHash('pos_' + seed) % 3), players.length);
        players.splice(insertAt, 0, u);
      } else {
        break;
      }
    }

    return players;
  }

  function renderXPLeaderboard(container, limit) {
    if (!limit) limit = 10;
    var players = genPlayers();
    var t = window.I18n ? I18n.t : function(k, f) { return f || k; };
    var cur = window.DataStore ? DataStore.getCurrencySymbol() : '₽';

    /* Find user rank */
    var userRank = 0;
    for (var r = 0; r < players.length; r++) {
      if (players[r].self) { userRank = r + 1; break; }
    }

    var html = '';

    /* User rank summary */
    var d = window.Features ? Features.getData() : { xp: 0, biggestWin: 0 };
    var lvl = window.Features ? Features.getLevel(d.xp || 0) : { icon: '🆕', name: { ru: 'Новичок' } };
    var lvlName = window.Features ? Features.getLevelName(lvl) : 'Новичок';

    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;margin:8px 0 10px;background:linear-gradient(135deg,rgba(109,40,217,0.12),rgba(67,56,202,0.06));border:1px solid rgba(139,92,246,0.2);">';
    html += '<div style="font-size:20px;font-weight:900;color:#C084FC;">#' + userRank + '</div>';
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-size:13px;font-weight:800;color:#fff;">' + t('lb.yourRank', 'Ваш рейтинг') + '</div>';
    html += '<div style="font-size:10px;color:var(--text-muted);">' + lvl.icon + ' ' + lvlName + ' • ' + (d.xp || 0) + ' XP</div>';
    html += '</div>';
    html += '<div style="text-align:right;">';
    html += '<div style="font-size:14px;font-weight:900;color:#C084FC;">' + (d.xp || 0) + '</div>';
    html += '<div style="font-size:8px;color:var(--text-muted);">XP</div>';
    html += '</div></div>';

    /* Top players */
    var shown = 0;
    for (var i = 0; i < players.length && shown < limit; i++) {
      var p = players[i];
      var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '<span style="font-size:12px;font-weight:800;color:var(--text-muted);">' + (i + 1) + '</span>';
      var pLvl = window.Features ? Features.getLevel(p.xp) : { icon: '🆕' };

      var rowBg = p.self
        ? 'background:linear-gradient(135deg,rgba(109,40,217,0.1),rgba(67,56,202,0.05));border:1px solid rgba(139,92,246,0.2);'
        : (i < 3 ? 'background:linear-gradient(145deg,rgba(20,14,46,0.7),rgba(8,5,18,0.8));border:1px solid rgba(139,92,246,0.08);' : 'background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);');

      html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;margin-bottom:5px;' + rowBg + '">';
      html += '<div style="width:24px;text-align:center;flex-shrink:0;">' + medal + '</div>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:12px;font-weight:700;color:' + (p.self ? '#C084FC' : '#fff') + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (p.self ? '⭐ ' : '') + escHtml(p.name) + '</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);">' + pLvl.icon + ' • ' + p.refs + ' ' + t('lb.refs', 'реф.') + (p.bestWin > 0 ? ' • 🏆' + formatNum(p.bestWin) + cur : '') + '</div>';
      html += '</div>';
      html += '<div style="text-align:right;flex-shrink:0;">';
      html += '<div style="font-size:13px;font-weight:900;color:' + (p.self ? '#C084FC' : (i < 3 ? '#A78BFA' : 'var(--text-secondary)')) + ';">' + formatNum(p.xp) + '</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);">XP</div>';
      html += '</div></div>';
      shown++;
    }

    /* If user not in top, show their position */
    if (userRank > limit) {
      html += '<div style="text-align:center;padding:4px;color:var(--text-muted);font-size:10px;">• • •</div>';
      var me = players[userRank - 1];
      var mLvl = window.Features ? Features.getLevel(me.xp) : { icon: '🆕' };
      html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;background:linear-gradient(135deg,rgba(109,40,217,0.1),rgba(67,56,217,0.05));border:1px solid rgba(139,92,246,0.2);">';
      html += '<div style="width:24px;text-align:center;flex-shrink:0;font-size:12px;font-weight:800;color:#C084FC;">' + userRank + '</div>';
      html += '<div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:700;color:#C084FC;">⭐ ' + escHtml(me.name) + '</div>';
      html += '<div style="font-size:8px;color:var(--text-muted);">' + mLvl.icon + ' • ' + me.refs + ' ' + t('lb.refs', 'реф.') + (me.bestWin > 0 ? ' • 🏆' + formatNum(me.bestWin) + cur : '') + '</div></div>';
      html += '<div style="text-align:right;flex-shrink:0;"><div style="font-size:13px;font-weight:900;color:#C084FC;">' + formatNum(me.xp) + '</div><div style="font-size:8px;color:var(--text-muted);">XP</div></div></div>';
    }

    container.innerHTML = html;
  }

  function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 10000) return (n / 1000).toFixed(1) + 'k';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function escHtml(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* Expose */
  window.Leaderboard = {
    render: renderXPLeaderboard,
    generate: genPlayers
  };

})();
