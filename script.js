/* ==========================================================================
   Interactive layer: theme, typed role, node-graph canvases, 3D tilt,
   scroll reveal, route transitions, project filtering, contact form.
   ========================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- theme ---------------- */

const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-toggle__icon');

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeIcon) themeIcon.innerHTML = theme === 'light' ? '&#9789;' : '&#9788;';
  localStorage.setItem('portfolio-theme', theme);
};

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme) {
  applyTheme(savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  applyTheme('light');
} else {
  applyTheme('dark');
}

themeToggle?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(next);
});

/* ---------------- mobile nav ---------------- */

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------- header scroll state + back to top ---------------- */

const header = document.querySelector('.site-header');
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 12);
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
});

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

/* ---------------- footer year ---------------- */

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------------- typed role text ---------------- */

const typedText = document.querySelector('.typed-text');
const roles = [
  'full-stack web applications.',
  'clean, dependable backend systems.',
  'polished, premium interfaces.',
];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typeLoop = () => {
  if (!typedText) return;
  const current = roles[roleIndex];
  typedText.textContent = current.slice(0, charIndex);

  if (!isDeleting && charIndex < current.length) {
    charIndex += 1;
  } else if (!isDeleting && charIndex === current.length) {
    isDeleting = true;
    setTimeout(typeLoop, 1100);
    return;
  } else if (isDeleting && charIndex > 0) {
    charIndex -= 1;
  } else {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
  }

  setTimeout(typeLoop, isDeleting ? 45 : 78);
};

if (typedText) {
  if (prefersReducedMotion) {
    typedText.textContent = roles[0];
  } else {
    typeLoop();
  }
}

/* ---------------- animated counters ---------------- */

function animateCounter(el) {
  const raw = el.textContent.trim();
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return;
  const target = parseInt(match[1], 10);
  const suffix = match[2];

  if (prefersReducedMotion) {
    el.textContent = `${target}${suffix}`;
    return;
  }

  const duration = 1000;
  const start = performance.now();

  const frame = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.round(eased * target)}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
}

/* ---------------- scroll reveal ---------------- */

const revealTargets = document.querySelectorAll('.reveal');

function markRevealed(el) {
  if (el.classList.contains('is-visible')) return;
  el.classList.add('is-visible');
  el.querySelectorAll('.skill-fill').forEach((bar) => bar.classList.add('animate'));
  el.querySelectorAll('.stat-grid strong, .console-stats strong').forEach((counter) => animateCounter(counter));
}

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealTargets.forEach((el) => markRevealed(el));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => markRevealed(entry.target), (i % 4) * 70);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '200px 0px -40px 0px' }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));

  // Safety net: IntersectionObserver only compares two discrete snapshots, so a
  // fast scroll (End key, a flung scrollbar, a big trackpad flick) can jump an
  // element from "below the fold" straight to "above the fold" without the
  // observer ever seeing it intersect — leaving it stuck at opacity 0 forever.
  // This sweep catches anything that slipped through on every scroll/resize.
  let sweepPending = false;
  const sweep = () => {
    sweepPending = false;
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 40) {
        markRevealed(el);
        revealObserver.unobserve(el);
      }
    });
  };
  const scheduleSweep = () => {
    if (sweepPending) return;
    sweepPending = true;
    requestAnimationFrame(sweep);
  };

  window.addEventListener('scroll', scheduleSweep, { passive: true });
  window.addEventListener('resize', scheduleSweep);
  scheduleSweep();
}

/* ---------------- 3D tilt (spring-eased, panels + hero console) ---------------- */

const canHover = !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches;

function attachTilt(el, strength = 4) {
  if (!el) return;
  const state = { tx: 0, ty: 0, rx: 0, ry: 0, active: false };
  let raf = null;

  const loop = () => {
    state.rx += (state.tx - state.rx) * 0.12;
    state.ry += (state.ty - state.ry) * 0.12;
    el.style.transform = `perspective(1200px) rotateX(${state.rx.toFixed(2)}deg) rotateY(${state.ry.toFixed(2)}deg) translateY(${state.active ? -3 : 0}px)`;

    if (state.active || Math.abs(state.rx - state.tx) > 0.02 || Math.abs(state.ry - state.ty) > 0.02) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
    }
  };

  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  el.addEventListener('mousemove', (event) => {
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    state.active = true;
    state.tx = -py * strength;
    state.ty = px * strength;
    kick();

    if (el.classList.contains('panel')) {
      el.style.setProperty('--spot-x', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--spot-y', `${(py + 0.5) * 100}%`);
    }
  });

  el.addEventListener('mouseleave', () => {
    state.active = false;
    state.tx = 0;
    state.ty = 0;
    kick();
  });
}

