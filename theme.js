/* ============================================
   THEME SYSTEM — Dark / Light / Auto
   Auto-detects system preference
   ============================================ */
var ThemeManager = (function() {

  var currentTheme = 'auto'; /* 'dark', 'light', 'auto' */
  var resolvedTheme = 'dark';
  var mediaQuery = null;

  function init() {
    /* Load saved preference */
    try {
      var saved = localStorage.getItem('sh_theme');
      if (saved === 'dark' || saved === 'light' || saved === 'auto') currentTheme = saved;
    } catch(e) {}

    /* Listen to system preference changes */
    if (window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      mediaQuery.addEventListener('change', function() {
        if (currentTheme === 'auto') apply();
      });
    }

    apply();
  }

  function getSystemTheme() {
    if (mediaQuery && mediaQuery.matches) return 'light';
    return 'dark';
  }

  function apply() {
    if (currentTheme === 'auto') {
      resolvedTheme = getSystemTheme();
    } else {
      resolvedTheme = currentTheme;
    }

    var root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light');
    root.classList.add('theme-' + resolvedTheme);

    /* Update CSS variables */
    if (resolvedTheme === 'light') {
      root.style.setProperty('--bg-primary', '#F0EDF6');
      root.style.setProperty('--bg-secondary', '#E8E4F0');
      root.style.setProperty('--text-primary', '#1A1333');
      root.style.setProperty('--text-secondary', '#5B5478');
      root.style.setProperty('--text-muted', '#8E87A5');
      root.style.setProperty('--border-subtle', 'rgba(0,0,0,0.08)');
      root.style.setProperty('--glass-bg', 'linear-gradient(145deg, rgba(255,255,255,0.85), rgba(240,237,246,0.92))');
      root.style.setProperty('--glass-border', 'rgba(0,0,0,0.06)');
    } else {
      root.style.setProperty('--bg-primary', '#030510');
      root.style.setProperty('--bg-secondary', '#06091A');
      root.style.setProperty('--text-primary', '#FFFFFF');
      root.style.setProperty('--text-secondary', '#B8B0D0');
      root.style.setProperty('--text-muted', '#6B6490');
      root.style.setProperty('--border-subtle', 'rgba(255,255,255,0.05)');
      root.style.setProperty('--glass-bg', 'linear-gradient(145deg, rgba(22,16,48,0.88), rgba(8,5,18,0.94))');
      root.style.setProperty('--glass-border', 'rgba(255,255,255,0.08)');
    }

    /* Update body background */
    document.body.style.background = resolvedTheme === 'light' ? '#F0EDF6' : '#030510';

    /* Update TG colors if available */
    try {
      var tg = window.Telegram && Telegram.WebApp;
      if (tg) {
        var bg = resolvedTheme === 'light' ? '#F0EDF6' : '#030510';
        if (tg.setHeaderColor) tg.setHeaderColor(bg);
        if (tg.setBackgroundColor) tg.setBackgroundColor(bg);
        if (tg.setBottomBarColor) tg.setBottomBarColor(bg);
      }
    } catch(e) {}

    /* Fire event */
    try { window.dispatchEvent(new CustomEvent('themechange', { detail: resolvedTheme })); } catch(e) {}
  }

  function setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light' && theme !== 'auto') theme = 'auto';
    currentTheme = theme;
    try { localStorage.setItem('sh_theme', theme); } catch(e) {}
    apply();
  }

  return {
    init: init,
    setTheme: setTheme,
    getTheme: function() { return currentTheme; },
    getResolved: function() { return resolvedTheme; },
    isLight: function() { return resolvedTheme === 'light'; }
  };
})();
