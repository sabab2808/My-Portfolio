const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const year = document.getElementById('year');
const header = document.querySelector('.site-header');
const backToTop = document.querySelector('.back-to-top');
const typedText = document.querySelector('.typed-text');
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-toggle__icon');
const form = document.querySelector('form');
const successMessage = document.querySelector('.form-success');
const projectList = document.getElementById('project-list');
const searchInput = document.getElementById('project-search');
const filterButtons = document.querySelectorAll('.chip');
const transitionOverlay = document.createElement('div');
transitionOverlay.className = 'page-transition';
document.body.appendChild(transitionOverlay);

['one', 'two', 'three'].forEach((className) => {
  const wave = document.createElement('div');
  wave.className = `ambient-wave ${className}`;
  document.body.appendChild(wave);
});

const playTransition = (direction) => {
  transitionOverlay.classList.remove('enter', 'exit');
  void transitionOverlay.offsetWidth;
  transitionOverlay.classList.add(direction);
  window.setTimeout(() => transitionOverlay.classList.remove(direction), direction === 'enter' ? 900 : 700);
};

const roles = ['thoughtful digital products.', 'premium web experiences.', 'modern solutions with clarity.'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let activeFilter = 'all';
let searchQuery = '';

const projects = [
  {
    title: 'HostelMania',
    description: 'A full-stack hostel food management platform that simplifies food ordering and canteen operations for hostel students and teachers.',
    category: 'Full Stack',
    tags: ['Personal Project', 'PHP', 'MySQL', 'JavaScript', 'HTML', 'CSS'],
    status: 'Final Year Project',
    date: '2025',
    features: ['Secure authentication', 'Role-based access control', 'Order tracking', 'Payment integration', 'Responsive design'],
    github: 'https://github.com/sabab2808/HostelMania2.0',
    demo: '#'
  },
  {
    title: 'Computer Graphics Project',
    description: 'A 2D space shooting game built with C++ and OpenGL/GLUT featuring gameplay, animation, collision handling, and score tracking.',
    category: 'Game Development',
    tags: ['C++', 'GLUT', 'OpenGL', 'Academic'],
    status: 'Academic Project',
    date: '2026',
    features: ['Player-controlled spaceship', 'Enemy objects', 'Shooting mechanic', 'Collision detection', 'Score tracking'],
    github: 'https://github.com/sabab2808/Computer-Graphics-Project',
    demo: '#'
  },
  {
    title: 'Machine Learning Projects',
    description: 'Academic projects focused on applying machine learning concepts such as preprocessing, feature extraction, model training, evaluation, and prediction.',
    category: 'Machine Learning',
    tags: ['ML', 'Academic'],
    status: 'Coursework',
    date: '2026',
    features: ['Data preprocessing', 'Model training', 'Model evaluation', 'Prediction techniques'],
    github: '#',
    demo: '#'
  },
  {
    title: 'NLP Projects',
    description: 'Academic projects exploring NLP techniques including text preprocessing, cleaning, feature extraction, analysis, and text-based workflows.',
    category: 'NLP',
    tags: ['NLP', 'Academic'],
    status: 'Coursework',
    date: '2026',
    features: ['Text preprocessing', 'Data cleaning', 'Feature extraction', 'Text analysis'],
    github: '#',
    demo: '#'
  },
  {
    title: 'Mini Web Projects Collection',
    description: 'A collection of frontend mini-projects focused on responsive layouts, modern UI design, and interactive user experiences.',
    category: 'Frontend',
    tags: ['Frontend', 'Practice'],
    status: 'Personal Practice',
    date: '2026',
    features: ['Responsive layouts', 'Interactive UI', 'Modern components', 'UX improvement'],
    github: '#',
    demo: '#'
  }
];

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeIcon) {
    themeIcon.textContent = theme === 'light' ? '☾' : '☀';
  }
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

const typeLoop = () => {
  if (!typedText) return;
  const currentRole = roles[roleIndex];
  typedText.textContent = currentRole.slice(0, charIndex);

  if (!isDeleting && charIndex < currentRole.length) {
    charIndex += 1;
  } else if (!isDeleting && charIndex === currentRole.length) {
    isDeleting = true;
    setTimeout(typeLoop, 900);
    return;
  } else if (isDeleting && charIndex > 0) {
    charIndex -= 1;
  } else {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
  }

  setTimeout(typeLoop, isDeleting ? 55 : 90);
};

typeLoop();
playTransition('enter');

if (year) {
  year.textContent = new Date().getFullYear();
}

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

document.querySelectorAll('a[href]').forEach((link) => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank' || link.hasAttribute('download')) {
    return;
  }

  const isExternal = /^(https?:)?\/\//i.test(href);
  if (isExternal) {
    return;
  }

  link.addEventListener('click', (event) => {
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const targetPath = new URL(href, window.location.href).pathname.replace(/\/$/, '');

    if (currentPath === targetPath) {
      return;
    }

    event.preventDefault();
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 150);
  });
});

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });
}

const renderProjects = () => {
  if (!projectList) return;

  const filtered = projects.filter((project) => {
    const matchesFilter = activeFilter === 'all' || project.category === activeFilter;
    const matchesSearch = [project.title, project.description, project.tags.join(' '), project.category]
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  projectList.innerHTML = filtered
    .map(
      (project) => `
        <article class="project-card reveal">
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="project-meta">
            ${project.tags.map((tag) => `<span>${tag}</span>`).join('')}
          </div>
          <ul class="timeline">
            <li><span>${project.status}</span><strong>${project.date}</strong></li>
          </ul>
          <div class="project-features">
            ${project.features.map((feature) => `<p>${feature}</p>`).join('')}
          </div>
          <div class="project-actions">
            <a href="${project.demo}" target="_blank" rel="noreferrer">Live Demo</a>
            <a href="${project.github}" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </article>
      `
    )
    .join('');

};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter || 'all';
    filterButtons.forEach((chip) => chip.classList.toggle('active', chip === button));
    renderProjects();
  });
});

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    searchQuery = event.target.value;
    renderProjects();
  });
}

renderProjects();

window.addEventListener('scroll', () => {
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }

  if (backToTop) {
    backToTop.classList.toggle('visible', window.scrollY > 600);
  }
});

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelectorAll('.magnetic').forEach((button) => {
  button.addEventListener('mousemove', (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    button.style.transform = `translate(${(x - rect.width / 2) / 14}px, ${(y - rect.height / 2) / 14}px)`;
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = '';
  });
});

if (form && successMessage) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const message = form.querySelector('textarea[name="message"]').value.trim();

    if (!name || !email || !message) {
      successMessage.textContent = 'Please fill in all fields before sending.';
      successMessage.style.display = 'block';
      return;
    }

    successMessage.textContent = `Thanks, ${name}! Your message is ready to send.`;
    successMessage.style.display = 'block';
    form.reset();
  });
}
