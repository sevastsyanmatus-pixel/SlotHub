/* ============================================
   i18n — Internationalization System
   Auto-detects language from Telegram / browser
   ============================================ */
var I18n = (function() {

  var currentLang = 'ru';

  /* Supported languages */
  var LANGS = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
    { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦', nativeName: 'Українська' },
    { code: 'kk', name: 'Қазақша', flag: '🇰🇿', nativeName: 'Қазақша' },
    { code: 'uz', name: "O'zbekcha", flag: '🇺🇿', nativeName: "O'zbekcha" },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷', nativeName: 'Türkçe' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'pt', name: 'Português', flag: '🇧🇷', nativeName: 'Português' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱', nativeName: 'Polski' },
    { code: 'cs', name: 'Čeština', flag: '🇨🇿', nativeName: 'Čeština' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
    { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
    { code: 'zh', name: '中文', flag: '🇨🇳', nativeName: '中文' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', nativeName: 'हिन्दी' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', nativeName: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾', nativeName: 'Bahasa Melayu' },
    { code: 'ro', name: 'Română', flag: '🇷🇴', nativeName: 'Română' },
    { code: 'hu', name: 'Magyar', flag: '🇭🇺', nativeName: 'Magyar' },
    { code: 'bg', name: 'Български', flag: '🇧🇬', nativeName: 'Български' },
    { code: 'be', name: 'Беларуская', flag: '🇧🇾', nativeName: 'Беларуская' },
    { code: 'ka', name: 'ქართული', flag: '🇬🇪', nativeName: 'ქართული' },
    { code: 'hy', name: 'Հայերեն', flag: '🇦🇲', nativeName: 'Հայերեն' },
    { code: 'az', name: 'Azərbaycanca', flag: '🇦🇿', nativeName: 'Azərbaycanca' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪', nativeName: 'Svenska' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴', nativeName: 'Norsk' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰', nativeName: 'Dansk' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱', nativeName: 'Nederlands' },
    { code: 'fi', name: 'Suomi', flag: '🇫🇮', nativeName: 'Suomi' }
  ];

  /* ============================================
     TRANSLATIONS
     ============================================ */
  var T = {
    /* --- Navigation --- */
    'nav.home': {
      ru: 'Главная', en: 'Home', uk: 'Головна', kk: 'Басты', uz: 'Bosh sahifa',
      tr: 'Ana Sayfa', de: 'Startseite', fr: 'Accueil', es: 'Inicio', pt: 'Início',
      it: 'Home', pl: 'Strona główna', cs: 'Domů', ja: 'ホーム', ko: '홈',
      zh: '首页', hi: 'होम', ar: 'الرئيسية', th: 'หน้าหลัก', vi: 'Trang chủ',
      id: 'Beranda', ms: 'Utama', ro: 'Acasă', hu: 'Főoldal', bg: 'Начало',
      be: 'Галоўная', ka: 'მთავარი', hy: 'Գլխdelays', az: 'Ana Səhifə',
      sv: 'Hem', no: 'Hjem', da: 'Hjem', nl: 'Home', fi: 'Koti'
    },
    'nav.games': {
      ru: 'Игры', en: 'Games', uk: 'Ігри', kk: 'Ойындар', uz: "O'yinlar",
      tr: 'Oyunlar', de: 'Spiele', fr: 'Jeux', es: 'Juegos', pt: 'Jogos',
      it: 'Giochi', pl: 'Gry', cs: 'Hry', ja: 'ゲーム', ko: '게임',
      zh: '游戏', hi: 'गेम्स', ar: 'الألعاب', th: 'เกม', vi: 'Trò chơi',
      id: 'Permainan', ms: 'Permainan', ro: 'Jocuri', hu: 'Játékok', bg: 'Игри',
      be: 'Гульні', ka: 'თამაშები', hy: 'Խաղեर', az: 'Oyunlar',
      sv: 'Spel', no: 'Spill', da: 'Spil', nl: 'Spellen', fi: 'Pelit'
    },
    'nav.bonuses': {
      ru: 'Бонусы', en: 'Bonuses', uk: 'Бонуси', kk: 'Бонустар', uz: 'Bonuslar',
      tr: 'Bonuslar', de: 'Boni', fr: 'Bonus', es: 'Bonos', pt: 'Bônus',
      it: 'Bonus', pl: 'Bonusy', cs: 'Bonusy', ja: 'ボーナス', ko: '보너스',
      zh: '奖金', hi: 'बोनस', ar: 'المكافآت', th: 'โบนัส', vi: 'Thưởng',
      id: 'Bonus', ms: 'Bonus', ro: 'Bonusuri', hu: 'Bónuszok', bg: 'Бонуси',
      be: 'Бонусы', ka: 'ბონუსები', hy: 'Բոնdelays', az: 'Bonuslar',
      sv: 'Bonusar', no: 'Bonuser', da: 'Bonusser', nl: 'Bonussen', fi: 'Bonukset'
    },
    'nav.more': {
      ru: 'Ещё', en: 'More', uk: 'Ще', kk: 'Ещё', uz: 'Yana',
      tr: 'Daha', de: 'Mehr', fr: 'Plus', es: 'Más', pt: 'Mais',
      it: 'Altro', pl: 'Więcej', cs: 'Více', ja: 'もっと', ko: '더보기',
      zh: '更多', hi: 'अधिक', ar: 'المزيد', th: 'เพิ่มเติม', vi: 'Thêm',
      id: 'Lainnya', ms: 'Lagi', ro: 'Mai mult', hu: 'Több', bg: 'Още',
      be: 'Яшчэ', ka: 'მეტი', hy: 'Ավdelays', az: 'Daha',
      sv: 'Mer', no: 'Mer', da: 'Mere', nl: 'Meer', fi: 'Lisää'
    },

    /* --- Header --- */
    'header.subtitle': {
      ru: 'Демо-слоты бесплатно', en: 'Free demo slots', uk: 'Демо-слоти безкоштовно',
      kk: 'Тегін демо-слоттар', uz: 'Bepul demo slotlar', tr: 'Ücretsiz demo slotlar',
      de: 'Kostenlose Demo-Slots', fr: 'Machines à sous démo gratuites', es: 'Tragamonedas demo gratis',
      pt: 'Slots demo grátis', it: 'Slot demo gratuiti', pl: 'Darmowe sloty demo',
      cs: 'Bezplatné demo sloty', ja: '無料デモスロット', ko: '무료 데모 슬롯',
      zh: '免费试玩老虎机', hi: 'फ्री डेमो स्लॉट्स', ar: 'ماكينات سلوت تجريبية مجانية',
      th: 'เล่นสล็อตฟรี', vi: 'Slot demo miễn phí',
      id: 'Slot demo gratis', ms: 'Slot demo percuma', ro: 'Sloturi demo gratuite',
      hu: 'Ingyenes demo nyerőgépek', bg: 'Безплатни демо слотове',
      be: 'Бясплатныя дэма-слоты', ka: 'უფასო დემო სლოტები', hy: 'Անvaysays դեdelays',
      az: 'Pulsuz demo slotlar', sv: 'Gratis demoslotar', no: 'Gratis demoslotar',
      da: 'Gratis demoslots', nl: 'Gratis demoslots', fi: 'Ilmaiset demopelit'
    },

    /* --- Sections --- */
    'section.favorites': { ru: 'Избранное', en: 'Favorites', uk: 'Обране', tr: 'Favoriler', de: 'Favoriten', fr: 'Favoris', es: 'Favoritos', pt: 'Favoritos', it: 'Preferiti', pl: 'Ulubione', cs: 'Oblíbené', ja: 'お気に入り', ko: '즐겨찾기', zh: '收藏', hi: 'पसंदीदा', ar: 'المفضلة', th: 'รายการโปรด', vi: 'Yêu thích', id: 'Favorit', kk: 'Таңдаулы', uz: 'Sevimlilar' },
    'section.recent': { ru: 'Недавние', en: 'Recent', uk: 'Нещодавні', tr: 'Son Oynanlar', de: 'Kürzlich', fr: 'Récents', es: 'Recientes', pt: 'Recentes', it: 'Recenti', pl: 'Ostatnie', cs: 'Nedávné', ja: '最近', ko: '최근', zh: '最近', hi: 'हाल ही', ar: 'الأخيرة', th: 'ล่าสุด', vi: 'Gần đây', id: 'Terbaru', kk: 'Жақындағы', uz: 'Yaqinda' },
    'section.popular': { ru: 'Популярное', en: 'Popular', uk: 'Популярне', tr: 'Popüler', de: 'Beliebt', fr: 'Populaire', es: 'Popular', pt: 'Popular', it: 'Popolare', pl: 'Popularne', cs: 'Populární', ja: '人気', ko: '인기', zh: '热门', hi: 'लोकप्रिय', ar: 'شائع', th: 'ยอดนิยม', vi: 'Phổ biến', id: 'Populer', kk: 'Танымал', uz: 'Mashhur' },
    'section.top': { ru: 'Топ слоты', en: 'Top Slots', uk: 'Топ слоти', tr: 'En İyiler', de: 'Top Slots', fr: 'Top Machines', es: 'Top Slots', pt: 'Top Slots', it: 'Top Slot', pl: 'Najlepsze', cs: 'Top Sloty', ja: 'トップ', ko: '탑 슬롯', zh: '顶级老虎机', hi: 'टॉप स्लॉट', ar: 'أفضل السلوت', th: 'สล็อตยอดนิยม', vi: 'Slot hàng đầu', id: 'Slot Teratas', kk: 'Үздік слоттар', uz: 'Top slotlar' },
    'section.new': { ru: 'Новинки', en: 'New', uk: 'Новинки', tr: 'Yeni', de: 'Neu', fr: 'Nouveau', es: 'Nuevo', pt: 'Novo', it: 'Nuovo', pl: 'Nowości', cs: 'Nové', ja: '新着', ko: '신규', zh: '新品', hi: 'नया', ar: 'جديد', th: 'ใหม่', vi: 'Mới', id: 'Baru', kk: 'Жаңа', uz: 'Yangi' },
    'section.bonusBuy': { ru: 'Bonus Buy', en: 'Bonus Buy', uk: 'Bonus Buy', tr: 'Bonus Al', de: 'Bonus Kauf', fr: 'Achat Bonus', es: 'Compra Bonus', pt: 'Compra de Bônus', it: 'Compra Bonus', pl: 'Kup Bonus', cs: 'Nákup Bonusu', ja: 'ボーナス購入', ko: '보너스 구매', zh: '购买奖金', hi: 'बोनस खरीदें', ar: 'شراء مكافأة', th: 'ซื้อโบนัส', vi: 'Mua Bonus', id: 'Beli Bonus', kk: 'Bonus сатып алу', uz: 'Bonus sotib olish' },
    'section.topWins': { ru: 'Топ выигрышей', en: 'Top Wins', uk: 'Топ виграшів', tr: 'En Büyük Kazançlar', de: 'Top Gewinne', fr: 'Top Gains', es: 'Mejores Ganancias', pt: 'Maiores Ganhos' },
    'section.bestCasinos': { ru: 'Лучшие казино', en: 'Best Casinos', uk: 'Найкращі казино', tr: 'En İyi Casinolar', de: 'Beste Casinos', fr: 'Meilleurs Casinos', es: 'Mejores Casinos', pt: 'Melhores Casinos' },

    /* --- Profile --- */
    'profile.guest': { ru: 'Гость', en: 'Guest', uk: 'Гість', tr: 'Misafir', de: 'Gast', fr: 'Invité', es: 'Invitado', pt: 'Convidado', it: 'Ospite', pl: 'Gość', cs: 'Host', ja: 'ゲスト', ko: '게스트', zh: '游客', hi: 'अतिथि', ar: 'ضيف', th: 'ผู้เยี่ยมชม', vi: 'Khách', id: 'Tamu', kk: 'Қонақ', uz: 'Mehmon' },
    'profile.welcome': { ru: 'Добро пожаловать в SlotX!', en: 'Welcome to SlotX!', uk: 'Ласкаво просимо до SlotX!', tr: "SlotX'e hoş geldiniz!", de: 'Willkommen bei SlotX!', fr: 'Bienvenue sur SlotX !', es: '¡Bienvenido a SlotX!', pt: 'Bem-vindo ao SlotX!' },
    'profile.games': { ru: 'Игр', en: 'Played', uk: 'Ігор', tr: 'Oyun', de: 'Spiele', fr: 'Joués', es: 'Jugados', pt: 'Jogados' },
    'profile.favs': { ru: 'Избр.', en: 'Favs', uk: 'Обр.', tr: 'Fav.', de: 'Fav.', fr: 'Fav.', es: 'Fav.', pt: 'Fav.' },
    'profile.time': { ru: 'Время', en: 'Time', uk: 'Час', tr: 'Süre', de: 'Zeit', fr: 'Temps', es: 'Tiempo', pt: 'Tempo' },
    'profile.level': { ru: 'Уровень', en: 'Level', uk: 'Рівень', tr: 'Seviye', de: 'Level', fr: 'Niveau', es: 'Nivel', pt: 'Nível' },
    'profile.soundOn': { ru: 'Звук вкл', en: 'Sound on', uk: 'Звук увімк', tr: 'Ses açık', de: 'Ton an', fr: 'Son activé', es: 'Sonido sí', pt: 'Som ligado' },
    'profile.soundOff': { ru: 'Звук выкл', en: 'Sound off', uk: 'Звук вимк', tr: 'Ses kapalı', de: 'Ton aus', fr: 'Son désactivé', es: 'Sonido no', pt: 'Som desligado' },
    'profile.playReal': { ru: 'Играйте на реальные!', en: 'Play for real!', uk: 'Грайте на реальні!', tr: 'Gerçek oyna!', de: 'Echt spielen!', fr: 'Jouez pour de vrai !', es: '¡Juega de verdad!', pt: 'Jogue de verdade!' },
    'profile.bonusDeposit': { ru: 'Бонус до 500% на депозит', en: 'Bonus up to 500% on deposit', uk: 'Бонус до 500% на депозит', tr: 'Depozitoya %500 bonus', de: 'Bonus bis 500% auf Einzahlung', fr: 'Bonus jusqu\'à 500% sur le dépôt', es: 'Bono hasta 500% en depósito', pt: 'Bônus até 500% no depósito' },
    'profile.adminPanel': { ru: 'Админ-панель', en: 'Admin Panel', uk: 'Адмін-панель', tr: 'Yönetim Paneli', de: 'Admin-Panel', fr: 'Panneau admin', es: 'Panel de admin', pt: 'Painel admin' },

    /* --- Theme --- */
    'theme.title': { ru: 'Тема', en: 'Theme', uk: 'Тема', tr: 'Tema', de: 'Thema', fr: 'Thème', es: 'Tema', pt: 'Tema', it: 'Tema', pl: 'Motyw', cs: 'Téma', ja: 'テーマ', ko: '테마', zh: '主题', hi: 'थीम', ar: 'السمة', th: 'ธีม', vi: 'Chủ đề', id: 'Tema', kk: 'Тақырып', uz: 'Mavzu' },
    'theme.dark': { ru: 'Тёмная', en: 'Dark', uk: 'Темна', tr: 'Karanlık', de: 'Dunkel', fr: 'Sombre', es: 'Oscuro', pt: 'Escuro', it: 'Scuro', pl: 'Ciemny', cs: 'Tmavý', ja: 'ダーク', ko: '다크', zh: '深色', hi: 'डार्क', ar: 'داكن', th: 'มืด', vi: 'Tối', id: 'Gelap' },
    'theme.light': { ru: 'Светлая', en: 'Light', uk: 'Світла', tr: 'Aydınlık', de: 'Hell', fr: 'Clair', es: 'Claro', pt: 'Claro', it: 'Chiaro', pl: 'Jasny', cs: 'Světlý', ja: 'ライト', ko: '라이트', zh: '浅色', hi: 'लाइट', ar: 'فاتح', th: 'สว่าง', vi: 'Sáng', id: 'Terang' },
    'theme.auto': { ru: 'Авто', en: 'Auto', uk: 'Авто', tr: 'Otomatik', de: 'Auto', fr: 'Auto', es: 'Auto', pt: 'Auto', it: 'Auto', pl: 'Auto', cs: 'Auto', ja: '自動', ko: '자동', zh: '自动', hi: 'ऑटो', ar: 'تلقائي', th: 'อัตโนมัติ', vi: 'Tự động', id: 'Otomatis' },

    /* --- Language --- */
    'lang.title': { ru: 'Язык', en: 'Language', uk: 'Мова', tr: 'Dil', de: 'Sprache', fr: 'Langue', es: 'Idioma', pt: 'Idioma', it: 'Lingua', pl: 'Język', cs: 'Jazyk', ja: '言語', ko: '언어', zh: '语言', hi: 'भाषा', ar: 'اللغة', th: 'ภาษา', vi: 'Ngôn ngữ', id: 'Bahasa', kk: 'Тіл', uz: 'Til' },

    /* --- History --- */
    'history.title': { ru: 'История игр', en: 'Game History', uk: 'Історія ігор', tr: 'Oyun Geçmişi', de: 'Spielverlauf', fr: 'Historique', es: 'Historial', pt: 'Histórico', it: 'Cronologia', pl: 'Historia gier', cs: 'Historie her', ja: 'ゲーム履歴', ko: '게임 기록', zh: '游戏记录', hi: 'गेम इतिहास', ar: 'سجل الألعاب', th: 'ประวัติ', vi: 'Lịch sử', id: 'Riwayat', kk: 'Ойын тарихы', uz: "O'yin tarixi" },
    'history.empty': { ru: 'Пока пусто — запускайте игры!', en: 'Nothing yet — start playing!', uk: 'Поки порожньо — грайте!', tr: 'Henüz boş — oynamaya başla!', de: 'Noch leer — fang an zu spielen!', fr: 'Encore vide — jouez !', es: '¡Vacío — empieza a jugar!', pt: 'Vazio — comece a jogar!' },
    'history.today': { ru: 'Сегодня', en: 'Today', uk: 'Сьогодні', tr: 'Bugün', de: 'Heute', fr: "Aujourd'hui", es: 'Hoy', pt: 'Hoje' },
    'history.yesterday': { ru: 'Вчера', en: 'Yesterday', uk: 'Вчора', tr: 'Dün', de: 'Gestern', fr: 'Hier', es: 'Ayer', pt: 'Ontem' },

    /* --- Achievements --- */
    'achievements.title': { ru: 'Достижения', en: 'Achievements', uk: 'Досягнення', tr: 'Başarılar', de: 'Erfolge', fr: 'Succès', es: 'Logros', pt: 'Conquistas', it: 'Risultati', pl: 'Osiągnięcia', cs: 'Úspěchy', ja: '実績', ko: '업적', zh: '成就', hi: 'उपलब्धियाँ', ar: 'الإنجازات', th: 'ความสำเร็จ', vi: 'Thành tựu', id: 'Pencapaian', kk: 'Жетістіктер', uz: 'Yutuqlar' },

    /* --- Referral --- */
    'referral.title': { ru: 'Пригласить друга', en: 'Invite a friend', uk: 'Запросити друга', tr: 'Arkadaşını davet et', de: 'Freund einladen', fr: 'Inviter un ami', es: 'Invitar amigo', pt: 'Convidar amigo', it: 'Invita un amico', pl: 'Zaproś znajomego', cs: 'Pozvat přítele', ja: '友達を招待', ko: '친구 초대', zh: '邀请朋友', hi: 'दोस्त को आमंत्रित करें', ar: 'دعوة صديق', th: 'เชิญเพื่อน', vi: 'Mời bạn bè', id: 'Undang teman', kk: 'Досыңды шақыр', uz: "Do'stni taklif qilish" },
    'referral.desc': { ru: 'Поделитесь SlotX с друзьями', en: 'Share SlotX with friends', uk: 'Поділіться SlotX з друзями', tr: 'SlotX\'i arkadaşlarınla paylaş', de: 'Teile SlotX mit Freunden', fr: 'Partagez SlotX avec vos amis', es: 'Comparte SlotX con amigos', pt: 'Compartilhe SlotX com amigos' },
    'referral.share': { ru: 'Поделиться', en: 'Share', uk: 'Поділитися', tr: 'Paylaş', de: 'Teilen', fr: 'Partager', es: 'Compartir', pt: 'Compartilhar' },
    'referral.copy': { ru: 'Скопировать ссылку', en: 'Copy link', uk: 'Скопіювати посилання', tr: 'Bağlantıyı kopyala', de: 'Link kopieren', fr: 'Copier le lien', es: 'Copiar enlace', pt: 'Copiar link' },
    'xp.streak': { ru: 'Серия', en: 'Streak', uk: 'Серія', tr: 'Seri', de: 'Serie', fr: 'Série', es: 'Racha', pt: 'Sequência' },
    'xp.days': { ru: 'дн', en: 'days', uk: 'дн', tr: 'gün', de: 'Tage', fr: 'jours', es: 'días', pt: 'dias' },
    'xp.dailyBonus': { ru: 'за вход', en: 'daily bonus', uk: 'за вхід', tr: 'giriş bonusu', de: 'für Login', fr: 'bonus quotidien', es: 'bono diario', pt: 'bônus diário' },
    'xp.toNext': { ru: 'до', en: 'to', uk: 'до', tr: 'için', de: 'bis', fr: 'pour', es: 'para', pt: 'para' },
    'lb.title': { ru: 'Рейтинг XP', en: 'XP Ranking', uk: 'Рейтинг XP', tr: 'XP Sıralaması', de: 'XP Rangliste', fr: 'Classement XP', es: 'Ranking XP', pt: 'Ranking XP' },
    'lb.yourRank': { ru: 'Ваш рейтинг', en: 'Your rank', uk: 'Ваш рейтинг', tr: 'Sıralamanız', de: 'Ihr Rang', fr: 'Votre rang', es: 'Tu rango', pt: 'Sua posição' },
    'lb.refs': { ru: 'рефералов', en: 'referrals', uk: 'рефералів', tr: 'referans', de: 'Empfehlungen', fr: 'parrainages', es: 'referidos', pt: 'indicações' },
    'referral.friends': { ru: 'друзей', en: 'friends', uk: 'друзів', tr: 'arkadaş', de: 'Freunde', fr: 'amis', es: 'amigos', pt: 'amigos' },
    'referral.perFriend': { ru: 'за друга', en: 'per friend', uk: 'за друга', tr: 'arkadaş başı', de: 'pro Freund', fr: 'par ami', es: 'por amigo', pt: 'por amigo' },
    'referral.nextReward': { ru: 'до награды', en: 'to next reward', uk: 'до нагороди', tr: 'ödüle kadar', de: 'bis Belohnung', fr: 'pour récompense', es: 'para recompensa', pt: 'para recompensa' },
    'referral.copied': { ru: 'Ссылка скопирована!', en: 'Link copied!', uk: 'Посилання скопійовано!', tr: 'Bağlantı kopyalandı!', de: 'Link kopiert!', fr: 'Lien copié !', es: '¡Enlace copiado!', pt: 'Link copiado!' },
    'referral.yourLink': { ru: 'Ваша ссылка', en: 'Your link', uk: 'Ваше посилання', tr: 'Bağlantınız', de: 'Ihr Link', fr: 'Votre lien', es: 'Tu enlace', pt: 'Seu link' },
    'referral.welcomeBonus': { ru: 'Бонус +50 XP за приглашение!', en: 'Bonus +50 XP for joining!', uk: 'Бонус +50 XP за запрошення!', tr: 'Davet bonusu +50 XP!', de: 'Bonus +50 XP für Einladung!', fr: 'Bonus +50 XP !', es: '¡Bono +50 XP!', pt: 'Bônus +50 XP!' },
    'referral.youReferred': { ru: 'Вас пригласил пользователь', en: 'You were invited by user', uk: 'Вас запросив користувач', tr: 'Sizi davet eden kullanıcı', de: 'Sie wurden eingeladen von', fr: 'Vous avez été invité par', es: 'Fuiste invitado por', pt: 'Você foi convidado por' },
    'referral.welcomeGift': { ru: 'приветственный подарок', en: 'welcome gift', uk: 'вітальний подарунок', tr: 'hoş geldin hediyesi', de: 'Willkommensgeschenk', fr: 'cadeau de bienvenue', es: 'regalo de bienvenida', pt: 'presente de boas-vindas' },
    'referral.invitedList': { ru: 'Приглашённые', en: 'Invited', uk: 'Запрошені', tr: 'Davet edilenler', de: 'Eingeladene', fr: 'Invités', es: 'Invitados', pt: 'Convidados' },
    'referral.friend': { ru: 'Друг', en: 'Friend', uk: 'Друг', tr: 'Arkadaş', de: 'Freund', fr: 'Ami', es: 'Amigo', pt: 'Amigo' },
    'referral.newFriends': { ru: 'новых друзей', en: 'new friends', uk: 'нових друзів', tr: 'yeni arkadaş', de: 'neue Freunde', fr: 'nouveaux amis', es: 'nuevos amigos', pt: 'novos amigos' },
    'referral.howItWorks': { ru: 'Как это работает', en: 'How it works', uk: 'Як це працює', tr: 'Nasıl çalışır', de: 'So funktioniert es', fr: 'Comment ça marche', es: 'Cómo funciona', pt: 'Como funciona' },
    'referral.step1': { ru: 'Отправьте ссылку другу', en: 'Send the link to a friend', uk: 'Надішліть посилання другу', tr: 'Arkadaşınıza bağlantı gönderin', de: 'Senden Sie den Link', fr: 'Envoyez le lien', es: 'Envía el enlace', pt: 'Envie o link' },
    'referral.step2': { ru: 'Друг открывает SlotX по ссылке', en: 'Friend opens SlotX via link', uk: 'Друг відкриває SlotX за посиланням', tr: 'Arkadaşınız SlotX açar', de: 'Freund öffnet SlotX', fr: 'L\'ami ouvre SlotX', es: 'El amigo abre SlotX', pt: 'O amigo abre o SlotX' },
    'referral.step3': { ru: 'Вы получаете +200 XP, друг +50 XP', en: 'You get +200 XP, friend gets +50 XP', uk: 'Ви отримуєте +200 XP, друг +50 XP', tr: 'Siz +200 XP, arkadaş +50 XP', de: 'Sie +200 XP, Freund +50 XP', fr: 'Vous +200 XP, ami +50 XP', es: 'Tú +200 XP, amigo +50 XP', pt: 'Você +200 XP, amigo +50 XP' },
    'wins.empty': { ru: 'Запускайте игры — выигрыши появятся здесь!', en: 'Play games — wins will appear here!', uk: 'Запускайте ігри — виграші з\'являться тут!', tr: 'Oyun oynayın — kazançlar burada görünecek!' },
    'wins.best': { ru: 'Рекорд', en: 'Best', uk: 'Рекорд', tr: 'Rekor', de: 'Rekord', fr: 'Record', es: 'Récord', pt: 'Recorde' },
    'wins.total': { ru: 'Всего', en: 'Total', uk: 'Всього', tr: 'Toplam', de: 'Gesamt', fr: 'Total', es: 'Total', pt: 'Total' },
    'wins.sessions': { ru: 'Сессий', en: 'Sessions', uk: 'Сесій', tr: 'Oturum', de: 'Sitzungen', fr: 'Sessions', es: 'Sesiones', pt: 'Sessões' },
    'wins.title': { ru: 'Мои выигрыши', en: 'My Wins', uk: 'Мої виграші', tr: 'Kazançlarım', de: 'Meine Gewinne', fr: 'Mes gains', es: 'Mis ganancias', pt: 'Meus ganhos' },
    'referral.mystery': { ru: 'Пригласи друга — получите награду', en: 'Invite a friend — get a reward', uk: 'Запроси друга — отримайте нагороду', tr: 'Arkadaşını davet et — ödül kazan', de: 'Lade einen Freund ein — bekomme eine Belohnung', fr: 'Invite un ami — recevez une récompense', es: 'Invita a un amigo — recibe una recompensa', pt: 'Convide um amigo — ganhe uma recompensa' },
    'referral.mysteryDesc': { ru: 'Секретный бонус для тебя и для друга. Чем больше друзей, тем больше секретов откроется...', en: 'Secret bonus for you and your friend. The more friends, the more secrets will be revealed...', uk: 'Секретний бонус для тебе і друга. Більше друзів — більше секретів...', tr: 'Sana ve arkadaşına gizli bonus. Ne kadar çok arkadaş, o kadar çok sır...', de: 'Geheimbonus für dich und deinen Freund. Je mehr Freunde, desto mehr Geheimnisse...', fr: 'Bonus secret pour toi et ton ami. Plus d\'amis, plus de secrets...', es: 'Bono secreto para ti y tu amigo. Más amigos, más secretos...', pt: 'Bônus secreto para você e seu amigo. Mais amigos, mais segredos...' },
    'referral.secretReward': { ru: 'Секретная награда', en: 'Secret reward', uk: 'Секретна нагорода', tr: 'Gizli ödül' },
    'referral.unlockSecret': { ru: 'до секретной награды', en: 'to unlock secret reward', uk: 'до секретної нагороди', tr: 'gizli ödüle kadar' },
    'referral.giftActivated': { ru: 'Секретный подарок активирован!', en: 'Secret gift activated!', uk: 'Секретний подарунок активовано!', tr: 'Gizli hediye aktif!' },
    'referral.inviteFriend': { ru: 'Пригласить друга', en: 'Invite a friend', uk: 'Запросити друга', tr: 'Arkadaşını davet et', de: 'Freund einladen', fr: 'Inviter un ami', es: 'Invitar amigo', pt: 'Convidar amigo' },
    'referral.yourFriends': { ru: 'Твои друзья', en: 'Your friends', uk: 'Твої друзі', tr: 'Arkadaşların', de: 'Deine Freunde', fr: 'Tes amis', es: 'Tus amigos', pt: 'Seus amigos' },
    'referral.step4': { ru: 'Больше друзей = выше в рейтинге!', en: 'More friends = higher ranking!', uk: 'Більше друзів = вище в рейтингу!', tr: 'Daha çok arkadaş = daha yüksek sıralama!', de: 'Mehr Freunde = höherer Rang!', fr: 'Plus d\'amis = meilleur classement !', es: '¡Más amigos = más alto en el ranking!', pt: 'Mais amigos = maior ranking!' },

    /* --- Game view --- */
    'game.loading': { ru: 'Загрузка', en: 'Loading', uk: 'Завантаження', tr: 'Yükleniyor', de: 'Laden', fr: 'Chargement', es: 'Cargando', pt: 'Carregando' },
    'game.back': { ru: 'Назад', en: 'Back', uk: 'Назад', tr: 'Geri', de: 'Zurück', fr: 'Retour', es: 'Atrás', pt: 'Voltar' },
    'game.openBrowser': { ru: 'Открыть в браузере', en: 'Open in browser', uk: 'Відкрити в браузері', tr: 'Tarayıcıda aç', de: 'Im Browser öffnen', fr: 'Ouvrir dans le navigateur', es: 'Abrir en navegador', pt: 'Abrir no navegador' },
    'game.slow': { ru: 'Загрузка затянулась...', en: 'Taking too long...', uk: 'Довго завантажується...', tr: 'Yükleme uzadı...', de: 'Laden dauert lange...', fr: 'Le chargement est long...', es: 'Cargando lento...', pt: 'Demorando...' },

    /* --- Misc --- */
    'misc.allGames': { ru: 'Все', en: 'All', uk: 'Всі', tr: 'Tümü', de: 'Alle', fr: 'Tous', es: 'Todos', pt: 'Todos' },
    'misc.seeAll': { ru: 'Все →', en: 'All →', uk: 'Всі →', tr: 'Tümü →', de: 'Alle →', fr: 'Tous →', es: 'Todos →', pt: 'Todos →' },
    'misc.search': { ru: 'Найти слот...', en: 'Find a slot...', uk: 'Знайти слот...', tr: 'Slot bul...', de: 'Slot suchen...', fr: 'Chercher un slot...', es: 'Buscar slot...', pt: 'Buscar slot...' },
    'misc.addedFav': { ru: 'добавлено в избранное', en: 'added to favorites', uk: 'додано в обране', tr: 'favorilere eklendi', de: 'zu Favoriten hinzugefügt', fr: 'ajouté aux favoris', es: 'añadido a favoritos', pt: 'adicionado aos favoritos' },
    'misc.currencyChanged': { ru: 'Валюта изменена на', en: 'Currency changed to', uk: 'Валюту змінено на', tr: 'Para birimi değiştirildi:', de: 'Währung geändert auf', fr: 'Devise changée en', es: 'Moneda cambiada a', pt: 'Moeda alterada para' },
    'misc.selectCurrency': { ru: 'Выберите валюту', en: 'Select currency', uk: 'Оберіть валюту', tr: 'Para birimi seçin', de: 'Währung auswählen', fr: 'Choisir la devise', es: 'Seleccionar moneda', pt: 'Selecionar moeda' },
    'misc.searchCurrency': { ru: 'Поиск валюты...', en: 'Search currency...', uk: 'Пошук валюти...', tr: 'Para birimi ara...', de: 'Währung suchen...', fr: 'Rechercher devise...', es: 'Buscar moneda...', pt: 'Buscar moeda...' },
    'misc.readyReal': { ru: 'Готовы к реальным ставкам?', en: 'Ready for real bets?', uk: 'Готові до реальних ставок?', tr: 'Gerçek bahislere hazır mısın?', de: 'Bereit für echte Einsätze?', fr: 'Prêt pour de vrais paris ?', es: '¿Listo para apuestas reales?', pt: 'Pronto para apostas reais?' },
    'misc.getBonus': { ru: 'Получите приветственный бонус до 500%', en: 'Get a welcome bonus up to 500%', uk: 'Отримайте бонус до 500%', tr: '%500 hoş geldin bonusu al', de: 'Holen Sie sich den Willkommensbonus bis 500%', fr: 'Obtenez un bonus de bienvenue jusqu\'à 500%', es: 'Obtén un bono de bienvenida hasta 500%', pt: 'Ganhe um bônus de boas-vindas até 500%' },
    'misc.bonusWaiting': { ru: 'Бонус ждёт — Успей забрать!', en: 'Bonus waiting — Claim it!', uk: 'Бонус чекає — Встигни забрати!', tr: 'Bonus bekliyor — Hemen al!', de: 'Bonus wartet — Jetzt holen!', fr: 'Bonus en attente — Récupérez !', es: '¡Bono esperando — Reclámalo!', pt: 'Bônus esperando — Resgate!' },
    'misc.offerEnds': { ru: 'Акция заканчивается через:', en: 'Offer ends in:', uk: 'Акція закінчується через:', tr: 'Teklif bitiyor:', de: 'Angebot endet in:', fr: "L'offre se termine dans :", es: 'La oferta termina en:', pt: 'A oferta termina em:' },
    'misc.bestCasinos2026': { ru: 'Лучшие казино 2026', en: 'Best Casinos 2026', uk: 'Найкращі казино 2026', tr: 'En İyi Casinolar 2026', de: 'Beste Casinos 2026', fr: 'Meilleurs Casinos 2026', es: 'Mejores Casinos 2026', pt: 'Melhores Casinos 2026' },
    'misc.exclusiveBonuses': { ru: 'Эксклюзивные бонусы от проверенных партнёров', en: 'Exclusive bonuses from trusted partners', uk: 'Ексклюзивні бонуси від перевірених партнерів', tr: 'Güvenilir ortaklardan özel bonuslar', de: 'Exklusive Boni von vertrauenswürdigen Partnern', fr: 'Bonus exclusifs de partenaires de confiance', es: 'Bonos exclusivos de socios confiables', pt: 'Bônus exclusivos de parceiros confiáveis' },
    'misc.getBonus2': { ru: 'Получить бонус →', en: 'Get bonus →', uk: 'Отримати бонус →', tr: 'Bonus al →', de: 'Bonus holen →', fr: 'Obtenir le bonus →', es: 'Obtener bono →', pt: 'Pegar bônus →' },
    'misc.grab': { ru: 'Забрать', en: 'Claim', uk: 'Забрати', tr: 'Al', de: 'Holen', fr: 'Récupérer', es: 'Reclamar', pt: 'Resgatar' },
    'misc.get': { ru: 'Получить', en: 'Get', uk: 'Отримати', tr: 'Al', de: 'Holen', fr: 'Obtenir', es: 'Obtener', pt: 'Obter' },

    /* --- Levels --- */
    'level.newbie': { ru: 'Новичок', en: 'Newbie', uk: 'Новачок', tr: 'Çaylak', de: 'Neuling', fr: 'Débutant', es: 'Novato', pt: 'Novato' },
    'level.player': { ru: 'Игрок', en: 'Player', uk: 'Гравець', tr: 'Oyuncu', de: 'Spieler', fr: 'Joueur', es: 'Jugador', pt: 'Jogador' },
    'level.pro': { ru: 'Профи', en: 'Pro', uk: 'Профі', tr: 'Profesyonel', de: 'Profi', fr: 'Pro', es: 'Pro', pt: 'Pro' },
    'level.master': { ru: 'Мастер', en: 'Master', uk: 'Майстер', tr: 'Usta', de: 'Meister', fr: 'Maître', es: 'Maestro', pt: 'Mestre' },
    'level.legend': { ru: 'Легенда', en: 'Legend', uk: 'Легенда', tr: 'Efsane', de: 'Legende', fr: 'Légende', es: 'Leyenda', pt: 'Lenda' },

    /* --- Time --- */
    'time.m': { ru: 'м', en: 'm', uk: 'хв', tr: 'dk', de: 'Min', fr: 'min', es: 'min', pt: 'min' },
    'time.h': { ru: 'ч', en: 'h', uk: 'год', tr: 'sa', de: 'Std', fr: 'h', es: 'h', pt: 'h' },

    /* --- Leaderboard --- */
    'lb.today': { ru: 'Сегодня', en: 'Today', uk: 'Сьогодні', tr: 'Bugün', de: 'Heute', fr: "Aujourd'hui", es: 'Hoy', pt: 'Hoje' },
    'lb.week': { ru: 'Неделя', en: 'Week', uk: 'Тиждень', tr: 'Hafta', de: 'Woche', fr: 'Semaine', es: 'Semana', pt: 'Semana' },

    /* --- Filter chips --- */
    'chip.all': { ru: '🎰 Все', en: '🎰 All', uk: '🎰 Усі', tr: '🎰 Tümü', de: '🎰 Alle', fr: '🎰 Tous', es: '🎰 Todos', pt: '🎰 Todos' },
    'chip.popular': { ru: '🔥 Popular', en: '🔥 Popular', uk: '🔥 Popular', tr: '🔥 Popüler', de: '🔥 Beliebt', fr: '🔥 Populaire', es: '🔥 Popular', pt: '🔥 Popular' },
    'chip.top': { ru: '🏆 Top', en: '🏆 Top', uk: '🏆 Top', tr: '🏆 En İyi', de: '🏆 Top', fr: '🏆 Top', es: '🏆 Top', pt: '🏆 Top' },
    'chip.new': { ru: '✨ New', en: '✨ New', uk: '✨ New', tr: '✨ Yeni', de: '✨ Neu', fr: '✨ Nouveau', es: '✨ Nuevo', pt: '✨ Novo' },
    'chip.favorites': { ru: '❤️ Избранное', en: '❤️ Favorites', uk: '❤️ Обране', tr: '❤️ Favoriler', de: '❤️ Favoriten', fr: '❤️ Favoris', es: '❤️ Favoritos', pt: '❤️ Favoritos' }
  };

  /* ============================================
     DETECT LANGUAGE
     ============================================ */
  function detect() {
    /* 1. Check saved preference */
    try {
      var saved = localStorage.getItem('sh_lang');
      if (saved && isSupported(saved)) return saved;
    } catch(e) {}

    /* 2. Telegram user language */
    if (window.TG && TG.userLang) {
      var tgLang = TG.userLang.toLowerCase().split('-')[0];
      if (isSupported(tgLang)) return tgLang;
    }

    /* 3. Browser language */
    var navLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase().split('-')[0];
    if (isSupported(navLang)) return navLang;

    return 'en';
  }

  function isSupported(code) {
    for (var i = 0; i < LANGS.length; i++) {
      if (LANGS[i].code === code) return true;
    }
    return false;
  }

  /* ============================================
     TRANSLATE
     ============================================ */
  function t(key, fallback) {
    var entry = T[key];
    if (!entry) return fallback || key;
    return entry[currentLang] || entry['en'] || entry['ru'] || fallback || key;
  }

  /* ============================================
     SET LANGUAGE
     ============================================ */
  function setLang(code) {
    if (!isSupported(code)) code = 'en';
    currentLang = code;
    try { localStorage.setItem('sh_lang', code); } catch(e) {}
    applyTranslations();
  }

  /* ============================================
     APPLY — Update DOM elements with data-i18n
     ============================================ */
  function applyTranslations() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      var txt = t(key);
      if (els[i].tagName === 'INPUT' || els[i].tagName === 'TEXTAREA') {
        els[i].placeholder = txt;
      } else {
        els[i].textContent = txt;
      }
    }
    /* Update nav labels */
    var navLabels = {
      'home': t('nav.home'),
      'games': t('nav.games'),
      'casinos': t('nav.bonuses'),
      'profile': t('nav.more')
    };
    var navBtns = document.querySelectorAll('#bottom-nav .nav-btn');
    for (var n = 0; n < navBtns.length; n++) {
      var tab = navBtns[n].getAttribute('data-tab');
      var label = navBtns[n].querySelector('.nav-label');
      if (label && navLabels[tab]) label.textContent = navLabels[tab];
    }
  }

  /* ============================================
     INIT
     ============================================ */
  function init() {
    currentLang = detect();
    applyTranslations();
  }

  /* ============================================
     PUBLIC API
     ============================================ */
  return {
    init: init,
    t: t,
    setLang: setLang,
    getLang: function() { return currentLang; },
    getLangs: function() { return LANGS; },
    detect: detect,
    isSupported: isSupported,
    applyTranslations: applyTranslations
  };

})();
