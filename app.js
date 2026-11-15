(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EVENT_ISO = '2026-12-31T12:00:00+05:30';
  const WISHES_STORAGE_KEY = 'farhan_arshitha_nikkah_wishes_v1';

  /* ===========================
     1. COVER GATE & MUSIC
     =========================== */
  const coverGate = document.getElementById('cover-gate');
  const openBtn = document.getElementById('open-invitation-btn');
  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  const heroVideo = document.getElementById('hero-video');
  let isMusicPlaying = false;

  function revealHeroNames() {
    document.body.classList.add('is-hero-settled');
  }

  function startHeroVideo() {
    if (!heroVideo || prefersReducedMotion) {
      revealHeroNames();
      return;
    }

    heroVideo.currentTime = 0;
    const onTimeUpdate = () => {
      if (heroVideo.currentTime >= 11.4) {
        revealHeroNames();
        heroVideo.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
    heroVideo.addEventListener('timeupdate', onTimeUpdate);
    heroVideo.addEventListener('ended', revealHeroNames, { once: true });

    heroVideo.play().catch(() => {
      revealHeroNames();
    });

    // Safety fallback in case video playback is throttled
    window.setTimeout(revealHeroNames, 12800);
  }

  function syncMusicUI() {
    musicToggle.classList.toggle('is-playing', isMusicPlaying);
    musicToggle.classList.toggle('is-muted', !isMusicPlaying);
    musicToggle.setAttribute(
      'aria-label',
      isMusicPlaying ? 'Mute background music' : 'Play background music'
    );
  }

  async function startMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.45;
    try {
      await bgMusic.play();
      isMusicPlaying = true;
    } catch {
      isMusicPlaying = false;
    }
    syncMusicUI();
  }

  function toggleMusic() {
    if (!bgMusic) return;
    if (isMusicPlaying) {
      bgMusic.pause();
      isMusicPlaying = false;
      syncMusicUI();
    } else {
      startMusic();
    }
  }

  function openInvitation() {
    document.body.classList.remove('is-locked');
    document.body.classList.add('is-opened');
    coverGate.classList.add('is-closing');
    coverGate.setAttribute('aria-hidden', 'true');
    musicToggle.hidden = false;
    startMusic();
    startHeroVideo();
    window.setTimeout(() => {
      coverGate.style.display = 'none';
    }, 950);
  }

  if (openBtn) {
    openBtn.addEventListener('click', openInvitation);
  }
  if (musicToggle) {
    musicToggle.addEventListener('click', toggleMusic);
  }

  /* ===========================
     2. STICKY NAVBAR
     =========================== */
  const navbar = document.getElementById('navbar');
  const heroSection = document.getElementById('hero');

  function updateNavbar() {
    if (!navbar || !heroSection) return;
    const threshold = heroSection.offsetHeight * 0.65;
    navbar.classList.toggle('is-visible', window.scrollY > threshold);
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* ===========================
     3. FALLING ROSE PETALS (3D VELVET)
     =========================== */
  const petalsCanvas = document.getElementById('petals-canvas');
  if (petalsCanvas && !prefersReducedMotion) {
    const ctx = petalsCanvas.getContext('2d');
    const PETAL_COUNT = 26;
    const petals = [];
    let width = 0;
    let height = 0;

    const PALETTES = [
      { light: '#ea5f78', mid: '#c42444', dark: '#781026' },
      { light: '#df4c68', mid: '#b51d3b', dark: '#6b0d21' },
      { light: '#f07188', mid: '#cf2f4f', dark: '#88152e' },
      { light: '#d63e5a', mid: '#a31733', dark: '#5f0b1c' },
    ];

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      petalsCanvas.width = Math.floor(width * dpr);
      petalsCanvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createPetal(initialSpread) {
      const depth = 0.6 + Math.random() * 0.6; // 0.6 .. 1.2
      const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      return {
        x: Math.random() * width,
        y: initialSpread ? Math.random() * height : -28 - Math.random() * 70,
        size: (8.5 + Math.random() * 6.5) * depth,
        depth,
        speedY: (0.7 + Math.random() * 0.75) * (0.75 + depth * 0.35),
        speedX: (-0.28 + Math.random() * 0.56) * depth,
        swayAmp: (0.35 + Math.random() * 0.65) * depth,
        swayFreq: 0.011 + Math.random() * 0.014,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.028,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.018 + Math.random() * 0.022,
        tiltPhase: Math.random() * Math.PI * 2,
        tiltSpeed: 0.012 + Math.random() * 0.016,
        alpha: 0.76 + depth * 0.18,
        palette,
      };
    }

    function drawRosePetal(p) {
      const s = p.size;
      const scaleY = 0.22 + 0.78 * Math.abs(Math.cos(p.flip));
      const scaleX = 0.7 + 0.3 * Math.abs(Math.sin(p.tiltPhase));

      ctx.save();
      ctx.globalAlpha = Math.min(0.96, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(scaleX, scaleY);

      ctx.shadowColor = 'rgba(65, 10, 24, 0.22)';
      ctx.shadowBlur = 5 * p.depth;
      ctx.shadowOffsetX = 1.5;
      ctx.shadowOffsetY = 3;

      const grad = ctx.createRadialGradient(-s * 0.22, -s * 0.25, s * 0.1, 0, s * 0.15, s * 1.15);
      grad.addColorStop(0, p.palette.light);
      grad.addColorStop(0.55, p.palette.mid);
      grad.addColorStop(1, p.palette.dark);
      ctx.fillStyle = grad;

      // Organic cupped rose petal silhouette
      ctx.beginPath();
      ctx.moveTo(0, s * 0.92);
      ctx.bezierCurveTo(s * 0.78, s * 0.58, s * 1.05, -s * 0.25, s * 0.52, -s * 0.82);
      ctx.bezierCurveTo(s * 0.22, -s * 1.06, -s * 0.05, -s * 0.88, -s * 0.08, -s * 0.82);
      ctx.bezierCurveTo(-s * 0.42, -s * 1.02, -s * 0.98, -s * 0.48, -s * 0.82, s * 0.22);
      ctx.bezierCurveTo(-s * 0.68, s * 0.66, -s * 0.25, s * 0.82, 0, s * 0.92);
      ctx.closePath();
      ctx.fill();

      // Subtle curled rim highlight matching velvet light catch
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(255, 195, 206, 0.28)';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(s * 0.45, -s * 0.76);
      ctx.bezierCurveTo(s * 0.86, -s * 0.35, s * 0.82, s * 0.28, s * 0.22, s * 0.72);
      ctx.stroke();

      ctx.restore();
    }

    resizeCanvas();
    for (let i = 0; i < PETAL_COUNT; i += 1) {
      petals.push(createPetal(true));
    }
    window.addEventListener('resize', resizeCanvas);

    let frameTick = 0;
    function renderPetals() {
      frameTick += 1;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < petals.length; i += 1) {
        const p = petals[i];
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(frameTick * p.swayFreq + p.phase) * p.swayAmp;
        p.rot += p.rotSpeed;
        p.flip += p.flipSpeed;
        p.tiltPhase += p.tiltSpeed;

        if (p.y > height + 36 || p.x < -45 || p.x > width + 45) {
          petals[i] = createPetal(false);
          continue;
        }

        drawRosePetal(p);
      }
      window.requestAnimationFrame(renderPetals);
    }

    window.requestAnimationFrame(renderPetals);
  }

  /* ===========================
     4. LIVE COUNTDOWN
     =========================== */
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');
  const targetTimestamp = new Date(EVENT_ISO).getTime();

  function pad2(num) {
    return String(Math.max(0, num)).padStart(2, '0');
  }

  function updateCountdown() {
    const diff = Math.max(0, targetTimestamp - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    if (cdDays) cdDays.textContent = pad2(days);
    if (cdHours) cdHours.textContent = pad2(hours);
    if (cdMins) cdMins.textContent = pad2(mins);
    if (cdSecs) cdSecs.textContent = pad2(secs);
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  /* ===========================
     5. ADD TO CALENDAR (.ICS)
     =========================== */
  const calendarBtn = document.getElementById('add-to-calendar-btn');
  if (calendarBtn) {
    calendarBtn.addEventListener('click', () => {
      const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Farhan and Arshitha Nikkah//EN',
        'BEGIN:VEVENT',
        'UID:farhan-arshitha-nikkah-20261231@nikkah',
        'DTSTAMP:20261110T120000Z',
        'DTSTART;TZID=Asia/Kolkata:20261231T120000',
        'DTEND;TZID=Asia/Kolkata:20261231T150000',
        'SUMMARY:Nikkah of H. Farhan Ahamed & A. Arshitha',
        'LOCATION:Light House Auditorium, Azhagiyamandapam',
        'DESCRIPTION:With the blessings of Allah, Mr. Hameed & Mrs. Latheefa Beevi cordially invite you to the Nikkah of H. Farhan Ahamed & A. Arshitha (Rajab 22, Hijiri 1448). Bridegroom Party starts from Masha Mahal, Thiruvithancode. Contact: 8825675702.',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'farhan-arshitha-nikkah.ics';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  }

  /* ===========================
     6. POLAROID STORY DECK
     =========================== */
  const deck = document.getElementById('polaroid-deck');
  const cards = Array.from(document.querySelectorAll('.polaroid-card'));
  const dots = Array.from(document.querySelectorAll('.polaroid-dot'));
  let activeCardIndex = 0;

  function setActiveCard(nextIndex) {
    if (!cards.length) return;
    activeCardIndex = (nextIndex + cards.length) % cards.length;
    cards.forEach((card, idx) => {
      card.classList.toggle('is-active', idx === activeCardIndex);
    });
    dots.forEach((dot, idx) => {
      const active = idx === activeCardIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });
  }

  if (deck && cards.length > 1) {
    let pointerStartX = null;
    let dragged = false;

    deck.addEventListener('pointerdown', (e) => {
      pointerStartX = e.clientX;
      dragged = false;
    });

    deck.addEventListener('pointermove', (e) => {
      if (pointerStartX === null) return;
      if (Math.abs(e.clientX - pointerStartX) > 20) {
        dragged = true;
      }
    });

    deck.addEventListener('pointerup', (e) => {
      if (pointerStartX === null) return;
      const delta = e.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(delta) > 35) {
        setActiveCard(activeCardIndex + (delta < 0 ? 1 : -1));
      } else if (!dragged) {
        setActiveCard(activeCardIndex + 1);
      }
    });

    deck.addEventListener('pointercancel', () => {
      pointerStartX = null;
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number(dot.dataset.goto || 0);
      setActiveCard(target);
    });
  });

  /* ===========================
     7. HEARTFELT WISHES
     =========================== */
  const SEED_WISHES = [
    {
      id: 'seed-1',
      name: 'Faizal',
      time: 'WARM REGARDS',
      message: 'Barakallahu lakuma wa baraka alaikuma. Wishing Farhan & Arshitha a lifetime filled with love, barakah, and endless joy.',
      likes: 4,
      liked: false,
    },
    {
      id: 'seed-2',
      name: 'Fayas',
      time: 'WARM REGARDS',
      message: 'Heartiest congratulations to both families! May Allah bless this sacred union with peace and mercy.',
      likes: 3,
      liked: false,
    },
    {
      id: 'seed-3',
      name: 'Mehfin',
      time: 'WARM REGARDS',
      message: 'Counting down the days to celebrate with you in Azhagiyamandapam. Advance Nikkah Mubarak!',
      likes: 5,
      liked: false,
    },
  ];

  const wishForm = document.getElementById('wish-form');
  const wishNameInput = document.getElementById('wish-name');
  const wishMsgInput = document.getElementById('wish-message');
  const wishFeedback = document.getElementById('wish-feedback');
  const wishesCountEl = document.getElementById('wishes-count');
  const wishesListEl = document.getElementById('wishes-list');

  function loadWishes() {
    try {
      const raw = localStorage.getItem(WISHES_STORAGE_KEY);
      if (!raw) return [...SEED_WISHES];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : [...SEED_WISHES];
    } catch {
      return [...SEED_WISHES];
    }
  }

  function saveWishes(items) {
    try {
      localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (private mode); keep in-memory state.
    }
  }

  let wishes = loadWishes();

  function getInitials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'F';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function renderWishes() {
    if (!wishesListEl || !wishesCountEl) return;
    wishesCountEl.textContent = `\u2726 ${wishes.length} BLESSING${wishes.length === 1 ? '' : 'S'} RECEIVED`;
    wishesListEl.textContent = '';

    wishes.forEach((wish) => {
      const card = document.createElement('article');
      card.className = 'wish-item';

      const head = document.createElement('div');
      head.className = 'wish-item__head';

      const avatar = document.createElement('span');
      avatar.className = 'wish-item__avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = getInitials(wish.name);

      const meta = document.createElement('div');
      meta.className = 'wish-item__meta';

      const author = document.createElement('span');
      author.className = 'wish-item__author';
      author.textContent = wish.name;

      const time = document.createElement('span');
      time.className = 'wish-item__time';
      time.textContent = wish.time;

      meta.append(author, time);
      head.append(avatar, meta);

      const body = document.createElement('p');
      body.className = 'wish-item__body';
      body.textContent = wish.message;

      const likeBtn = document.createElement('button');
      likeBtn.type = 'button';
      likeBtn.className = `wish-like-btn${wish.liked ? ' is-liked' : ''}`;
      likeBtn.setAttribute('aria-pressed', String(Boolean(wish.liked)));
      likeBtn.textContent = `${wish.liked ? '\u2665' : '\u2661'} ${wish.likes}`;
      likeBtn.addEventListener('click', () => {
        wish.liked = !wish.liked;
        wish.likes += wish.liked ? 1 : -1;
        saveWishes(wishes);
        renderWishes();
      });

      card.append(head, body, likeBtn);
      wishesListEl.appendChild(card);
    });
  }

  renderWishes();

  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (wishNameInput.value || '').trim();
      const message = (wishMsgInput.value || '').trim();

      if (!name || !message) {
        wishFeedback.textContent = 'Please enter your name and blessing message.';
        return;
      }

      const now = new Date();
      const formattedTime = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      }).toUpperCase();

      wishes.unshift({
        id: `wish-${Date.now()}`,
        name,
        time: formattedTime,
        message,
        likes: 1,
        liked: true,
      });

      saveWishes(wishes);
      renderWishes();
      wishForm.reset();
      wishFeedback.textContent = 'JazakAllahu Khair! Your blessing has been added.';
    });
  }

  /* ===========================
     8. FOOTER PRINT / SAVE
     =========================== */
  const printBtn = document.getElementById('print-invite-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  /* ===========================
     9. SCROLL REVEAL FALLBACK
     =========================== */
  const supportsViewTimeline = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  if (!supportsViewTimeline && !prefersReducedMotion) {
    const revealEls = document.querySelectorAll('.reveal-up');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('js-reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealEls.forEach((el) => {
      el.classList.add('js-reveal-pending');
      observer.observe(el);
    });
  }
})();

