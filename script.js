/* =========================================
   ROMANTIC COUNTDOWN & HOLD-BAR LOGIC
   Amr Diab - Bayen Habeit
========================================= */

// --- 1. Target Countdown Time (12:00 AM Midnight Egypt Time / End of DST) ---
// Exact timestamp of Midnight Egypt Summer Time: 2026-10-29T21:00:00.000Z (1793307600000)
// At this exact moment, Egypt switches to winter time and the clock turns back to 11:00 PM.
const targetTimestamp = 1793307600000;

const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const timerSection = document.getElementById('timerSection');
const barSection = document.getElementById('barSection');
const revealSection = document.getElementById('revealSection');
const bgSong = document.getElementById('bgSong');
const audioBtn = document.getElementById('audioBtn');
const testToggleBtn = document.getElementById('testToggleBtn');

let isSongPlaying = false;
let countdownInterval = null;
let currentStage = 1; // 1: Timer, 2: Bar, 3: Reveal

// High-precision Monotonic tracking to prevent any OS clock rollback from delaying the unlock
const pageLoadPerf = performance.now();
let timeOffset = 0; // Network server time difference
let initialDiff = Math.max(0, targetTimestamp - Date.now());

// Background network sync to eliminate device clock desync / manual timezone error
fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
  .then(res => {
    const serverDateHeader = res.headers.get('date');
    if (serverDateHeader) {
      const serverTime = new Date(serverDateHeader).getTime();
      timeOffset = serverTime - Date.now();
      initialDiff = Math.max(0, targetTimestamp - (Date.now() + timeOffset));
      updateCountdown();
    }
  })
  .catch(() => {});

// Rotating waiting messages (without emojis)
const waitingQuotes = [
  "كل ثانية بتعدي بتقربني ليكي أكتر.. خليكي جاهزة يا روحي",
  "في سر مستنيكي هنا أول ما تدق الساعة 12 بالظبط",
  "بتمنى كل لحظة في عمري الجاي تكوني معايا يا بسبوستي",
  "أجمل مفاجأة لأجمل وأغلى إنسانة في الكون ده كله",
  "دقات قلبي بتعد مع الثواني لحد ما اللحظة تيجي"
];
let quoteIndex = 0;
const dynamicWaitText = document.getElementById('dynamicWaitText');

setInterval(() => {
  if (currentStage !== 1 || !dynamicWaitText) return;
  quoteIndex = (quoteIndex + 1) % waitingQuotes.length;
  dynamicWaitText.style.opacity = 0;
  setTimeout(() => {
    dynamicWaitText.textContent = waitingQuotes[quoteIndex];
    dynamicWaitText.style.opacity = 1;
  }, 300);
}, 5000);

function pad(num) {
  return num < 10 ? '0' + num : num;
}

function updateCountdown() {
  const perfElapsed = performance.now() - pageLoadPerf;
  const monotonicRemaining = Math.max(0, initialDiff - perfElapsed);
  const now = Date.now() + timeOffset;
  const clockRemaining = targetTimestamp - now;

  // Use Math.min so if either monotonic time runs out OR clock reaches target, it triggers immediately
  const diff = Math.min(monotonicRemaining, clockRemaining);

  if (diff <= 0) {
    if (countdownInterval) clearInterval(countdownInterval);
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    
    try { localStorage.setItem('basbousa_unlocked', '1'); } catch(e) {}

    if (currentStage === 1) {
      goToStage(2);
    }
    return;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  hoursEl.textContent = pad(hours);
  minutesEl.textContent = pad(minutes);
  secondsEl.textContent = pad(seconds);
}

countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();


// --- 2. Stage Transitions ---
function goToStage(stageNum) {
  currentStage = stageNum;
  
  timerSection.classList.remove('active');
  barSection.classList.remove('active');
  revealSection.classList.remove('active');

  if (stageNum === 1) {
    timerSection.classList.add('active');
    if (testToggleBtn) testToggleBtn.textContent = 'معاينة صفحة المفاجأة';
    pauseSong();
  } else if (stageNum === 2) {
    barSection.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.confetti) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  } else if (stageNum === 3) {
    revealSection.classList.add('active');
    if (testToggleBtn) testToggleBtn.textContent = 'الرجوع للمؤقت';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playSong();
    triggerCelebration();
  }
}