function attachTiltToAll(selector, strength) {
  document.querySelectorAll(selector).forEach((el) => attachTilt(el, strength));
}

if (canHover) {
  attachTilt(document.querySelector('.hero-console'), 8);
  attachTiltToAll('.panel:not(.project-card)', 3.5);
  attachTiltToAll('.project-card', 4.5);
}

/* ---------------- magnetic buttons ---------------- */

if (canHover) {
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach((btn) => {
    btn.addEventListener('mousemove', (event) => {
      const rect = btn.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${(x / 10).toFixed(1)}px, ${(y / 10).toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ---------------- cursor glow ---------------- */

if (canHover) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let glowX = window.innerWidth / 2;
  let glowY = window.innerHeight / 2;
  let targetX = glowX;
  let targetY = glowY;

  window.addEventListener('mousemove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    glow.style.opacity = '1';
  });

  const glowLoop = () => {
    glowX += (targetX - glowX) * 0.15;
    glowY += (targetY - glowY) * 0.15;
    glow.style.transform = `translate(${glowX}px, ${glowY}px)`;
    requestAnimationFrame(glowLoop);
  };
  glowLoop();

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
}

/* ---------------- scroll progress bar ---------------- */

const progressBar = document.querySelector('.scroll-progress__fill');

const updateProgress = () => {
  if (!progressBar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
};

window.addEventListener('scroll', updateProgress);
window.addEventListener('resize', updateProgress);
updateProgress();

/* ---------------- tech ticker (duplicate track for seamless loop) ---------------- */

document.querySelectorAll('.ticker-track').forEach((track) => {
  track.innerHTML += track.innerHTML;
});

/* ---------------- node-graph canvas (signature element) ---------------- */

function initNodeGraph(canvas, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const labels = options.labels || ['UI', 'API', 'DB', 'AUTH', 'CACHE', 'DEPLOY'];
  const nodeCount = options.nodeCount || labels.length;
  const linkDistance = options.linkDistance || 170;
  const accentColor = options.accent || '#e3a857';
  const signalColor = options.signal || '#63d496';

  let width, height, nodes;
  const fixedViewport = options.fixedViewport;

  const resize = () => {
    if (fixedViewport) {
      width = window.innerWidth;
      height = window.innerHeight;
    } else {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    }
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const makeNodes = () => {
    nodes = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: i === 0 ? 5 : 2.4 + Math.random() * 1.6,
      label: labels[i] || null,
      pulse: Math.random() * Math.PI * 2,
    }));
  };

  resize();
  makeNodes();

  window.addEventListener('resize', () => {
    resize();
  });

  let raf;

  const step = () => {
    ctx.clearRect(0, 0, width, height);

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 10 || n.x > width - 10) n.vx *= -1;
      if (n.y < 10 || n.y > height - 10) n.vy *= -1;
      n.pulse += 0.02;
    });

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDistance) {
          const alpha = 1 - dist / linkDistance;
          ctx.strokeStyle = `rgba(227, 168, 87, ${alpha * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n) => {
      const glow = 0.6 + Math.sin(n.pulse) * 0.4;
      ctx.beginPath();
      ctx.fillStyle = n.label ? signalColor : accentColor;
      ctx.globalAlpha = n.label ? 0.9 : 0.55 * glow + 0.3;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (n.label) {
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(240, 240, 240, 0.55)';
        ctx.fillText(n.label, n.x + 8, n.y + 3);
      }
    });

    raf = requestAnimationFrame(step);
  };

  if (prefersReducedMotion) {
    step();
    cancelAnimationFrame(raf);
  } else {
    step();
  }
}

initNodeGraph(document.getElementById('case-graph'), {
  labels: ['Student UI', 'Staff Dashboard', 'API', 'MySQL', 'Auth', 'Payments'],
  nodeCount: 6,
  linkDistance: 150,
});

/* ---------------- route transitions ---------------- */

const overlay = document.createElement('div');
overlay.className = 'route-overlay';
document.body.appendChild(overlay);

if (!prefersReducedMotion) {
  overlay.classList.add('enter');
  window.setTimeout(() => overlay.classList.remove('enter'), 650);
}

document.querySelectorAll('a[href]').forEach((link) => {
  const href = link.getAttribute('href');
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    link.target === '_blank' ||
    link.hasAttribute('download') ||
    /^(https?:)?\/\//i.test(href)
  ) {
    return;
  }

  link.addEventListener('click', (event) => {
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const targetPath = new URL(href, window.location.href).pathname.replace(/\/$/, '');
    if (currentPath === targetPath || prefersReducedMotion) return;

    event.preventDefault();
    overlay.classList.add('leave');
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 420);
  });
});

/* ---------------- projects: filter + search (projects.html) ---------------- */

const projects = [
  {
    title: 'HostelMania',
    description:
      'A hostel food ordering system built solo, one semester, 2 user roles (student and staff) — from database schema through to a deployed application.',
    category: 'Full Stack',
    tags: ['PHP', 'MySQL', 'JavaScript', 'HTML', 'CSS'],
    status: 'Final Year Project',
    date: '2025',
    features: ['Secure authentication', 'Role-based access control', 'Order tracking', 'Payment integration', 'Responsive design'],
    github: 'https://github.com/sabab2808/HostelMania2.0',
    demo: '',
    caseStudy: 'project-hostelmania.html',
  },
  {
    title: 'Computer Graphics Project',
    description:
      'A 2D space shooting game built with C++ and OpenGL/GLUT featuring gameplay, animation, collision handling, and score tracking.',
    category: 'Game Development',
    tags: ['C++', 'OpenGL', 'GLUT'],
    status: 'Academic Project',
    date: '2026',
    features: ['Player-controlled spaceship', 'Enemy objects', 'Shooting mechanic', 'Collision detection', 'Score tracking'],
    github: 'https://github.com/sabab2808/Computer-Graphics-Project',
    demo: '',
  },
  {
    title: 'Machine Learning Projects',
    description:
      'Academic coursework applying machine learning concepts such as preprocessing, feature extraction, model training, and evaluation.',
    category: 'Machine Learning',
    tags: ['Python', 'ML'],
    status: 'Coursework',
    date: '2026',
    features: ['Data preprocessing', 'Model training', 'Model evaluation', 'Prediction techniques'],
    github: '',
    demo: '',
  },
  {
    title: 'NLP Projects',
    description:
      'Academic projects exploring NLP techniques including text preprocessing, cleaning, feature extraction, and text-based workflows.',
    category: 'NLP',
    tags: ['Python', 'NLP'],
    status: 'Coursework',
    date: '2026',
    features: ['Text preprocessing', 'Data cleaning', 'Feature extraction', 'Text analysis'],
    github: '',
    demo: '',
  },
  {
    title: 'Mini Web Projects Collection',
    description:
      'A collection of frontend mini-projects focused on responsive layouts, modern UI design, and interactive user experiences.',
    category: 'Frontend',
    tags: ['HTML', 'CSS', 'JavaScript'],
    status: 'Personal Practice',
    date: '2026',
    features: ['Responsive layouts', 'Interactive UI', 'Modern components', 'UX improvement'],
    github: '',
    demo: '',
  },
];

const projectList = document.getElementById('project-list');
const searchInput = document.getElementById('project-search');
const filterButtons = document.querySelectorAll('.chip');

let activeFilter = 'all';
let searchQuery = '';

const projectCardHTML = (project) => `
  <article class="panel project-card reveal is-visible">
    <h3>${project.title}</h3>
    <p>${project.description}</p>
    <div class="project-tags">
      ${project.tags.map((tag) => `<span>${tag}</span>`).join('')}
    </div>
    <div class="project-features">
      ${project.features.map((feature) => `<p>${feature}</p>`).join('')}
    </div>
    <div class="project-meta-row">
      <span>${project.status}</span>
      <span>${project.date}</span>
    </div>
    <div class="project-actions">
      ${project.caseStudy ? `<a href="${project.caseStudy}">Read case study</a>` : ''}
      ${project.github ? `<a href="${project.github}" target="_blank" rel="noreferrer">View on GitHub</a>` : ''}
    </div>
  </article>
`;

const renderProjects = () => {
  if (!projectList) return;

  const filtered = projects.filter((project) => {
    const matchesFilter = activeFilter === 'all' || project.category === activeFilter;
    const haystack = [project.title, project.description, project.tags.join(' '), project.category]
      .join(' ')
      .toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  projectList.innerHTML = filtered.length
    ? filtered.map(projectCardHTML).join('')
    : '<div class="empty-state">No projects match that search.</div>';

  if (canHover) {
    projectList.querySelectorAll('.project-card').forEach((el) => attachTilt(el, 4.5));
  }
};

if (projectList) {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      filterButtons.forEach((chip) => chip.classList.toggle('active', chip === button));
      renderProjects();
    });
  });

  searchInput?.addEventListener('input', (event) => {
    searchQuery = event.target.value;
    renderProjects();
  });

  renderProjects();
}

/* ---------------- copy to clipboard (contact endpoints) ---------------- */

document.querySelectorAll('[data-copy]').forEach((btn) => {
  const actionEl = btn.querySelector('.endpoint-action');
  const defaultLabel = actionEl ? actionEl.textContent : null;

  btn.addEventListener('click', async () => {
    const value = btn.getAttribute('data-copy');
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      // clipboard API unavailable (e.g. insecure context) — fall back silently
    }
    btn.classList.add('copied');
    if (actionEl) actionEl.textContent = 'copied';
    setTimeout(() => {
      btn.classList.remove('copied');
      if (actionEl && defaultLabel) actionEl.textContent = defaultLabel;
    }, 1600);
  });
});

/* ---------------- print resume ---------------- */

document.querySelector('[data-print]')?.addEventListener('click', () => {
  window.print();
});

const form = document.querySelector('form[data-contact-form]');
const successMessage = document.querySelector('.form-status');

if (form && successMessage) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const message = form.querySelector('textarea[name="message"]').value.trim();

    if (!name || !email || !message) {
      successMessage.textContent = 'Please fill in all fields before sending.';
      successMessage.style.color = '#e3a857';
      successMessage.style.display = 'block';
      return;
    }

    successMessage.textContent = `Thanks, ${name} — your message is ready to send. Reach out directly at shabab23105101104@diu.edu.bd if this form isn't connected to an inbox yet.`;
    successMessage.style.color = '';
    successMessage.style.display = 'block';
    form.reset();
  });
}

