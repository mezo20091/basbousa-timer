/* =========================================
   ROMANTIC MIDNIGHT COUNTDOWN LOGIC 💕
   Amr Diab - We Malo & 12:00 AM Reveal
========================================= */

// --- 1. Target Countdown Time (12:00 AM Midnight Egypt Time) ---
// Target: 2026-10-30 00:00:00 Egypt Time (UTC+3)
const targetTimestamp = new Date('2026-10-30T00:00:00+03:00').getTime();

const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const timerSection = document.getElementById('timerSection');
const revealSection = document.getElementById('revealSection');
const bgSong = document.getElementById('bgSong');
const audioBtn = document.getElementById('audioBtn');
let isSongPlaying = false;
let countdownInterval = null;
let isRevealed = false;

// Rotating waiting love messages
const waitingQuotes = [
  "كل ثانية بتعدي بتقربني ليكي أكتر.. خليكي جاهزة يا روحي 🌸",
  "في سر جميل مستنيكي هنا أول ما تدق الساعة 12 بالظبط ✨",
  "بتمنى كل لحظة في عمري الجاي تكوني معايا يا بسبوستي 💖",
  "أجمل مفاجأة لأجمل وأغلى إنسانة في الكون ده كله 💍",
  "دقات قلبي بتعد مع الثواني لحد ما اللحظة تيجي 🥺❤️"
];
let quoteIndex = 0;
const dynamicWaitText = document.getElementById('dynamicWaitText');

setInterval(() => {
  if (isRevealed || !dynamicWaitText) return;
  quoteIndex = (quoteIndex + 1) % waitingQuotes.length;
  dynamicWaitText.style.opacity = 0;
  setTimeout(() => {
    dynamicWaitText.textContent = `"${waitingQuotes[quoteIndex]}"`;
    dynamicWaitText.style.opacity = 1;
  }, 300);
}, 6000);

// Format with leading zero
function pad(num) {
  return num < 10 ? '0' + num : num;
}

function updateCountdown() {
  const now = new Date().getTime();
  const diff = targetTimestamp - now;

  if (diff <= 0) {
    // Time has arrived!
    clearInterval(countdownInterval);
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    
    if (!isRevealed) {
      triggerMidnightReveal();
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

// Start countdown clock
countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();


// --- 2. Secret Shortcut for Testing / Preview (Tap Moon 5 times) ---
let secretTaps = 0;
const secretTrigger = document.getElementById('secretTrigger');
if (secretTrigger) {
  secretTrigger.addEventListener('click', () => {
    secretTaps++;
    if (secretTaps >= 5) {
      triggerMidnightReveal();
    }
  });
}


// --- 3. The Midnight Surprise Reveal ---
function triggerMidnightReveal() {
  isRevealed = true;
  clearInterval(countdownInterval);

  // Transition from timer to surprise section
  timerSection.classList.remove('active-section');
  timerSection.classList.add('hidden-section');

  revealSection.classList.remove('hidden-section');
  revealSection.classList.add('active-section');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Grand Confetti Fireworks
  if (window.confetti) {
    const end = Date.now() + 4 * 1000;
    const colors = ['#ff3385', '#ec4899', '#f59e0b', '#ffffff', '#fda4af'];

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

  // Attempt auto-play (mobile browsers often require user touch, so button is also provided)
  playSong();
}

function openSurpriseNow() {
  playSong();
  const unlockBanner = document.getElementById('unlockBanner');
  if (unlockBanner) {
    unlockBanner.style.display = 'none';
  }
  
  if (window.confetti) {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff3385', '#ec4899', '#f59e0b']
    });
  }
}


// --- 4. Background Song Controls (Amr Diab - We Malo) ---
function playSong() {
  if (!bgSong) return;
  bgSong.volume = 0.9;
  const promise = bgSong.play();
  if (promise !== undefined) {
    promise.then(() => {
      isSongPlaying = true;
      audioBtn.classList.add('playing');
    }).catch(err => {
      console.log('Autoplay policy caught:', err);
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


// --- 5. Interactive Love Reaction Button ---
function sendLoveReaction(btn) {
  playSong();
  const successEl = document.getElementById('reactionSuccess');

  if (window.confetti) {
    confetti({
      particleCount: 90,
      spread: 85,
      origin: { y: 0.7 },
      colors: ['#ff3385', '#ec4899', '#f59e0b', '#ffffff']
    });
  }

  if (successEl) {
    successEl.style.display = 'block';
  }
  btn.style.transform = 'scale(1.06)';
  btn.style.boxShadow = '0 0 25px #ff3385';
}


// --- 6. Starry Night & Floating Hearts Canvas Animation ---
const canvas = document.getElementById('starsCanvas');
const ctx = canvas.getContext('2d');
let stars = [];
let floatingHearts = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Create twinkling background stars
for (let i = 0; i < 65; i++) {
  stars.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.8 + 0.2,
    alphaSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1)
  });
}

class NightHeart {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 20;
    this.size = Math.random() * 14 + 10;
    this.speedY = Math.random() * -1.2 - 0.5;
    this.speedX = Math.random() * 1 - 0.5;
    this.opacity = Math.random() * 0.6 + 0.25;
    this.decay = 0.002;
    this.rotation = Math.random() * Math.PI;
    this.rotSpeed = (Math.random() - 0.5) * 0.025;
    const colors = ['#ff3385', '#ec4899', '#fb7185', '#fda4af'];
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

function animateSky() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw and twinkle stars
  for (let s of stars) {
    s.alpha += s.alphaSpeed;
    if (s.alpha > 0.95 || s.alpha < 0.15) s.alphaSpeed = -s.alphaSpeed;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
    ctx.fill();
  }

  // Spawn gentle rising hearts
  if (floatingHearts.length < 25 && Math.random() < 0.18) {
    floatingHearts.push(new NightHeart());
  }

  for (let i = floatingHearts.length - 1; i >= 0; i--) {
    floatingHearts[i].update();
    floatingHearts[i].draw();
    if (floatingHearts[i].opacity <= 0 || floatingHearts[i].y < -30) {
      floatingHearts.splice(i, 1);
    }
  }

  requestAnimationFrame(animateSky);
}
animateSky();


// --- 7. Fullscreen Lightbox Modal ---
const lightbox = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxCaption.textContent = caption;
  lightbox.classList.add('active');
}

function closeLightbox(e) {
  if (e.target === lightbox || e.target.closest('.close-lightbox')) {
    lightbox.classList.remove('active');
  }
}

// Global functions for HTML onclick
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.openSurpriseNow = openSurpriseNow;
window.sendLoveReaction = sendLoveReaction;