// Test View Switcher
function toggleTestView() {
  if (currentStage === 3) {
    goToStage(1);
  } else {
    goToStage(3);
  }
}

// Check URL param ?view=reveal or ?test=1 or unlocked storage
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('view') === 'reveal' || urlParams.get('test') === '1') {
  goToStage(3);
} else {
  try {
    const isUnlocked = localStorage.getItem('basbousa_unlocked') === '1';
    const isPastTarget = (Date.now() + timeOffset) >= targetTimestamp;
    if ((isUnlocked || isPastTarget) && !urlParams.get('test_timer')) {
      goToStage(2);
    }
  } catch(e) {}
}


// --- 3. Secret Heart Shortcut ---
let secretTaps = 0;
const secretTrigger = document.getElementById('secretTrigger');
if (secretTrigger) {
  secretTrigger.addEventListener('click', () => {
    secretTaps++;
    if (secretTaps >= 5) {
      goToStage(2);
    }
  });
}


// --- 4. Stage 2: Pink Love Bar Logic (Press and Hold / Tap) ---
const loveBarContainer = document.getElementById('loveBarContainer');
const loveBarFill = document.getElementById('loveBarFill');
const barText = document.getElementById('barText');
const barStatusMessage = document.getElementById('barStatusMessage');

let fillProgress = 0;
let isHolding = false;
let holdTimer = null;
let lastInteractionPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

const barMilestones = [
  { at: 0, text: "الحب يبدأ بلمسة منكِ" },
  { at: 20, text: "كملي.. في كلام من القلب مستنيكي" },
  { at: 50, text: "نص الطريق لقلبي عدا.. استمري يا بسبوستي" },
  { at: 75, text: "دقات قلبي بتزيد.. قربتي جداً" },
  { at: 92, text: "ثواني والأغنية والسر ينكشفوا" },
  { at: 100, text: "اكتمل حبكِ في قلبي للأبد" }
];

function updateBarStatus(progress) {
  for (let i = barMilestones.length - 1; i >= 0; i--) {
    if (progress >= barMilestones[i].at) {
      barStatusMessage.textContent = barMilestones[i].text;
      break;
    }
  }
}

function renderProgress(value) {
  fillProgress = Math.min(100, Math.max(0, value));
  loveBarFill.style.width = fillProgress + '%';
  barText.textContent = Math.floor(fillProgress) + '%';
  updateBarStatus(fillProgress);

  if (fillProgress >= 100) {
    onBarCompleted();
  }
}

function startHolding(e) {
  e.preventDefault();
  isHolding = true;
  loveBarContainer.classList.add('pressing');

  if (e.touches && e.touches[0]) {
    lastInteractionPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.clientX) {
    lastInteractionPos = { x: e.clientX, y: e.clientY };
  }

  if (holdTimer) clearInterval(holdTimer);
  holdTimer = setInterval(() => {
    if (!isHolding || fillProgress >= 100) return;
    
    renderProgress(fillProgress + 2);
    
    if (Math.random() < 0.6) {
      burstHeartsAt(lastInteractionPos.x, lastInteractionPos.y, 2);
    }
  }, 40);
}

function stopHolding() {
  if (!isHolding) return;
  isHolding = false;
  loveBarContainer.classList.remove('pressing');
  clearInterval(holdTimer);

  if (fillProgress < 100) {
    const drainTimer = setInterval(() => {
      if (isHolding || fillProgress <= 0 || fillProgress >= 100) {
        clearInterval(drainTimer);
        return;
      }
      renderProgress(fillProgress - 0.8);
    }, 50);
  }
}

loveBarContainer.addEventListener('click', (e) => {
  if (fillProgress >= 100) return;
  const x = e.clientX || lastInteractionPos.x;
  const y = e.clientY || lastInteractionPos.y;
  burstHeartsAt(x, y, 6);
  renderProgress(fillProgress + 10);
});

loveBarContainer.addEventListener('mousedown', startHolding);
window.addEventListener('mouseup', stopHolding);

loveBarContainer.addEventListener('touchstart', startHolding, { passive: false });
window.addEventListener('touchend', stopHolding);
window.addEventListener('touchcancel', stopHolding);