/* ---------------- gallery carousel ---------------- */

(function initGalleryCarousel() {
  const console_ = document.querySelector('.gallery-console');
  if (!console_) return;

  const track = console_.querySelector('.gallery-track');
  const slides = Array.from(console_.querySelectorAll('.gallery-slide'));
  const prevBtn = console_.querySelector('.gallery-arrow--prev');
  const nextBtn = console_.querySelector('.gallery-arrow--next');
  const dotsWrap = console_.querySelector('.gallery-dots');
  const viewport = console_.querySelector('.gallery-viewport');

  if (!track || slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    return;
  }

  let index = 0;
  let autoplayTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `gallery-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.querySelectorAll('.gallery-dot'));

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    render();
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    autoplayTimer = setInterval(next, 4500);
  }

  prevBtn?.addEventListener('click', () => {
    prev();
    startAutoplay();
  });
  nextBtn?.addEventListener('click', () => {
    next();
    startAutoplay();
  });

  console_.addEventListener('mouseenter', stopAutoplay);
  console_.addEventListener('mouseleave', startAutoplay);
  console_.addEventListener('focusin', stopAutoplay);
  console_.addEventListener('focusout', startAutoplay);

  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
      startAutoplay();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
      startAutoplay();
    }
  });

  // swipe / drag support
  let dragStartX = null;
  let dragDeltaX = 0;

  const onDragStart = (x) => {
    dragStartX = x;
    dragDeltaX = 0;
    stopAutoplay();
    track.style.transition = 'none';
  };
  const onDragMove = (x) => {
    if (dragStartX === null) return;
    dragDeltaX = x - dragStartX;
    track.style.transform = `translateX(calc(-${index * 100}% + ${dragDeltaX}px))`;
  };
  const onDragEnd = () => {
    if (dragStartX === null) return;
    track.style.transition = '';
    if (Math.abs(dragDeltaX) > viewport.clientWidth * 0.18) {
      dragDeltaX < 0 ? next() : prev();
    } else {
      render();
    }
    dragStartX = null;
    startAutoplay();
  };

  viewport.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchmove', (e) => onDragMove(e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchend', onDragEnd);

  if (canHover) {
    let mouseDown = false;
    viewport.addEventListener('mousedown', (e) => {
      mouseDown = true;
      onDragStart(e.clientX);
    });
    window.addEventListener('mousemove', (e) => {
      if (mouseDown) onDragMove(e.clientX);
    });
    window.addEventListener('mouseup', () => {
      if (mouseDown) onDragEnd();
      mouseDown = false;
    });
  }

  render();
  startAutoplay();
})();

const clockEl = document.querySelector('[data-clock]');

if (clockEl) {
  const tickClock = () => {
    clockEl.textContent = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  tickClock();
  setInterval(tickClock, 1000 * 15);
}

/* ---------------- command palette (Cmd/Ctrl+K) ---------------- */

(function initCommandPalette() {
  const navItems = window.__siteNav || [];

  const commands = [
    ...navItems.map((item) => ({
      group: 'Navigate',
      label: `Go to ${item.label}`,
      hint: item.href,
      run: () => {
        window.location.href = item.href;
      },
    })),
    {
      group: 'Actions',
      label: 'Copy email address',
      hint: 'shabab23105101104@diu.edu.bd',
      run: async () => {
        try {
          await navigator.clipboard.writeText('shabab23105101104@diu.edu.bd');
        } catch (err) {
          // clipboard unavailable — ignore
        }
      },
    },
    {
      group: 'Actions',
      label: 'Open GitHub',
      hint: 'github.com/sabab2808 ↗',
      run: () => window.open('https://github.com/sabab2808', '_blank', 'noopener'),
    },
    {
      group: 'Actions',
      label: 'Open LinkedIn',
      hint: 'linkedin.com/in/crypto28 ↗',
      run: () => window.open('https://www.linkedin.com/in/crypto28/', '_blank', 'noopener'),
    },
    {
      group: 'Actions',
      label: 'Download resume',
      hint: '.txt',
      run: () => {
        const a = document.createElement('a');
        a.href = 'assets/resume.txt';
        a.download = '';
        document.body.appendChild(a);
        a.click();
        a.remove();
      },
    },
    {
      group: 'Actions',
      label: 'Toggle theme',
      hint: document.documentElement.getAttribute('data-theme') === 'light' ? 'dark ↔ light' : 'light ↔ dark',
      run: () => {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
      },
    },
  ];

  const overlay = document.createElement('div');
  overlay.className = 'cmdk-overlay';
  overlay.innerHTML = `
    <div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Command menu">
      <div class="cmdk-input-row">
        <span class="cmdk-prompt">&gt;</span>
        <input type="text" class="cmdk-input" placeholder="Type a command or search..." autocomplete="off" spellcheck="false" />
        <kbd>esc</kbd>
      </div>
      <div class="cmdk-list" role="listbox"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('.cmdk-input');
  const list = overlay.querySelector('.cmdk-list');
  let filtered = commands;
  let activeIndex = 0;
  let isOpen = false;

  const render = () => {
    list.innerHTML = '';
    let lastGroup = null;

    if (!filtered.length) {
      list.innerHTML = '<div class="cmdk-empty">No matching commands.</div>';
      return;
    }

    filtered.forEach((cmd, i) => {
      if (cmd.group !== lastGroup) {
        const groupEl = document.createElement('div');
        groupEl.className = 'cmdk-group';
        groupEl.textContent = cmd.group;
        list.appendChild(groupEl);
        lastGroup = cmd.group;
      }
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `cmdk-item${i === activeIndex ? ' active' : ''}`;
      item.setAttribute('role', 'option');
      item.innerHTML = `<span>${cmd.label}</span><span class="cmdk-hint">${cmd.hint || ''}</span>`;
      item.addEventListener('mouseenter', () => {
        activeIndex = i;
        render();
      });
      item.addEventListener('click', () => execute(i));
      list.appendChild(item);
    });

    const activeEl = list.querySelector('.cmdk-item.active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  };

  const filterCommands = () => {
    const q = input.value.trim().toLowerCase();
    filtered = q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
    activeIndex = 0;
    render();
  };

  const execute = (i) => {
    const cmd = filtered[i];
    if (!cmd) return;
    close();
    cmd.run();
  };

  const open = () => {
    isOpen = true;
    overlay.classList.add('open');
    input.value = '';
    filterCommands();
    setTimeout(() => input.focus(), 10);
  };

  const close = () => {
    isOpen = false;
    overlay.classList.remove('open');
  };

  document.querySelector('.cmdk-trigger')?.addEventListener('click', open);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  input.addEventListener('input', filterCommands);

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
      render();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      execute(activeIndex);
    } else if (event.key === 'Escape') {
      close();
    }
  });

  document.addEventListener('keydown', (event) => {
    const isK = event.key === 'k' || event.key === 'K';
    if ((event.metaKey || event.ctrlKey) && isK) {
      event.preventDefault();
      isOpen ? close() : open();
      return;
    }
    if (event.key === 'Escape' && isOpen) {
      close();
    }
  });
})();
