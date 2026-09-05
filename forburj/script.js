(() => {
  'use strict';

  const PASSWORD = '19082025';

  /* ============================================
     Floating hearts & sparkles background
     ============================================ */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, particles;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    const isHeart = Math.random() < 0.6;
    return {
      x: Math.random() * width,
      y: height + Math.random() * height * 0.5,
      size: isHeart ? 10 + Math.random() * 14 : 2 + Math.random() * 3,
      speed: 0.25 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.5,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.015,
      opacity: 0.15 + Math.random() * 0.35,
      isHeart,
      hue: isHeart ? '#c6465d' : '#e2c98a'
    };
  }

  function initParticles() {
    const count = window.innerWidth < 600 ? 18 : 32;
    particles = Array.from({ length: count }, makeParticle);
  }

  function drawHeart(x, y, size, opacity, color) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.scale(size / 20, size / 20);
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(-10, -6, -20, 2, 0, 16);
    ctx.bezierCurveTo(20, 2, 10, -6, 0, 5);
    ctx.fill();
    ctx.restore();
  }

  function drawSparkle(x, y, size, opacity, color) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.y -= p.speed;
      p.sway += p.swaySpeed;
      p.x += Math.sin(p.sway) * 0.3 + p.drift * 0.05;

      if (p.y < -30) {
        Object.assign(p, makeParticle(), { y: height + 20 });
      }

      if (p.isHeart) {
        drawHeart(p.x, p.y, p.size, p.opacity, p.hue);
      } else {
        drawSparkle(p.x, p.y, p.size, p.opacity, p.hue);
      }
    }
    requestAnimationFrame(tick);
  }

  resize();
  initParticles();
  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  if (!reduceMotion) {
    requestAnimationFrame(tick);
  } else {
    // draw a single static frame so the background isn't blank
    tick_once();
  }

  function tick_once() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      if (p.isHeart) drawHeart(p.x, p.y, p.size, p.opacity, p.hue);
      else drawSparkle(p.x, p.y, p.size, p.opacity, p.hue);
    }
  }

  /* ============================================
     Password unlock
     ============================================ */
  const lockScreen = document.getElementById('lock-screen');
  const letterScreen = document.getElementById('letter-screen');
  const form = document.getElementById('unlock-form');
  const input = document.getElementById('password-input');
  const errorMsg = document.getElementById('error-msg');
  const envelope = document.getElementById('envelope');

  let unlocking = false;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (unlocking) return;

    const value = input.value.trim();

    if (value === PASSWORD) {
      unlock();
    } else {
      showError();
    }
  });

  function showError() {
    errorMsg.classList.remove('show');
    // force reflow so the shake animation can replay
    void errorMsg.offsetWidth;
    errorMsg.classList.add('show');
    input.focus();
    input.select();
  }

  function unlock() {
    unlocking = true;
    envelope.classList.add('opening');
    lockScreen.classList.add('fading-out');

    setTimeout(() => {
      lockScreen.hidden = true;
      letterScreen.hidden = false;
      startTypewriter();
    }, 750);
  }

  /* ============================================
     Typewriter letter reveal
     ============================================ */
  const LETTER_TEXT = `Congratulations to you, my Burj! ❤

You've made it through another school year! I've seen your dedication and pure passion for your course. I've seen your struggles, as well as the hours and even days you've spent working on your projects.

I'm always happy to help you with your projects, and I'll always do my best to support you whenever you need me. I'm so proud of how hard you work and how much effort you put into everything you do.

May this upcoming school year bring you peace, happiness, and less stress. I pray that no one and nothing will put too much pressure on you or make you feel overwhelmed with your projects.

Keep doing your best, my Burj. I'll always be here to support you. ❤`;

  const letterBody = document.getElementById('letter-body');
  let typewriterStarted = false;

  function startTypewriter() {
    if (typewriterStarted) return;
    typewriterStarted = true;

    if (reduceMotion) {
      letterBody.textContent = LETTER_TEXT;
      return;
    }

    letterBody.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    letterBody.appendChild(cursor);

    let i = 0;
    const speed = 22; // ms per character

    function typeNext() {
      if (i < LETTER_TEXT.length) {
        cursor.insertAdjacentText('beforebegin', LETTER_TEXT[i]);
        i++;
        const char = LETTER_TEXT[i - 1];
        const delay = char === '\n' ? speed * 6 : speed;
        setTimeout(typeNext, delay);
      } else {
        setTimeout(() => cursor.remove(), 900);
      }
    }

    typeNext();
  }

  /* ============================================
     Enter key already triggers submit via <form>,
     but ensure focus lands on the input for convenience.
     ============================================ */
  window.addEventListener('load', () => {
    input.focus();
  });
})();