function onBarCompleted() {
  clearInterval(holdTimer);
  isHolding = false;
  loveBarContainer.classList.remove('pressing');
  
  if (window.confetti) {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6584', '#ec4899', '#db2777', '#f43f5e']
    });
  }

  setTimeout(() => {
    goToStage(3);
  }, 600);
}


// --- 5. Stage 3 Reveal & Celebration ---
function triggerCelebration() {
  if (window.confetti) {
    const end = Date.now() + 4 * 1000;
    const colors = ['#ff6584', '#ec4899', '#db2777', '#f59e0b', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }
}


// --- 6. Background Song Controls (Amr Diab - Bayen Habeit) ---
let audioUnlockHandlerAttached = false;

function setupAudioUnlockListener() {
  if (audioUnlockHandlerAttached) return;
  audioUnlockHandlerAttached = true;
  
  const unlockAudio = () => {
    if (currentStage === 3 && !isSongPlaying) {
      playSong();
    }
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
    audioUnlockHandlerAttached = false;
  };
  
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });
}

function playSong() {
  if (!bgSong) return;
  bgSong.volume = 0.9;
  const promise = bgSong.play();
  if (promise !== undefined) {
    promise.then(() => {
      isSongPlaying = true;
      audioBtn.classList.add('playing');
    }).catch(err => {
      console.log('Autoplay caught by browser policy, listening for first touch:', err);
      setupAudioUnlockListener();
    });
  }
}

function pauseSong() {
  if (!bgSong) return;
  bgSong.pause();
  isSongPlaying = false;
  audioBtn.classList.remove('playing');
}

function toggleSong() {
  if (isSongPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

audioBtn.addEventListener('click', toggleSong);


// --- 7. Ambient Floating Hearts Canvas Animation ---
const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
let hearts = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class FloatingHeart {
  constructor(x, y, isBurst = false) {
    this.x = x || Math.random() * canvas.width;
    this.y = y || canvas.height + 20;
    this.size = Math.random() * (isBurst ? 22 : 16) + (isBurst ? 12 : 8);
    this.speedY = isBurst ? (Math.random() * -6 - 2) : (Math.random() * -1.5 - 0.6);
    this.speedX = isBurst ? (Math.random() * 6 - 3) : (Math.random() * 1 - 0.5);
    this.opacity = isBurst ? 1 : Math.random() * 0.6 + 0.3;
    this.decay = isBurst ? Math.random() * 0.02 + 0.015 : 0.002;
    this.rotation = Math.random() * Math.PI;
    this.rotSpeed = (Math.random() - 0.5) * 0.03;
    const colors = ['#f472b6', '#ec4899', '#fb7185', '#fda4af', '#f43f5e'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.fillStyle = this.color;
    
    ctx.beginPath();
    const s = this.size;
    ctx.moveTo(0, -s / 2);
    ctx.bezierCurveTo(s / 2, -s, s, -s / 3, 0, s);
    ctx.bezierCurveTo(-s, -s / 3, -s / 2, -s, 0, -s / 2);
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotSpeed;
    this.opacity -= this.decay;
  }
}

function spawnAmbientHearts() {
  if (hearts.length < 35 && Math.random() < 0.25) {
    hearts.push(new FloatingHeart());
  }
}

function animateHearts() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  spawnAmbientHearts();

  for (let i = hearts.length - 1; i >= 0; i--) {
    hearts[i].update();
    hearts[i].draw();
    if (hearts[i].opacity <= 0 || hearts[i].y < -40) {
      hearts.splice(i, 1);
    }
  }
  requestAnimationFrame(animateHearts);
}
animateHearts();

function burstHeartsAt(x, y, count = 15) {
  for (let i = 0; i < count; i++) {
    hearts.push(new FloatingHeart(x, y, true));
  }
}


// --- 8. Fullscreen Lightbox Modal ---
const lightbox = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxCaption.textContent = caption;
  lightbox.classList.add('active');
  burstHeartsAt(window.innerWidth / 2, window.innerHeight / 2, 10);
}

function closeLightbox(e) {
  if (e.target === lightbox || e.target.closest('.close-lightbox')) {
    lightbox.classList.remove('active');
  }
}

window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.toggleTestView = toggleTestView;
