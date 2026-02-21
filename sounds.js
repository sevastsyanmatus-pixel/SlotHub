/* ============================================
   SOUND SYSTEM — Web Audio API
   Soft & pleasant casino sounds
   ============================================ */
var SoundFX = (function() {
  var ctx = null;
  var enabled = true;
  var _initialized = false;
  var masterVolume = 0.35; /* Global volume scale */

  function getCtx() {
    if (ctx) return ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { return null; }
    return ctx;
  }

  function ensureResumed() {
    var c = getCtx();
    if (c && c.state === 'suspended') {
      c.resume().catch(function() {});
    }
  }

  function init() {
    if (_initialized) return;
    _initialized = true;
    try {
      var saved = localStorage.getItem('sh_sound');
      if (saved === '0') enabled = false;
    } catch(e) {}

    var resumeHandler = function() {
      ensureResumed();
      document.removeEventListener('touchstart', resumeHandler);
      document.removeEventListener('click', resumeHandler);
    };
    document.addEventListener('touchstart', resumeHandler, { passive: true });
    document.addEventListener('click', resumeHandler, { passive: true });

    updateToggleUI();
  }

  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem('sh_sound', enabled ? '1' : '0'); } catch(e) {}
    updateToggleUI();
    if (enabled) play('click');
    return enabled;
  }

  function updateToggleUI() {
    var btn = document.getElementById('sound-toggle');
    if (!btn) return;
    var icon = btn.querySelector('i');
    if (enabled) {
      btn.classList.add('active');
      if (icon) icon.className = 'fa-solid fa-volume-high';
    } else {
      btn.classList.remove('active');
      if (icon) icon.className = 'fa-solid fa-volume-xmark';
    }
  }

  function isEnabled() { return enabled; }

  /* ---- Helpers ---- */
  function vol(v) { return v * masterVolume; }

  /* Soft low-pass filter for warmth */
  function warmFilter(c, freq) {
    var filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq || 2000;
    filter.Q.value = 0.7;
    return filter;
  }

  /* ---- Sound generators ---- */
  function play(type) {
    if (!enabled) return;
    var c = getCtx();
    if (!c) return;
    ensureResumed();

    try {
      switch(type) {
        case 'click': playClick(c); break;
        case 'tab': playTab(c); break;
        case 'favorite': playFavorite(c); break;
        case 'win': playWin(c); break;
        case 'notification': playNotification(c); break;
        case 'open-game': playOpenGame(c); break;
        case 'close-game': playCloseGame(c); break;
        case 'confetti': playConfetti(c); break;
        default: playClick(c);
      }
    } catch(e) {}
  }

  /* Click — gentle soft tap, like a bubble pop */
  function playClick(c) {
    var t = c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    var filter = warmFilter(c, 1800);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.07);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol(0.06), t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  /* Tab switch — soft warm chime, two gentle notes */
  function playTab(c) {
    var t = c.currentTime;
    var filter = warmFilter(c, 1600);

    var osc1 = c.createOscillator();
    var gain1 = c.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(392, t); /* G4 */
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(vol(0.05), t + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc1.connect(filter);
    filter.connect(gain1);
    gain1.connect(c.destination);
    osc1.start(t);
    osc1.stop(t + 0.13);

    var osc2 = c.createOscillator();
    var gain2 = c.createGain();
    var filter2 = warmFilter(c, 1600);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523, t + 0.06); /* C5 */
    gain2.gain.setValueAtTime(0, t + 0.06);
    gain2.gain.linearRampToValueAtTime(vol(0.04), t + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(c.destination);
    osc2.start(t + 0.06);
    osc2.stop(t + 0.22);
  }

  /* Favorite heart — gentle harp-like ascending arpeggio */
  function playFavorite(c) {
    var t = c.currentTime;
    var notes = [523, 659, 784]; /* C5 E5 G5 — major chord */

    for (var i = 0; i < notes.length; i++) {
      var osc = c.createOscillator();
      var gain = c.createGain();
      var filter = warmFilter(c, 2200);
      var start = t + i * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[i], start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol(0.055), start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.38);
    }
  }

  /* Win — warm music box melody */
  function playWin(c) {
    var t = c.currentTime;
    var notes = [523, 587, 659, 784, 1047]; /* C5 D5 E5 G5 C6 */
    var delays = [0, 0.09, 0.18, 0.27, 0.4];

    for (var i = 0; i < notes.length; i++) {
      var osc = c.createOscillator();
      var gain = c.createGain();
      var filter = warmFilter(c, 2000);
      var start = t + delays[i];
      var isLast = i === notes.length - 1;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[i], start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol(isLast ? 0.06 : 0.045), start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + (isLast ? 0.5 : 0.25));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      osc.start(start);
      osc.stop(start + (isLast ? 0.55 : 0.28));
    }
  }

  /* Notification — soft bell ding, warm and gentle */
  function playNotification(c) {
    var t = c.currentTime;

    /* Main bell tone */
    var osc = c.createOscillator();
    var gain = c.createGain();
    var filter = warmFilter(c, 2400);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(698, t); /* F5 */
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol(0.06), t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.55);

    /* Soft harmonic overtone */
    var osc2 = c.createOscillator();
    var gain2 = c.createGain();
    var filter2 = warmFilter(c, 1800);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1047, t); /* C6 — octave above */
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(vol(0.025), t + 0.008);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(c.destination);
    osc2.start(t);
    osc2.stop(t + 0.4);

    /* Second gentle note */
    var osc3 = c.createOscillator();
    var gain3 = c.createGain();
    var filter3 = warmFilter(c, 2200);
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(880, t + 0.15); /* A5 */
    gain3.gain.setValueAtTime(0, t + 0.15);
    gain3.gain.linearRampToValueAtTime(vol(0.04), t + 0.16);
    gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc3.connect(filter3);
    filter3.connect(gain3);
    gain3.connect(c.destination);
    osc3.start(t + 0.15);
    osc3.stop(t + 0.6);
  }

  /* Open game — gentle whoosh rising, like opening a magic box */
  function playOpenGame(c) {
    var t = c.currentTime;

    /* Soft noise swoosh via filtered oscillator */
    var osc = c.createOscillator();
    var gain = c.createGain();
    var filter = warmFilter(c, 1200);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.2);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol(0.04), t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.28);

    /* Gentle chime at the end */
    var osc2 = c.createOscillator();
    var gain2 = c.createGain();
    var filter2 = warmFilter(c, 2000);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659, t + 0.12); /* E5 */
    gain2.gain.setValueAtTime(0, t + 0.12);
    gain2.gain.linearRampToValueAtTime(vol(0.04), t + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(c.destination);
    osc2.start(t + 0.12);
    osc2.stop(t + 0.45);
  }

  /* Close game — gentle descending tone, soft landing */
  function playCloseGame(c) {
    var t = c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    var filter = warmFilter(c, 1400);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t); /* A4 */
    osc.frequency.exponentialRampToValueAtTime(262, t + 0.18); /* down to C4 */

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol(0.04), t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  /* Confetti — soft sparkle, like tiny wind chimes */
  function playConfetti(c) {
    var t = c.currentTime;
    var notes = [784, 988, 1175, 1319, 1568]; /* G5 B5 D6 E6 G6 — pentatonic */

    for (var i = 0; i < 5; i++) {
      var osc = c.createOscillator();
      var gain = c.createGain();
      var filter = warmFilter(c, 2500);
      var start = t + i * 0.06 + Math.random() * 0.02;
      var note = notes[Math.floor(Math.random() * notes.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol(0.03), start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.35);
    }
  }

  return {
    init: init,
    play: play,
    toggle: toggle,
    isEnabled: isEnabled
  };
})();
