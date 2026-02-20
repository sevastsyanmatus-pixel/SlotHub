/* ============================================
   DATA LAYER — Games, Casinos (unified with banners), Settings
   ============================================ */

/* ---- CURRENCIES ---- */
var CURRENCIES = [
  { code: 'RUB', symbol: '₽', name: 'Российский рубль', lang: 'ru', flag: '🇷🇺' },
  { code: 'USD', symbol: '$', name: 'US Dollar', lang: 'en', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', lang: 'en', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', lang: 'en', flag: '🇬🇧' },
  { code: 'UAH', symbol: '₴', name: 'Українська гривня', lang: 'uk', flag: '🇺🇦' },
  { code: 'KZT', symbol: '₸', name: 'Қазақстан теңгесі', lang: 'ru', flag: '🇰🇿' },
  { code: 'TRY', symbol: '₺', name: 'Türk Lirası', lang: 'tr', flag: '🇹🇷' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', lang: 'pt', flag: '🇧🇷' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', lang: 'hi', flag: '🇮🇳' },
  { code: 'UZS', symbol: 'сўм', name: "O'zbek so'mi", lang: 'ru', flag: '🇺🇿' },
  { code: 'AZN', symbol: '₼', name: 'Azərbaycan manatı', lang: 'az', flag: '🇦🇿' },
  { code: 'PLN', symbol: 'zł', name: 'Polski Złoty', lang: 'pl', flag: '🇵🇱' },
  { code: 'CZK', symbol: 'Kč', name: 'Česká koruna', lang: 'cs', flag: '🇨🇿' },
  { code: 'NOK', symbol: 'kr', name: 'Norsk krone', lang: 'no', flag: '🇳🇴' },
  { code: 'SEK', symbol: 'kr', name: 'Svensk krona', lang: 'sv', flag: '🇸🇪' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', lang: 'en', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', lang: 'en', flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', name: '日本円', lang: 'ja', flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥', name: '人民币', lang: 'zh', flag: '🇨🇳' },
  { code: 'KRW', symbol: '₩', name: '대한민국 원', lang: 'ko', flag: '🇰🇷' },
  { code: 'THB', symbol: '฿', name: 'บาท', lang: 'th', flag: '🇹🇭' },
  { code: 'VND', symbol: '₫', name: 'Việt Nam Đồng', lang: 'vi', flag: '🇻🇳' },
  { code: 'IDR', symbol: 'Rp', name: 'Rupiah Indonesia', lang: 'id', flag: '🇮🇩' },
  { code: 'MYR', symbol: 'RM', name: 'Ringgit Malaysia', lang: 'ms', flag: '🇲🇾' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', lang: 'en', flag: '🇵🇭' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', lang: 'en', flag: '🇸🇬' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', lang: 'en', flag: '🇭🇰' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', lang: 'zh', flag: '🇹🇼' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee', lang: 'en', flag: '🇵🇰' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', lang: 'bn', flag: '🇧🇩' },
  { code: 'GEL', symbol: '₾', name: 'ქართული ლარი', lang: 'ka', flag: '🇬🇪' },
  { code: 'AMD', symbol: '֏', name: 'Հայկական դրամ', lang: 'hy', flag: '🇦🇲' },
  { code: 'BYN', symbol: 'Br', name: 'Беларускі рубель', lang: 'be', flag: '🇧🇾' },
  { code: 'MDL', symbol: 'L', name: 'Leu moldovenesc', lang: 'ro', flag: '🇲🇩' },
  { code: 'RON', symbol: 'lei', name: 'Leu românesc', lang: 'ro', flag: '🇷🇴' },
  { code: 'BGN', symbol: 'лв', name: 'Български лев', lang: 'bg', flag: '🇧🇬' },
  { code: 'HUF', symbol: 'Ft', name: 'Magyar forint', lang: 'hu', flag: '🇭🇺' },
  { code: 'CHF', symbol: 'Fr', name: 'Schweizer Franken', lang: 'de', flag: '🇨🇭' },
  { code: 'DKK', symbol: 'kr', name: 'Dansk krone', lang: 'da', flag: '🇩🇰' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', lang: 'en', flag: '🇳🇿' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', lang: 'en', flag: '🇿🇦' },
  { code: 'MXN', symbol: 'MX$', name: 'Peso Mexicano', lang: 'es', flag: '🇲🇽' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano', lang: 'es', flag: '🇵🇪' },
  { code: 'ARS', symbol: 'AR$', name: 'Peso Argentino', lang: 'es', flag: '🇦🇷' },
  { code: 'CLP', symbol: 'CL$', name: 'Peso Chileno', lang: 'es', flag: '🇨🇱' },
  { code: 'COP', symbol: 'COL$', name: 'Peso Colombiano', lang: 'es', flag: '🇨🇴' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', lang: 'en', flag: '🇳🇬' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', lang: 'ar', flag: '🇪🇬' },
  { code: 'MAD', symbol: 'DH', name: 'Dirham Marocain', lang: 'fr', flag: '🇲🇦' }
];

function getCurrencyByCode(code) {
  for (var i = 0; i < CURRENCIES.length; i++) {
    if (CURRENCIES[i].code === code) return CURRENCIES[i];
  }
  return CURRENCIES[0];
}

/* ---- DEFAULT GAMES (24 Pragmatic Play) ---- */
var DEFAULT_GAMES = [
  /* === POPULAR (8) === */
  { id: 'g1',  name: 'Sweet Bonanza',       symbol: 'vs20fruitsw',    provider: 'Pragmatic Play', tag: 'popular', icon: '🍬', image: '', gradient: 'linear-gradient(135deg,#FF6B9D,#C44569)', rtp: '96.48', maxWin: '21100x', volatility: 'high',   bonusBuy: true,  order: 0,  active: true },
  { id: 'g2',  name: 'Gates of Olympus',    symbol: 'vs20olympgate',  provider: 'Pragmatic Play', tag: 'popular', icon: '⚡', image: '', gradient: 'linear-gradient(135deg,#FFD700,#FF8C00)', rtp: '96.50', maxWin: '5000x',  volatility: 'high',   bonusBuy: true,  order: 1,  active: true },
  { id: 'g4',  name: 'The Dog House',       symbol: 'vs20doghouse',   provider: 'Pragmatic Play', tag: 'popular', icon: '🐕', image: '', gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', rtp: '96.51', maxWin: '6750x',  volatility: 'high',   bonusBuy: true,  order: 2,  active: true },
  { id: 'g5',  name: 'Starlight Princess',  symbol: 'vs20starlight',  provider: 'Pragmatic Play', tag: 'popular', icon: '⭐', image: '', gradient: 'linear-gradient(135deg,#a855f7,#ec4899)', rtp: '96.50', maxWin: '5000x',  volatility: 'high',   bonusBuy: true,  order: 3,  active: true },
  { id: 'g8',  name: 'Wild West Gold',      symbol: 'vs40wildwest',   provider: 'Pragmatic Play', tag: 'popular', icon: '🤠', image: '', gradient: 'linear-gradient(135deg,#c79081,#dfa579)', rtp: '96.51', maxWin: '10000x', volatility: 'medium', bonusBuy: false, order: 4,  active: true },
  { id: 'g9',  name: 'Wolf Gold',           symbol: 'vs25wolfgold',   provider: 'Pragmatic Play', tag: 'popular', icon: '🐺', image: '', gradient: 'linear-gradient(135deg,#B8860B,#FFD700)', rtp: '96.01', maxWin: '2500x',  volatility: 'high',   bonusBuy: false, order: 5,  active: true },
  { id: 'g10', name: 'Zeus vs Hades',       symbol: 'vs15godsofwar',  provider: 'Pragmatic Play', tag: 'popular', icon: '🔱', image: '', gradient: 'linear-gradient(135deg,#434343,#ff4500)', rtp: '96.07', maxWin: '15000x', volatility: 'high',   bonusBuy: true,  order: 6,  active: true },
  { id: 'g12', name: 'Hand of Midas',       symbol: 'vs20midas',      provider: 'Pragmatic Play', tag: 'popular', icon: '👑', image: '', gradient: 'linear-gradient(135deg,#FFD700,#B8860B)', rtp: '96.54', maxWin: '5000x',  volatility: 'medium', bonusBuy: true,  order: 7,  active: true },

  /* === TOP (8) === */
  { id: 'g3',  name: 'Sugar Rush',          symbol: 'vs20sugarrush',  provider: 'Pragmatic Play', tag: 'top', icon: '🍭', image: '', gradient: 'linear-gradient(135deg,#f6d365,#fda085)', rtp: '96.50', maxWin: '5000x',  volatility: 'high',   bonusBuy: true,  order: 8,  active: true },
  { id: 'g6',  name: 'Big Bass Splash',     symbol: 'vs10txbigbass',  provider: 'Pragmatic Play', tag: 'top', icon: '🐟', image: '', gradient: 'linear-gradient(135deg,#89f7fe,#66a6ff)', rtp: '96.71', maxWin: '5000x',  volatility: 'medium', bonusBuy: true,  order: 9,  active: true },
  { id: 'g7',  name: 'Fruit Party',         symbol: 'vs20fruitparty', provider: 'Pragmatic Play', tag: 'top', icon: '🍉', image: '', gradient: 'linear-gradient(135deg,#f7971e,#ffd200)', rtp: '96.47', maxWin: '5000x',  volatility: 'medium', bonusBuy: true,  order: 10, active: true },
  { id: 'g14', name: 'Hot Fiesta',          symbol: 'vs25hotfiesta',  provider: 'Pragmatic Play', tag: 'top', icon: '🌶️', image: '', gradient: 'linear-gradient(135deg,#FF4500,#FFD700)', rtp: '96.56', maxWin: '5000x',  volatility: 'medium', bonusBuy: false, order: 11, active: true },
  { id: 'g15', name: 'Gems Bonanza',        symbol: 'vs20goldfever',  provider: 'Pragmatic Play', tag: 'top', icon: '💎', image: '', gradient: 'linear-gradient(135deg,#00d2ff,#928DAB)', rtp: '96.51', maxWin: '10000x', volatility: 'high',   bonusBuy: true,  order: 12, active: true },
  { id: 'g17', name: 'Big Bass Bonanza',    symbol: 'vs10bbbonanza',  provider: 'Pragmatic Play', tag: 'top', icon: '🎣', image: '', gradient: 'linear-gradient(135deg,#2193b0,#6dd5ed)', rtp: '96.71', maxWin: '2100x',  volatility: 'medium', bonusBuy: false, order: 13, active: true },
  { id: 'g20', name: 'Wisdom of Athena',    symbol: 'vs20procount',   provider: 'Pragmatic Play', tag: 'top', icon: '🦉', image: '', gradient: 'linear-gradient(135deg,#4A00E0,#8E2DE2)', rtp: '96.07', maxWin: '5000x',  volatility: 'high',   bonusBuy: true,  order: 14, active: true },
  { id: 'g21', name: 'Book of Fallen',      symbol: 'vs10bookfallen', provider: 'Pragmatic Play', tag: 'top', icon: '📖', image: '', gradient: 'linear-gradient(135deg,#1a1a2e,#e94560)', rtp: '96.50', maxWin: '5000x',  volatility: 'high',   bonusBuy: false, order: 15, active: true },

  /* === NEW (8) === */
  { id: 'g13', name: 'Mustang Gold',        symbol: 'vs25mustang',    provider: 'Pragmatic Play', tag: 'new', icon: '🐴', image: '', gradient: 'linear-gradient(135deg,#D2691E,#F4A460)', rtp: '96.53', maxWin: '12000x', volatility: 'medium', bonusBuy: false, order: 16, active: true },
  { id: 'g19', name: 'Floating Dragon',     symbol: 'vs10floatdrg',   provider: 'Pragmatic Play', tag: 'new', icon: '🐉', image: '', gradient: 'linear-gradient(135deg,#d32f2f,#ff6659)', rtp: '96.71', maxWin: '50000x', volatility: 'medium', bonusBuy: true,  order: 17, active: true },
  { id: 'g23', name: 'Aztec Gems',          symbol: 'vs5aztecgems',   provider: 'Pragmatic Play', tag: 'new', icon: '💚', image: '', gradient: 'linear-gradient(135deg,#00b09b,#96c93d)', rtp: '96.52', maxWin: '375x',   volatility: 'medium', bonusBuy: false, order: 18, active: true },
  { id: 'g11', name: 'Cleocatra',           symbol: 'vs20cleocatra',  provider: 'Pragmatic Play', tag: 'new', icon: '🐱', image: '', gradient: 'linear-gradient(135deg,#c2e59c,#64b3f4)', rtp: '96.20', maxWin: '5000x',  volatility: 'medium', bonusBuy: true,  order: 19, active: true },
  { id: 'g16', name: 'Pirate Gold',         symbol: 'vs40pirate',     provider: 'Pragmatic Play', tag: 'new', icon: '🏴‍☠️', image: '', gradient: 'linear-gradient(135deg,#1a1a2e,#d4a017)', rtp: '96.50', maxWin: '45000x', volatility: 'medium', bonusBuy: false, order: 20, active: true },
  { id: 'g18', name: 'Mochimon',            symbol: 'vs20mochimon',   provider: 'Pragmatic Play', tag: 'new', icon: '🧸', image: '', gradient: 'linear-gradient(135deg,#ee9ca7,#ffdde1)', rtp: '96.46', maxWin: '5000x',  volatility: 'medium', bonusBuy: true,  order: 21, active: true },
  { id: 'g22', name: 'Sweet Bonanza Xmas',  symbol: 'vs20sbxmas',     provider: 'Pragmatic Play', tag: 'new', icon: '🎄', image: '', gradient: 'linear-gradient(135deg,#e74c3c,#2ecc71)', rtp: '96.48', maxWin: '21100x', volatility: 'high',   bonusBuy: true,  order: 22, active: true },
  { id: 'g28', name: 'Hot to Burn',         symbol: 'vs5hotburn',     provider: 'Pragmatic Play', tag: 'new', icon: '🔥', image: '', gradient: 'linear-gradient(135deg,#FF4500,#FF8C00)', rtp: '96.70', maxWin: '1000x',  volatility: 'low',    bonusBuy: false, order: 23, active: true }
];

var GAME_ICONS = {};
for (var _gi = 0; _gi < DEFAULT_GAMES.length; _gi++) {
  GAME_ICONS[DEFAULT_GAMES[_gi].id] = DEFAULT_GAMES[_gi].icon;
}

/* ---- DEFAULT CASINOS (unified: casino card + banner slide) ---- */
var DEFAULT_CASINOS = [
  {
    id: 'c1', name: '1win Casino',
    url: 'https://1wzaig.com/v3/aggressive-casino?p=akqd',
    logo: '',
    bonus: 'До 500% на первый депозит',
    description: 'Топовое казино с моментальными выплатами, более 5000 игр и щедрой бонусной программой. Вывод на карту за 5 минут.',
    badge: '🔥 ХИТ',
    color: 'linear-gradient(135deg,#FF006E,#8B5CF6)',
    bannerTitle: 'Бонус 500% на депозит',
    bannerSubtitle: '1win Casino — Лучшее предложение 2025',
    bannerImage: '',
    order: 0, active: true
  },
  {
    id: 'c2', name: '1win Slots',
    url: 'https://1wzaig.com/v3/aggressive-casino?p=akqd',
    logo: '',
    bonus: '100 FS без депозита',
    description: 'Фриспины сразу после регистрации. Более 3000 слотов от лучших провайдеров.',
    badge: '🎁 БЕСПЛАТНО',
    color: 'linear-gradient(135deg,#6a0572,#f953c6)',
    bannerTitle: '100 FS за регистрацию',
    bannerSubtitle: 'Фриспины сразу после регистрации',
    bannerImage: '',
    order: 1, active: true
  },
  {
    id: 'c3', name: '1win VIP',
    url: 'https://1wzaig.com/v3/aggressive-casino?p=akqd',
    logo: '',
    bonus: 'VIP кэшбэк до 30%',
    description: 'Эксклюзивная VIP-программа с персональным менеджером и повышенным кэшбэком.',
    badge: '💎 VIP',
    color: 'linear-gradient(135deg,#FFD700,#FF8C00)',
    bannerTitle: 'VIP Кэшбэк 30%',
    bannerSubtitle: 'Возвращаем деньги каждую неделю',
    bannerImage: '',
    order: 2, active: true
  },
  {
    id: 'c4', name: '1win Live',
    url: 'https://1wzaig.com/v3/aggressive-casino?p=akqd',
    logo: '',
    bonus: 'Бонус 200% на Live Casino',
    description: 'Живые дилеры, рулетка, блэкджек и баккара в реальном времени с реальными крупье.',
    badge: '🏆 Live Casino',
    color: 'linear-gradient(135deg,#0d1b2a,#1b4332)',
    bannerTitle: 'Моментальные выплаты',
    bannerSubtitle: 'Вывод за 5 минут на любую карту',
    bannerImage: '',
    order: 3, active: true
  }
];

var DEFAULT_SETTINGS = {
  appName: 'SlotHub',
  currencyCode: 'RUB',
  demoUrlTemplate: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol={symbol}&jurisdiction=99&lang={lang}&cur={currency}&stylename=generic',
  dataVersion: 16
};

/* ============================================
   HOT / COLD SYSTEM (pseudo-random, changes hourly)
   ============================================ */
function simpleHash(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getGameHeat(gameId) {
  var hour = Math.floor(Date.now() / 3600000);
  var h = simpleHash(gameId + '_' + hour);
  var val = h % 100;
  if (val < 35) return 'hot';
  if (val < 55) return 'warm';
  if (val < 80) return 'neutral';
  return 'cold';
}

function getGameOnline(gameId) {
  var fiveMin = Math.floor(Date.now() / 300000);
  var h = simpleHash(gameId + '_online_' + fiveMin);
  return 50 + (h % 950);
}

function getVolatilityLabel(vol) {
  if (vol === 'high') return { text: 'Высокая', cls: 'vol-high' };
  if (vol === 'medium') return { text: 'Средняя', cls: 'vol-medium' };
  if (vol === 'low') return { text: 'Низкая', cls: 'vol-low' };
  return { text: 'Средняя', cls: 'vol-medium' };
}

/* ============================================
   STORAGE WRAPPER
   ============================================ */
var Storage = {
  async get(key, fallback) {
    try {
      if (window.miniappsAI && miniappsAI.storage) {
        var raw = await miniappsAI.storage.getItem('sh_' + key);
        if (raw !== null && raw !== undefined) return JSON.parse(raw);
      }
    } catch (e) {}
    try {
      var raw2 = localStorage.getItem('sh_' + key);
      if (raw2 !== null) return JSON.parse(raw2);
    } catch (e) {}
    return fallback;
  },
  async set(key, value) {
    var json = JSON.stringify(value);
    try { localStorage.setItem('sh_' + key, json); } catch (e) {}
    try {
      if (window.miniappsAI && miniappsAI.storage) {
        await miniappsAI.storage.setItem('sh_' + key, json);
      }
    } catch (e) {}
  },
  async remove(key) {
    try { localStorage.removeItem('sh_' + key); } catch (e) {}
    try {
      if (window.miniappsAI && miniappsAI.storage) {
        await miniappsAI.storage.removeItem('sh_' + key);
      }
    } catch (e) {}
  }
};

/* ============================================
   DATA STORE — No more separate banners!
   Casinos = single source for banner carousel + bonus tab
   ============================================ */
var DataStore = {
  games: [],
  casinos: [],
  settings: {},
  favorites: [],
  _ready: false,

  async init() {
    var savedGames = await Storage.get('games', null);
    var savedCasinos = await Storage.get('casinos', null);
    var savedSettings = await Storage.get('settings', null);
    this.favorites = await Storage.get('favorites', []);

    var savedVersion = (savedSettings && savedSettings.dataVersion) ? savedSettings.dataVersion : 0;
    var needsReset = savedVersion < DEFAULT_SETTINGS.dataVersion;

    if (needsReset) {
      this.games = JSON.parse(JSON.stringify(DEFAULT_GAMES));
      this.casinos = JSON.parse(JSON.stringify(DEFAULT_CASINOS));
      this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      /* Clean up old banner storage */
      await Storage.remove('banners');
    } else {
      this.games = savedGames || JSON.parse(JSON.stringify(DEFAULT_GAMES));
      this.casinos = savedCasinos || JSON.parse(JSON.stringify(DEFAULT_CASINOS));
      this.settings = savedSettings || JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }

    if (!this.settings.currencyCode) this.settings.currencyCode = 'RUB';
    if (!this.settings.demoUrlTemplate) this.settings.demoUrlTemplate = DEFAULT_SETTINGS.demoUrlTemplate;

    /* Sync icons and new fields for games */
    for (var i = 0; i < this.games.length; i++) {
      var g = this.games[i];
      if (!g.icon && GAME_ICONS[g.id]) g.icon = GAME_ICONS[g.id];
      if (!g.volatility) g.volatility = 'medium';
      if (g.bonusBuy === undefined) g.bonusBuy = false;
    }

    /* Ensure new casino banner fields exist */
    for (var ci = 0; ci < this.casinos.length; ci++) {
      var c = this.casinos[ci];
      if (!c.bannerTitle) c.bannerTitle = c.bonus || c.name;
      if (!c.bannerSubtitle) c.bannerSubtitle = c.name;
      if (!c.bannerImage) c.bannerImage = '';
    }

    var existingIds = {};
    for (var ei = 0; ei < this.games.length; ei++) existingIds[this.games[ei].id] = true;
    for (var ni = 0; ni < DEFAULT_GAMES.length; ni++) {
      if (!existingIds[DEFAULT_GAMES[ni].id]) this.games.push(JSON.parse(JSON.stringify(DEFAULT_GAMES[ni])));
    }

    this._ready = true;
    await this.save();
  },

  async save() {
    await Storage.set('games', this.games);
    await Storage.set('casinos', this.casinos);
    await Storage.set('settings', this.settings);
  },

  /* ---- Favorites ---- */
  isFavorite: function(id) {
    return this.favorites.indexOf(id) !== -1;
  },
  toggleFavorite: function(id) {
    var idx = this.favorites.indexOf(id);
    if (idx === -1) this.favorites.push(id);
    else this.favorites.splice(idx, 1);
    Storage.set('favorites', this.favorites);
    return this.isFavorite(id);
  },
  getFavoriteGames: function() {
    var self = this;
    var games = this.getActiveGames();
    return games.filter(function(g) { return self.isFavorite(g.id); });
  },

  /* ---- Currency helpers ---- */
  getCurrency: function() { return getCurrencyByCode(this.settings.currencyCode || 'RUB'); },
  getCurrencySymbol: function() { return this.getCurrency().symbol; },
  setCurrency: function(code) { this.settings.currencyCode = code; this.save(); },

  /* ---- Games CRUD ---- */
  getActiveGames: function() {
    return this.games.filter(function(g) { return g.active; }).sort(function(a, b) { return a.order - b.order; });
  },
  getAllGames: function() {
    return this.games.slice().sort(function(a, b) { return a.order - b.order; });
  },
  getBonusBuyGames: function() {
    return this.getActiveGames().filter(function(g) { return g.bonusBuy; });
  },
  getGameById: function(id) {
    for (var i = 0; i < this.games.length; i++) { if (this.games[i].id === id) return this.games[i]; }
    return null;
  },
  addGame: function(data) {
    var game = Object.assign({
      id: 'g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: '', symbol: '', url: '', provider: 'Pragmatic Play', tag: 'new',
      image: '', icon: '🎰', gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
      rtp: '96.50', maxWin: '5000x', volatility: 'medium', bonusBuy: false,
      order: this.games.length, active: true
    }, data);
    this.games.push(game);
    this.save();
    return game;
  },
  updateGame: function(id, data) {
    for (var i = 0; i < this.games.length; i++) {
      if (this.games[i].id === id) { Object.assign(this.games[i], data); this.save(); return this.games[i]; }
    }
    return null;
  },
  deleteGame: function(id) { this.games = this.games.filter(function(g) { return g.id !== id; }); this.save(); },

  /* ---- Casinos CRUD (unified with banners) ---- */
  getActiveCasinos: function() {
    return this.casinos.filter(function(c) { return c.active; }).sort(function(a, b) { return a.order - b.order; });
  },
  getAllCasinos: function() { return this.casinos.slice().sort(function(a, b) { return a.order - b.order; }); },
  getCasinoById: function(id) {
    for (var i = 0; i < this.casinos.length; i++) { if (this.casinos[i].id === id) return this.casinos[i]; }
    return null;
  },
  addCasino: function(data) {
    var c = Object.assign({
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: '', url: '', logo: '', bonus: '', description: '', badge: '',
      color: 'linear-gradient(135deg,#667eea,#764ba2)',
      bannerTitle: '', bannerSubtitle: '', bannerImage: '',
      order: this.casinos.length, active: true
    }, data);
    if (!c.bannerTitle) c.bannerTitle = c.bonus || c.name;
    if (!c.bannerSubtitle) c.bannerSubtitle = c.name;
    this.casinos.push(c); this.save(); return c;
  },
  updateCasino: function(id, data) {
    for (var i = 0; i < this.casinos.length; i++) {
      if (this.casinos[i].id === id) { Object.assign(this.casinos[i], data); this.save(); return this.casinos[i]; }
    }
    return null;
  },
  deleteCasino: function(id) { this.casinos = this.casinos.filter(function(c) { return c.id !== id; }); this.save(); },

  /* ---- Settings ---- */
  getSettings: function() { return this.settings; },
  updateSettings: function(data) { Object.assign(this.settings, data); this.save(); },

  /* ---- Game URL ---- */
  getGameUrl: function(game) {
    if (game.url) return game.url;
    var template = this.settings.demoUrlTemplate || DEFAULT_SETTINGS.demoUrlTemplate;
    var cur = this.getCurrency();
    return template.replace('{symbol}', game.symbol).replace('{lang}', cur.lang).replace('{currency}', cur.code);
  },

  getGameImageUrl: function(game) { return game.image || ''; },

  /* ---- Export / Import ---- */
  exportConfig: function() {
    return JSON.stringify({ games: this.games, casinos: this.casinos, settings: this.settings, exportedAt: new Date().toISOString() }, null, 2);
  },
  importConfig: async function(jsonStr) {
    try {
      var data = JSON.parse(jsonStr);
      if (data.games && Array.isArray(data.games)) this.games = data.games;
      if (data.casinos && Array.isArray(data.casinos)) this.casinos = data.casinos;
      if (data.settings) Object.assign(this.settings, data.settings);
      await this.save();
      return true;
    } catch (e) { return false; }
  },
  resetToDefaults: async function() {
    this.games = JSON.parse(JSON.stringify(DEFAULT_GAMES));
    this.casinos = JSON.parse(JSON.stringify(DEFAULT_CASINOS));
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    await Storage.remove('banners');
    await this.save();
  }
};
