/* ============================================
   DATA LAYER — Games, Casinos, Settings
   ============================================ */

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

var DEFAULT_GAMES = [
  /* ORIGINAL 24 GAMES (tag: popular / top) */
  { id: 'g1',  name: 'Sweet Bonanza',       symbol: 'vs20fruitsw',    provider: 'Pragmatic Play', tag: 'popular', icon: '🍬', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#A78BFA)', rtp: '96.48', maxWin: '21100x', volatility: 'high',   bonusBuy: true,  order: 0,  active: true },
  { id: 'g2',  name: 'Gates of Olympus',    symbol: 'vs20olympgate',  provider: 'Pragmatic Play', tag: 'popular', icon: '⚡', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.50', maxWin: '5000x',  volatility: 'high',   bonusBuy: true,  order: 1,  active: true },
  { id: 'g4',  name: 'The Dog House',       symbol: 'vs20doghouse',   provider: 'Pragmatic Play', tag: 'popular', icon: '🐕', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.51', maxWin: '6750x',  volatility: 'high',   bonusBuy: true,  order: 2,  active: true },
  { id: 'g5',  name: 'Starlight Princess',  symbol: 'vs20starlight',  provider: 'Pragmatic Play', tag: 'popular', icon: '⭐', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#C084FC)', rtp: '96.50', maxWin: '5000x',  volatility: 'high',   bonusBuy: true,  order: 3,  active: true },
  { id: 'g8',  name: 'Wild West Gold',      symbol: 'vs40wildwest',   provider: 'Pragmatic Play', tag: 'popular', icon: '🤠', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.51', maxWin: '10000x', volatility: 'medium', bonusBuy: false, order: 4,  active: true },
  { id: 'g9',  name: 'Wolf Gold',           symbol: 'vs25wolfgold',   provider: 'Pragmatic Play', tag: 'popular', icon: '🐺', image: '', gradient: 'linear-gradient(135deg,#08051A,#2E1065,#7C3AED)', rtp: '96.01', maxWin: '2500x',  volatility: 'high',   bonusBuy: false, order: 5,  active: true },
  { id: 'g10', name: 'Zeus vs Hades',       symbol: 'vs15godsofwar',  provider: 'Pragmatic Play', tag: 'popular', icon: '🔱', image: '', gradient: 'linear-gradient(135deg,#08051A,#3730A3,#8B5CF6)', rtp: '96.07', maxWin: '15000x', volatility: 'high',   bonusBuy: true,  order: 6,  active: true },
  { id: 'g12', name: 'Hand of Midas',       symbol: 'vs20midas',      provider: 'Pragmatic Play', tag: 'popular', icon: '👑', image: '', gradient: 'linear-gradient(135deg,#2E1065,#7C3AED,#A78BFA)', rtp: '96.54', maxWin: '5000x',  volatility: 'medium', bonusBuy: true,  order: 7,  active: true },
  { id: 'g3',  name: 'Sugar Rush',          symbol: 'vs20sugarrush',  provider: 'Pragmatic Play', tag: 'top', icon: '🍭', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#C084FC)', rtp: '96.50', maxWin: '5000x',  volatility: 'high',   bonusBuy: true,  order: 8,  active: true },
  { id: 'g6',  name: 'Big Bass Splash',     symbol: 'vs10txbigbass',  provider: 'Pragmatic Play', tag: 'top', icon: '🐟', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.71', maxWin: '5000x',  volatility: 'medium', bonusBuy: true,  order: 9,  active: true },
  { id: 'g7',  name: 'Fruit Party',         symbol: 'vs20fruitparty', provider: 'Pragmatic Play', tag: 'top', icon: '🍉', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A855F7)', rtp: '96.47', maxWin: '5000x',  volatility: 'medium', bonusBuy: true,  order: 10, active: true },
  { id: 'g14', name: 'Hot Fiesta',          symbol: 'vs25hotfiesta',  provider: 'Pragmatic Play', tag: 'top', icon: '🌶️', image: '', gradient: 'linear-gradient(135deg,#2E1065,#4338CA,#C084FC)', rtp: '96.56', maxWin: '5000x',  volatility: 'medium', bonusBuy: false, order: 11, active: true },
  { id: 'g15', name: 'Gems Bonanza',        symbol: 'vs20goldfever',  provider: 'Pragmatic Play', tag: 'top', icon: '💎', image: '', gradient: 'linear-gradient(135deg,#08051A,#2E1065,#C084FC)', rtp: '96.51', maxWin: '10000x', volatility: 'high',   bonusBuy: true,  order: 12, active: true },
  { id: 'g17', name: 'Big Bass Bonanza',    symbol: 'vs10bbbonanza',  provider: 'Pragmatic Play', tag: 'top', icon: '🎣', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#C084FC)', rtp: '96.71', maxWin: '2100x',  volatility: 'medium', bonusBuy: false, order: 13, active: true },
  { id: 'g20', name: 'Wisdom of Athena',    symbol: 'vs20procount',   provider: 'Pragmatic Play', tag: 'top', icon: '🦉', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.07', maxWin: '5000x',  volatility: 'high',   bonusBuy: true,  order: 14, active: true },
  { id: 'g21', name: 'Book of Fallen',      symbol: 'vs10bookfallen', provider: 'Pragmatic Play', tag: 'top', icon: '📖', image: '', gradient: 'linear-gradient(135deg,#08051A,#2E1065,#7C3AED)', rtp: '96.50', maxWin: '5000x',  volatility: 'high',   bonusBuy: false, order: 15, active: true },
  { id: 'g_mjwl2', name: 'Mahjong Wins 2', symbol: 'vswaysmjwl2', provider: 'Pragmatic Play', tag: 'popular', icon: '🀄', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#C084FC)', rtp: '96.50', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 15, active: true },
  { id: 'g13', name: 'Mustang Gold',        symbol: 'vs25mustang',    provider: 'Pragmatic Play', tag: 'popular', icon: '🐴', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#A78BFA)', rtp: '96.53', maxWin: '12000x', volatility: 'medium', bonusBuy: false, order: 16, active: true },
  { id: 'g19', name: 'Floating Dragon',     symbol: 'vs10floatdrg',   provider: 'Pragmatic Play', tag: 'top', icon: '🐉', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#3730A3,#A78BFA)', rtp: '96.71', maxWin: '50000x', volatility: 'medium', bonusBuy: true,  order: 17, active: true },
  { id: 'g23', name: 'Aztec Gems',          symbol: 'vs5aztecgems',   provider: 'Pragmatic Play', tag: 'popular', icon: '💚', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.52', maxWin: '375x',   volatility: 'medium', bonusBuy: false, order: 18, active: true },
  { id: 'g11', name: 'Cleocatra',           symbol: 'vs20cleocatra',  provider: 'Pragmatic Play', tag: 'top', icon: '🐱', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#C084FC)', rtp: '96.20', maxWin: '5000x',  volatility: 'medium', bonusBuy: true,  order: 19, active: true },
  { id: 'g16', name: 'Pirate Gold',         symbol: 'vs40pirate',     provider: 'Pragmatic Play', tag: 'popular', icon: '🏴‍☠️', image: '', gradient: 'linear-gradient(135deg,#08051A,#2E1065,#7C3AED)', rtp: '96.50', maxWin: '45000x', volatility: 'medium', bonusBuy: false, order: 20, active: true },
  { id: 'g18', name: 'Mochimon',            symbol: 'vs20mochimon',   provider: 'Pragmatic Play', tag: 'top', icon: '🧸', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#C084FC)', rtp: '96.46', maxWin: '5000x',  volatility: 'medium', bonusBuy: true,  order: 21, active: true },
  { id: 'g22', name: 'Sweet Bonanza Xmas',  symbol: 'vs20sbxmas',     provider: 'Pragmatic Play', tag: 'popular', icon: '🎄', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.48', maxWin: '21100x', volatility: 'high',   bonusBuy: true,  order: 22, active: true },
  { id: 'g28', name: 'Hot to Burn',         symbol: 'vs5hotburn',     provider: 'Pragmatic Play', tag: 'top', icon: '🔥', image: '', gradient: 'linear-gradient(135deg,#2E1065,#7C3AED,#C084FC)', rtp: '96.70', maxWin: '1000x',  volatility: 'low',    bonusBuy: false, order: 23, active: true },

  /* 80 MEGA UPDATE GAMES - 23 NEW SAFE REPLACEMENTS + WORKING GAMES */
  { id: 'g_kraken', name: 'Release the Kraken', symbol: 'vs20kraken', provider: 'Pragmatic Play', tag: 'popular', icon: '🦑', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.50', maxWin: '10000x', volatility: 'high', bonusBuy: true, order: 24, active: true },
  { id: 'g_madame', name: 'Madame Destiny MW', symbol: 'vswaysmadame', provider: 'Pragmatic Play', tag: 'top', icon: '🔮', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#C084FC)', rtp: '96.56', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 25, active: true },
  { id: 'g_dogmw', name: 'Dog House Megaways', symbol: 'vswaysdogs', provider: 'Pragmatic Play', tag: 'popular', icon: '🐶', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.55', maxWin: '12000x', volatility: 'high', bonusBuy: true, order: 26, active: true },
  { id: 'g_scarab', name: 'John Hunter Scarab', symbol: 'vs25scarabqueen', provider: 'Pragmatic Play', tag: 'top', icon: '🏜️', image: '', gradient: 'linear-gradient(135deg,#08051A,#3730A3,#A78BFA)', rtp: '96.50', maxWin: '10500x', volatility: 'medium', bonusBuy: false, order: 27, active: true },
  { id: 'g_rhino', name: 'Great Rhino MW', symbol: 'vswaysrhino', provider: 'Pragmatic Play', tag: 'popular', icon: '🦏', image: '', gradient: 'linear-gradient(135deg,#120833,#2E1065,#7C3AED)', rtp: '96.58', maxWin: '20000x', volatility: 'high', bonusBuy: false, order: 28, active: true },
  { id: 'g_bbhas', name: 'Big Bass Hold & Spinner', symbol: 'vs10bbhas', provider: 'Pragmatic Play', tag: 'popular', icon: '🎣', image: '', gradient: 'linear-gradient(135deg,#2E1065,#4338CA,#C084FC)', rtp: '96.07', maxWin: '10000x', volatility: 'high', bonusBuy: true, order: 29, active: true },
  { id: 'g_bufking', name: 'Buffalo King', symbol: 'vs4096bufking', provider: 'Pragmatic Play', tag: 'popular', icon: '🐃', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#3730A3,#8B5CF6)', rtp: '96.06', maxWin: '93750x', volatility: 'high', bonusBuy: false, order: 30, active: true },
  { id: 'g_sr1000', name: 'Sugar Rush 1000', symbol: 'vs20sugarrushx', provider: 'Pragmatic Play', tag: 'popular', icon: '🍬', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#C084FC)', rtp: '96.53', maxWin: '25000x', volatility: 'high', bonusBuy: true, order: 31, active: true },
  { id: 'g_oly1000', name: 'Gates of Olympus 1000', symbol: 'vs20olympx', provider: 'Pragmatic Play', tag: 'top', icon: '⚡', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.50', maxWin: '15000x', volatility: 'high', bonusBuy: true, order: 32, active: true },
  { id: 'g_star1000', name: 'Starlight Princess 1000', symbol: 'vs20starlightx', provider: 'Pragmatic Play', tag: 'popular', icon: '👸', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#C084FC)', rtp: '96.50', maxWin: '15000x', volatility: 'high', bonusBuy: true, order: 33, active: true },
  { id: 'g_sb1000', name: 'Sweet Bonanza 1000', symbol: 'vs20fruitswx', provider: 'Pragmatic Play', tag: 'top', icon: '🍭', image: '', gradient: 'linear-gradient(135deg,#2E1065,#7C3AED,#A78BFA)', rtp: '96.53', maxWin: '21100x', volatility: 'high', bonusBuy: true, order: 34, active: true },
  { id: 'g_aztecdx', name: 'Aztec Gems Deluxe', symbol: 'vs9aztecgemsdx', provider: 'Pragmatic Play', tag: 'popular', icon: '💎', image: '', gradient: 'linear-gradient(135deg,#08051A,#2E1065,#8B5CF6)', rtp: '96.50', maxWin: '22519x', volatility: 'high', bonusBuy: false, order: 35, active: true },
  { id: 'g_fparty2', name: 'Fruit Party 2', symbol: 'vs20fparty2', provider: 'Pragmatic Play', tag: 'popular', icon: '🍏', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#C084FC)', rtp: '96.53', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 36, active: true },
  { id: 'g_spartan', name: 'Spartan King', symbol: 'vs40spartaking', provider: 'Pragmatic Play', tag: 'top', icon: '🛡️', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.60', maxWin: '7480x', volatility: 'high', bonusBuy: false, order: 37, active: true },
  { id: 'g_wwgmw', name: 'Wild West Gold MW', symbol: 'vswayswildwest', provider: 'Pragmatic Play', tag: 'popular', icon: '🐎', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#A78BFA)', rtp: '96.44', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 38, active: true },
  { id: 'g_jokers', name: "Joker's Jewels", symbol: 'vs5joker', provider: 'Pragmatic Play', tag: 'popular', icon: '🤡', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.50', maxWin: '1040x', volatility: 'medium', bonusBuy: false, order: 39, active: true },
  { id: 'g_chilli', name: 'Chilli Heat', symbol: 'vs25chilli', provider: 'Pragmatic Play', tag: 'top', icon: '🌶️', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#C084FC)', rtp: '96.50', maxWin: '1000x', volatility: 'medium', bonusBuy: false, order: 40, active: true },
  { id: 'g_grush', name: 'Gold Rush', symbol: 'vs25goldrush', provider: 'Pragmatic Play', tag: 'popular', icon: '⛏️', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.50', maxWin: '2500x', volatility: 'medium', bonusBuy: false, order: 41, active: true },
  { id: 'g_grhino', name: 'Great Rhino', symbol: 'vs20rhino', provider: 'Pragmatic Play', tag: 'top', icon: '🦏', image: '', gradient: 'linear-gradient(135deg,#08051A,#2E1065,#7C3AED)', rtp: '96.53', maxWin: '900x', volatility: 'medium', bonusBuy: false, order: 42, active: true },
  { id: 'g_fstrike', name: 'Fire Strike', symbol: 'vs10firestrike', provider: 'Pragmatic Play', tag: 'popular', icon: '🔥', image: '', gradient: 'linear-gradient(135deg,#2E1065,#7C3AED,#A78BFA)', rtp: '96.50', maxWin: '25000x', volatility: 'medium', bonusBuy: false, order: 43, active: true },
  { id: 'g_voodoo', name: 'Voodoo Magic', symbol: 'vs40voodoo', provider: 'Pragmatic Play', tag: 'top', icon: '💀', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.50', maxWin: '1000x', volatility: 'high', bonusBuy: true, order: 44, active: true },
  { id: 'g_booktut', name: 'Book of Tut', symbol: 'vs10bookoftut', provider: 'Pragmatic Play', tag: 'top', icon: '📙', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.50', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 45, active: true },
  { id: 'g_ebank', name: 'Empty the Bank', symbol: 'vs20emptybank', provider: 'Pragmatic Play', tag: 'popular', icon: '🏦', image: '', gradient: 'linear-gradient(135deg,#08051A,#3730A3,#A78BFA)', rtp: '96.48', maxWin: '10000x', volatility: 'high', bonusBuy: true, order: 46, active: true },
  { id: 'g_5lionsmw', name: '5 Lions Megaways', symbol: 'vswayslions', provider: 'Pragmatic Play', tag: 'top', icon: '🦁', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#C084FC)', rtp: '96.50', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 47, active: true },
  { id: 'g_5lions', name: '5 Lions', symbol: 'vs243lions', provider: 'Pragmatic Play', tag: 'popular', icon: '🦁', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.50', maxWin: '3520x', volatility: 'high', bonusBuy: false, order: 48, active: true },
  { id: 'g_wolfmw', name: 'Werewolf Megaways', symbol: 'vswayswerewolf', provider: 'Pragmatic Play', tag: 'popular', icon: '🐺', image: '', gradient: 'linear-gradient(135deg,#120833,#2E1065,#7C3AED)', rtp: '96.50', maxWin: '40976x', volatility: 'high', bonusBuy: true, order: 49, active: true },
  { id: 'g_forge', name: 'Forge of Olympus', symbol: 'vs20forge', provider: 'Pragmatic Play', tag: 'top', icon: '🌋', image: '', gradient: 'linear-gradient(135deg,#2E1065,#4338CA,#C084FC)', rtp: '96.25', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 50, active: true },
  { id: 'g_bbb_mw', name: 'Big Bass Bonanza MW', symbol: 'vswaysbbb', provider: 'Pragmatic Play', tag: 'popular', icon: '🎣', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#C084FC)', rtp: '96.70', maxWin: '4000x', volatility: 'high', bonusBuy: true, order: 51, active: true },
  { id: 'g_grav', name: 'Gravity Bonanza', symbol: 'vs20gravity', provider: 'Pragmatic Play', tag: 'popular', icon: '🪐', image: '', gradient: 'linear-gradient(135deg,#08051A,#2E1065,#A78BFA)', rtp: '96.09', maxWin: '10000x', volatility: 'high', bonusBuy: true, order: 52, active: true },
  { id: 'g_drgtiger', name: 'Dragon Tiger', symbol: 'vs1024dtiger', provider: 'Pragmatic Play', tag: 'top', icon: '🐅', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.50', maxWin: '18125x', volatility: 'high', bonusBuy: false, order: 53, active: true },
  { id: 'g_congo', name: 'Congo Cash', symbol: 'vs432congocash', provider: 'Pragmatic Play', tag: 'popular', icon: '🦍', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#C084FC)', rtp: '96.51', maxWin: '5500x', volatility: 'high', bonusBuy: false, order: 54, active: true },
  { id: 'g_wwrmw', name: 'Wild Wild Riches MW', symbol: 'vswayswwriches', provider: 'Pragmatic Play', tag: 'top', icon: '🌈', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.02', maxWin: '10000x', volatility: 'high', bonusBuy: true, order: 55, active: true },
  { id: 'g_diamondst', name: 'Diamond Strike', symbol: 'vs15diamond', provider: 'Pragmatic Play', tag: 'popular', icon: '💎', image: '', gradient: 'linear-gradient(135deg,#08051A,#3730A3,#A78BFA)', rtp: '96.48', maxWin: '1000x', volatility: 'medium', bonusBuy: false, order: 56, active: true },
  { id: 'g_tictac', name: 'Tic Tac Take', symbol: 'vs10tictac', provider: 'Pragmatic Play', tag: 'popular', icon: '❌', image: '', gradient: 'linear-gradient(135deg,#120833,#2E1065,#7C3AED)', rtp: '96.63', maxWin: '2200x', volatility: 'high', bonusBuy: true, order: 57, active: true },
  { id: 'g_wildspells', name: 'Wild Spells', symbol: 'vs25wildspells', provider: 'Pragmatic Play', tag: 'top', icon: '🔮', image: '', gradient: 'linear-gradient(135deg,#2E1065,#4338CA,#C084FC)', rtp: '96.40', maxWin: '1250x', volatility: 'low', bonusBuy: false, order: 58, active: true },
  { id: 'g_masterj', name: 'Master Joker', symbol: 'vs1masterjoker', provider: 'Pragmatic Play', tag: 'popular', icon: '🃏', image: '', gradient: 'linear-gradient(135deg,#08051A,#2E1065,#C084FC)', rtp: '96.46', maxWin: '10000x', volatility: 'high', bonusBuy: false, order: 59, active: true },
  { id: 'g_mayang', name: 'John Hunter Mayan Gods', symbol: 'vs10mayangods', provider: 'Pragmatic Play', tag: 'top', icon: '🗿', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#3730A3,#8B5CF6)', rtp: '96.51', maxWin: '500x', volatility: 'high', bonusBuy: false, order: 60, active: true },
  { id: 'g_retdead', name: 'Return of the Dead', symbol: 'vs10returndead', provider: 'Pragmatic Play', tag: 'popular', icon: '🧟', image: '', gradient: 'linear-gradient(135deg,#120833,#2E1065,#7C3AED)', rtp: '96.71', maxWin: '5000x', volatility: 'high', bonusBuy: false, order: 61, active: true },
  { id: 'g_santa', name: 'Santa', symbol: 'vs20santa', provider: 'Pragmatic Play', tag: 'popular', icon: '🎅', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#C084FC)', rtp: '95.92', maxWin: '250x', volatility: 'medium', bonusBuy: false, order: 62, active: true },
  { id: 'g_pixie', name: 'Pixie Wings', symbol: 'vs50pixie', provider: 'Pragmatic Play', tag: 'top', icon: '🧚', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.51', maxWin: '500x', volatility: 'medium', bonusBuy: false, order: 63, active: true },
  { id: 'g_bbtick', name: 'Big Bass Keeping it Reel', symbol: 'vs10bbkir', provider: 'Pragmatic Play', tag: 'popular', icon: '🎣', image: '', gradient: 'linear-gradient(135deg,#08051A,#3730A3,#A78BFA)', rtp: '96.07', maxWin: '10000x', volatility: 'high', bonusBuy: true, order: 64, active: true },
  { id: 'g_hercules', name: 'Hercules and Pegasus', symbol: 'vs20hercpeg', provider: 'Pragmatic Play', tag: 'popular', icon: '🐎', image: '', gradient: 'linear-gradient(135deg,#120833,#2E1065,#7C3AED)', rtp: '96.50', maxWin: '2500x', volatility: 'high', bonusBuy: false, order: 65, active: true },
  { id: 'g_honey', name: 'Honey Honey Honey', symbol: 'vs20honey', provider: 'Pragmatic Play', tag: 'popular', icon: '🍯', image: '', gradient: 'linear-gradient(135deg,#2E1065,#4338CA,#C084FC)', rtp: '96.50', maxWin: '400x', volatility: 'medium', bonusBuy: false, order: 66, active: true },
  { id: 'g_wwriches', name: 'Wild Wild Riches', symbol: 'vs576treasures', provider: 'Pragmatic Play', tag: 'top', icon: '🌈', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.77', maxWin: '4600x', volatility: 'high', bonusBuy: false, order: 67, active: true },
  { id: 'g_egypt', name: 'Egyptian Fortunes', symbol: 'vs20egypt', provider: 'Pragmatic Play', tag: 'top', icon: '⚱️', image: '', gradient: 'linear-gradient(135deg,#08051A,#2E1065,#A78BFA)', rtp: '96.50', maxWin: '309x', volatility: 'medium', bonusBuy: false, order: 68, active: true },
  { id: 'g_safari', name: 'Safari King', symbol: 'vs50safariking', provider: 'Pragmatic Play', tag: 'top', icon: '🦁', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.49', maxWin: '1000x', volatility: 'high', bonusBuy: false, order: 69, active: true },
  { id: 'g_vegas', name: 'Vegas Magic', symbol: 'vs20vegasmagic', provider: 'Pragmatic Play', tag: 'popular', icon: '🎩', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.08', maxWin: '3549x', volatility: 'medium', bonusBuy: false, order: 71, active: true },
  { id: 'g_ekingrr', name: 'Emerald King Rainbow Road', symbol: 'vs20ekingrr', provider: 'Pragmatic Play', tag: 'popular', icon: '🍀', image: '', gradient: 'linear-gradient(135deg,#08051A,#3730A3,#A78BFA)', rtp: '96.71', maxWin: '20000x', volatility: 'high', bonusBuy: false, order: 72, active: true },
  { id: 'g_eyestorm', name: 'Eye of the Storm', symbol: 'vs10eyestorm', provider: 'Pragmatic Play', tag: 'top', icon: '👁️', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#C084FC)', rtp: '96.71', maxWin: '10000x', volatility: 'high', bonusBuy: false, order: 73, active: true },
  { id: 'g_peking', name: 'Peking Luck', symbol: 'vs25peking', provider: 'Pragmatic Play', tag: 'popular', icon: '🎭', image: '', gradient: 'linear-gradient(135deg,#2E1065,#4338CA,#C084FC)', rtp: '96.50', maxWin: '180000x', volatility: 'high', bonusBuy: false, order: 74, active: true },
  { id: 'g_temujin', name: 'Temujin Treasures', symbol: 'vs1024temuj', provider: 'Pragmatic Play', tag: 'popular', icon: '👲', image: '', gradient: 'linear-gradient(135deg,#08051A,#2E1065,#A78BFA)', rtp: '96.55', maxWin: '9000x', volatility: 'high', bonusBuy: true, order: 76, active: true },
  { id: 'g_kraken2', name: 'Release the Kraken 2', symbol: 'vs20kraken2', provider: 'Pragmatic Play', tag: 'top', icon: '🦑', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.50', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 77, active: true },
  { id: 'g_wildb', name: 'Wild Booster', symbol: 'vs20wildboost', provider: 'Pragmatic Play', tag: 'top', icon: '🍒', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#C084FC)', rtp: '96.47', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 78, active: true },
  { id: 'g_chick', name: 'Chicken Drop', symbol: 'vs20chickdrop', provider: 'Pragmatic Play', tag: 'popular', icon: '🐔', image: '', gradient: 'linear-gradient(135deg,#08051A,#3730A3,#A78BFA)', rtp: '96.50', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 80, active: true },
  { id: 'g_fltdrgmw', name: 'Floating Dragon MW', symbol: 'vswaysfltdrg', provider: 'Pragmatic Play', tag: 'top', icon: '🪁', image: '', gradient: 'linear-gradient(135deg,#120833,#2E1065,#7C3AED)', rtp: '96.70', maxWin: '20000x', volatility: 'high', bonusBuy: true, order: 81, active: true },
  { id: 'g_bufrhinomw', name: 'Buffalo King Megaways', symbol: 'vswaysbufking', provider: 'Pragmatic Play', tag: 'top', icon: '🦬', image: '', gradient: 'linear-gradient(135deg,#2E1065,#4338CA,#C084FC)', rtp: '96.52', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 82, active: true },
  { id: 'g_thor', name: 'Power of Thor Megaways', symbol: 'vswayshammthor', provider: 'Pragmatic Play', tag: 'popular', icon: '⚡', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#3730A3,#8B5CF6)', rtp: '96.55', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 83, active: true },
  { id: 'g_gobnudge', name: 'Goblin Heist PowerNudge', symbol: 'vs20gobnudge', provider: 'Pragmatic Play', tag: 'top', icon: '👺', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.47', maxWin: '4000x', volatility: 'high', bonusBuy: true, order: 85, active: true },
  { id: 'g_piggy', name: 'Piggy Bank Bills', symbol: 'vs9piggybank', provider: 'Pragmatic Play', tag: 'popular', icon: '🐷', image: '', gradient: 'linear-gradient(135deg,#120833,#2E1065,#7C3AED)', rtp: '96.50', maxWin: '5000x', volatility: 'high', bonusBuy: false, order: 86, active: true },
  { id: 'g_trop', name: 'Club Tropicana', symbol: 'vs12tropicana', provider: 'Pragmatic Play', tag: 'top', icon: '🍹', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.08', maxWin: '4000x', volatility: 'high', bonusBuy: true, order: 87, active: true },
  { id: 'g_magician', name: "Magician's Secrets", symbol: 'vs4096magician', provider: 'Pragmatic Play', tag: 'popular', icon: '🧙', image: '', gradient: 'linear-gradient(135deg,#120833,#2E1065,#7C3AED)', rtp: '96.51', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 89, active: true },
  { id: 'g_cryscav', name: 'Crystal Caverns MW', symbol: 'vswayscryscav', provider: 'Pragmatic Play', tag: 'top', icon: '💎', image: '', gradient: 'linear-gradient(135deg,#2E1065,#4338CA,#C084FC)', rtp: '96.46', maxWin: '10000x', volatility: 'high', bonusBuy: true, order: 90, active: true },
  { id: 'g_bigjuan', name: 'Big Juan', symbol: 'vs40bigjuan', provider: 'Pragmatic Play', tag: 'top', icon: '🌶️', image: '', gradient: 'linear-gradient(135deg,#2E1065,#4338CA,#C084FC)', rtp: '96.70', maxWin: '2600x', volatility: 'high', bonusBuy: true, order: 91, active: true },
  { id: 'g_fishe', name: 'Fish Eye', symbol: 'vs10fisheye', provider: 'Pragmatic Play', tag: 'top', icon: '👁️', image: '', gradient: 'linear-gradient(135deg,#08051A,#2E1065,#A78BFA)', rtp: '96.07', maxWin: '10000x', volatility: 'high', bonusBuy: true, order: 92, active: true },
  { id: 'g_superx', name: 'Super X', symbol: 'vs20superx', provider: 'Pragmatic Play', tag: 'popular', icon: '❌', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.56', maxWin: '9000x', volatility: 'high', bonusBuy: false, order: 93, active: true },
  { id: 'g_daydead', name: 'Day of Dead', symbol: 'vs20daydead', provider: 'Pragmatic Play', tag: 'top', icon: '💀', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#C084FC)', rtp: '96.49', maxWin: '4500x', volatility: 'high', bonusBuy: false, order: 94, active: true },
  { id: 'g_santaw', name: 'Santas Wonderland', symbol: 'vs20santawonder', provider: 'Pragmatic Play', tag: 'popular', icon: '🎁', image: '', gradient: 'linear-gradient(135deg,#08051A,#3730A3,#A78BFA)', rtp: '96.23', maxWin: '7500x', volatility: 'high', bonusBuy: true, order: 95, active: true },
  { id: 'g_goldp', name: 'Gold Party', symbol: 'vs25goldparty', provider: 'Pragmatic Play', tag: 'top', icon: '🪙', image: '', gradient: 'linear-gradient(135deg,#120833,#2E1065,#7C3AED)', rtp: '96.50', maxWin: '5163x', volatility: 'high', bonusBuy: true, order: 96, active: true },
  { id: 'g_yumyum', name: 'Yum Yum Powerways', symbol: 'vswaysyumyum', provider: 'Pragmatic Play', tag: 'popular', icon: '🍔', image: '', gradient: 'linear-gradient(135deg,#120833,#2E1065,#7C3AED)', rtp: '96.43', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 97, active: true },
  { id: 'g_samurai', name: 'Rise of Samurai MW', symbol: 'vswayssamurai', provider: 'Pragmatic Play', tag: 'top', icon: '🥷', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#3730A3,#8B5CF6)', rtp: '96.46', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 99, active: true },
  { id: 'g_rockv', name: 'Rock Vegas', symbol: 'vs20rockvegas', provider: 'Pragmatic Play', tag: 'popular', icon: '🪨', image: '', gradient: 'linear-gradient(135deg,#08051A,#3730A3,#A78BFA)', rtp: '96.64', maxWin: '10000x', volatility: 'high', bonusBuy: false, order: 100, active: true },
  { id: 'g_candyb', name: 'Candy Blitz', symbol: 'vs20candyblitz', provider: 'Pragmatic Play', tag: 'top', icon: '🍭', image: '', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.02', maxWin: '10000x', volatility: 'high', bonusBuy: true, order: 101, active: true },
  { id: 'g_rio', name: 'Heart of Rio', symbol: 'vs25rio', provider: 'Pragmatic Play', tag: 'popular', icon: '🦜', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#C084FC)', rtp: '96.50', maxWin: '10500x', volatility: 'medium', bonusBuy: false, order: 102, active: true },
  { id: 'g_chicken', name: 'The Great Chicken Escape', symbol: 'vs20chicken', provider: 'Pragmatic Play', tag: 'top', icon: '🐔', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.50', maxWin: '5000x', volatility: 'medium', bonusBuy: false, order: 103, active: true },
  { id: 'g_bbarnhouse', name: 'Bigger Barn House Bonanza', symbol: 'vswaysbbarnh', provider: 'Pragmatic Play', tag: 'new', icon: '🚜', image: '', gradient: 'linear-gradient(135deg,#2E1065,#6D28D9,#C084FC)', rtp: '96.50', maxWin: '10000x', volatility: 'high', bonusBuy: true, order: 104, active: true },
  { id: 'g_mummy100', name: 'Mummy\'s Jewels 100', symbol: 'vswaysmjwl2', url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vswaysmjwl2&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fwww.pragmaticplay.com%2Fen%2F&lang={lang}&cur={currency}', provider: 'Pragmatic Play', tag: 'new', icon: '💎', image: '', gradient: 'linear-gradient(135deg,#1E0A4B,#4338CA,#A78BFA)', rtp: '96.50', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 105, active: true },
  { id: 'g_osiris', name: 'Treasures of Osiris', symbol: 'vs25tripleps', provider: 'Pragmatic Play', tag: 'new', icon: '⚱️', image: '', gradient: 'linear-gradient(135deg,#08051A,#3730A3,#A78BFA)', rtp: '96.50', maxWin: '5000x', volatility: 'high', bonusBuy: true, order: 106, active: true }
];

var GAME_ICONS = {};
for (var _gi = 0; _gi < DEFAULT_GAMES.length; _gi++) {
  GAME_ICONS[DEFAULT_GAMES[_gi].id] = DEFAULT_GAMES[_gi].icon;
}

var DEFAULT_CASINOS = [
  {
    id: 'c1', name: '1win Casino',
    url: 'https://1wzaig.com/v3/aggressive-casino?p=akqd',
    logo: '',
    bonus: 'До 500% на первый депозит',
    description: 'Топовое казино с моментальными выплатами, более 5000 игр и щедрой бонусной программой. Вывод на карту за 5 минут.',
    badge: '⚡ ХИТ',
    color: 'linear-gradient(135deg, #2E1065, #6D28D9, #A78BFA)',
    bannerTitle: 'Бонус 500% на депозит',
    bannerSubtitle: '1win Casino — Лучшее предложение 2026',
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
    color: 'linear-gradient(135deg, #120833, #4338CA, #C084FC)',
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
    color: 'linear-gradient(135deg, #08051A, #2E1065, #7C3AED)',
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
    color: 'linear-gradient(135deg, #2E1065, #4338CA, #A78BFA)',
    bannerTitle: 'Моментальные выплаты',
    bannerSubtitle: 'Вывод за 5 минут на любую карту',
    bannerImage: '',
    order: 3, active: true
  }
];

var DEFAULT_SETTINGS = {
  appName: 'SlotX',
  currencyCode: 'RUB',
  demoUrlTemplate: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol={symbol}&jurisdiction=99&lang={lang}&cur={currency}',
  gameImageUrlTemplate: '',
  dataVersion: 93
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
   DATA STORE
   ============================================ */
var DataStore = {
  games: [],
  casinos: [],
  settings: {},
  favorites: [],
  activity: {},
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
      await Storage.remove('banners');
    } else {
      this.games = savedGames || JSON.parse(JSON.stringify(DEFAULT_GAMES));
      this.casinos = savedCasinos || JSON.parse(JSON.stringify(DEFAULT_CASINOS));
      this.settings = savedSettings || JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }

    if (!this.settings.currencyCode) this.settings.currencyCode = 'RUB';
    if (!this.settings.demoUrlTemplate) this.settings.demoUrlTemplate = DEFAULT_SETTINGS.demoUrlTemplate;
    if (this.settings.gameImageUrlTemplate === undefined) this.settings.gameImageUrlTemplate = '';

    for (var i = 0; i < this.games.length; i++) {
      var g = this.games[i];
      if (!g.icon && GAME_ICONS[g.id]) g.icon = GAME_ICONS[g.id];
      if (!g.volatility) g.volatility = 'medium';
      if (g.bonusBuy === undefined) g.bonusBuy = false;
    }

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

    this.activity = await Storage.get('activity', {
      sessions: 0, firstVisit: null, lastVisit: null,
      gameLaunches: {}, affiliateClicks: 0, totalPlays: 0,
      userInfo: null
    });

    this._ready = true;
    await this.save();
  },

  async save() {
    await Storage.set('games', this.games);
    await Storage.set('casinos', this.casinos);
    await Storage.set('settings', this.settings);
  },

  isFavorite: function(id) { return this.favorites.indexOf(id) !== -1; },
  toggleFavorite: function(id) {
    var idx = this.favorites.indexOf(id);
    if (idx === -1) this.favorites.push(id); else this.favorites.splice(idx, 1);
    Storage.set('favorites', this.favorites);
    return this.isFavorite(id);
  },
  getFavoriteGames: function() {
    var self = this;
    return this.getActiveGames().filter(function(g) { return self.isFavorite(g.id); });
  },

  getCurrency: function() { return getCurrencyByCode(this.settings.currencyCode || 'RUB'); },
  getCurrencySymbol: function() { return this.getCurrency().symbol; },
  setCurrency: function(code) { this.settings.currencyCode = code; this.save(); },

  getActiveGames: function() { return this.games.filter(function(g) { return g.active; }).sort(function(a, b) { return a.order - b.order; }); },
  getAllGames: function() { return this.games.slice().sort(function(a, b) { return a.order - b.order; }); },
  getBonusBuyGames: function() { return this.getActiveGames().filter(function(g) { return g.bonusBuy; }); },
  getGameById: function(id) { for (var i = 0; i < this.games.length; i++) { if (this.games[i].id === id) return this.games[i]; } return null; },
  addGame: function(data) {
    var game = Object.assign({ id: 'g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), name: '', symbol: '', url: '', provider: 'Pragmatic Play', tag: 'new', image: '', icon: '🎰', gradient: 'linear-gradient(135deg,#120833,#3730A3,#7C3AED)', rtp: '96.50', maxWin: '5000x', volatility: 'medium', bonusBuy: false, order: this.games.length, active: true }, data);
    this.games.push(game); this.save(); return game;
  },
  updateGame: function(id, data) { for (var i = 0; i < this.games.length; i++) { if (this.games[i].id === id) { Object.assign(this.games[i], data); this.save(); return this.games[i]; } } return null; },
  deleteGame: function(id) { this.games = this.games.filter(function(g) { return g.id !== id; }); this.save(); },

  getActiveCasinos: function() { return this.casinos.filter(function(c) { return c.active; }).sort(function(a, b) { return a.order - b.order; }); },
  getAllCasinos: function() { return this.casinos.slice().sort(function(a, b) { return a.order - b.order; }); },
  getCasinoById: function(id) { for (var i = 0; i < this.casinos.length; i++) { if (this.casinos[i].id === id) return this.casinos[i]; } return null; },
  addCasino: function(data) {
    var c = Object.assign({ id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), name: '', url: '', logo: '', bonus: '', description: '', badge: '', color: 'linear-gradient(135deg,#2E1065,#4338CA,#A78BFA)', bannerTitle: '', bannerSubtitle: '', bannerImage: '', order: this.casinos.length, active: true }, data);
    if (!c.bannerTitle) c.bannerTitle = c.bonus || c.name;
    if (!c.bannerSubtitle) c.bannerSubtitle = c.name;
    this.casinos.push(c); this.save(); return c;
  },
  updateCasino: function(id, data) { for (var i = 0; i < this.casinos.length; i++) { if (this.casinos[i].id === id) { Object.assign(this.casinos[i], data); this.save(); return this.casinos[i]; } } return null; },
  deleteCasino: function(id) { this.casinos = this.casinos.filter(function(c) { return c.id !== id; }); this.save(); },

  getSettings: function() { return this.settings; },
  updateSettings: function(data) { Object.assign(this.settings, data); this.save(); },

  getGameUrl: function(game) {
    var template = game.url || this.settings.demoUrlTemplate || DEFAULT_SETTINGS.demoUrlTemplate;
    var cur = this.getCurrency();
    return template.replace('{symbol}', game.symbol).replace('{lang}', cur.lang).replace('{currency}', cur.code);
  },

  getGameImageUrl: function(game) {
    if (game.image) return game.image;
    if (game.symbol && this.settings.gameImageUrlTemplate) return this.settings.gameImageUrlTemplate.replace('{symbol}', game.symbol);
    return '';
  },

  exportConfig: function() { return JSON.stringify({ games: this.games, casinos: this.casinos, settings: this.settings, exportedAt: new Date().toISOString() }, null, 2); },
  importConfig: async function(jsonStr) {
    try { var data = JSON.parse(jsonStr); if (data.games && Array.isArray(data.games)) this.games = data.games; if (data.casinos && Array.isArray(data.casinos)) this.casinos = data.casinos; if (data.settings) Object.assign(this.settings, data.settings); await this.save(); return true; } catch (e) { return false; }
  },

  async trackSession() {
    var act = this.activity;
    act.sessions = (act.sessions || 0) + 1;
    if (!act.firstVisit) act.firstVisit = new Date().toISOString();
    act.lastVisit = new Date().toISOString();
    if (window.TG && TG.user) {
      act.userInfo = { id: TG.userId, firstName: TG.user.first_name || '', lastName: TG.user.last_name || '', username: TG.userUsername || '', lang: TG.userLang || '', isPremium: TG.isPremium || false, platform: TG.platform || 'browser' };
    }
    this.activity = act;
    await Storage.set('activity', act);
  },

  trackGamePlay: function(gameId) {
    if (!this.activity.gameLaunches) this.activity.gameLaunches = {};
    this.activity.gameLaunches[gameId] = (this.activity.gameLaunches[gameId] || 0) + 1;
    this.activity.totalPlays = (this.activity.totalPlays || 0) + 1;
    Storage.set('activity', this.activity);
  },

  trackAffiliateClick: function() {
    this.activity.affiliateClicks = (this.activity.affiliateClicks || 0) + 1;
    Storage.set('activity', this.activity);
  },

  getActivity: function() { return this.activity || {}; },

  resetToDefaults: async function() {
    this.games = JSON.parse(JSON.stringify(DEFAULT_GAMES));
    this.casinos = JSON.parse(JSON.stringify(DEFAULT_CASINOS));
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    await Storage.remove('banners');
    await this.save();
  }
};
