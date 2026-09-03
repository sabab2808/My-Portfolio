(function () {
  const headerRoot = document.getElementById('site-header');
  const footerRoot = document.getElementById('site-footer');
  const page = document.body?.dataset?.page || 'home';

  const navItems = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'about.html', label: 'About', key: 'about' },
    { href: 'projects.html', label: 'Projects', key: 'projects' },
    { href: 'notes.html', label: 'Notes', key: 'notes' },
    { href: 'resume.html', label: 'Resume', key: 'resume' },
    { href: 'contact.html', label: 'Contact', key: 'contact' },
  ];

  window.__siteNav = navItems;
  window.__sitePage = page;

  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.innerHTML = '<div class="scroll-progress__fill"></div>';
  document.body.prepend(progressBar);

  if (headerRoot) {
    headerRoot.innerHTML = `
      <header class="site-header">
        <a class="brand" href="index.html">
          <img src="assets/logo-2.png" alt="Md. Sadman Al Islam Shabab" class="brand-logo" />
          <span class="brand-name">Md. Sadman Al Islam Shabab<span>Full Stack Developer</span></span>
        </a>
        <nav class="site-nav" aria-label="Primary navigation">
          ${navItems
            .map(
              (item) =>
                `<a href="${item.href}" class="nav-link${item.key === page ? ' active' : ''}">${item.label}</a>`
            )
            .join('')}
        </nav>
        <div class="header-actions">
          <button class="cmdk-trigger" type="button" aria-label="Open command menu">
            <span>Search</span><kbd>&#8984;K</kbd>
          </button>
          <button class="theme-toggle" type="button" aria-label="Switch theme">
            <span class="theme-toggle__icon">&#9788;</span>
          </button>
          <button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>
    `;
  }

  if (footerRoot) {
    footerRoot.innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-cta">
            <p>Currently open to internships and full-stack roles.</p>
            <a class="btn btn-secondary" href="contact.html">Get in touch</a>
          </div>
          <div class="footer-meta">
            <span>&copy; <span id="year"></span> Md. Sadman Al Islam Shabab</span>
            <a href="changelog.html">Changelog</a>
          </div>
        </div>
      </footer>
      <button class="back-to-top" type="button" aria-label="Back to top">&#8593;</button>
    `;
  }

  const currentFile = navItems.find((item) => item.key === page)?.href || `${page}.html`;

  const statusBar = document.createElement('div');
  statusBar.className = 'status-bar';
  statusBar.innerHTML = `
    <span class="status-bar-item status-bar-page">
      <span class="status-dot"></span>${currentFile}
    </span>
    <span class="status-bar-item status-bar-clock" data-clock></span>
    <span class="status-bar-spacer"></span>
    <span class="status-bar-item status-bar-hint">Press <kbd>&#8984;K</kbd> to search</span>
  `;
  document.body.appendChild(statusBar);
})();
