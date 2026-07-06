(function () {
  const headerRoot = document.getElementById('site-header');
  const footerRoot = document.getElementById('site-footer');
  const page = document.body?.dataset?.page || 'home';

  if (headerRoot) {
    headerRoot.innerHTML = `
      <header class="site-header">
        <a class="brand" href="index.html">
          <span class="brand-mark">
            <img src="assets/photo-1.jpg" alt="Md. Sadman Al Islam Shabab" />
          </span>
          <span>Md. Sadman Al Islam Shabab</span>
        </a>
        <button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <nav class="site-nav" aria-label="Primary navigation">
          <a href="index.html" class="${page === 'home' ? 'active' : ''}">Home</a>
          <a href="about.html" class="${page === 'about' ? 'active' : ''}">About</a>
          <a href="projects.html" class="${page === 'projects' ? 'active' : ''}">Projects</a>
          <a href="contact.html" class="${page === 'contact' ? 'active' : ''}">Contact</a>
        </nav>
        <button class="theme-toggle" type="button" aria-label="Switch theme">
          <span class="theme-toggle__icon">☀</span>
        </button>
      </header>
    `;
  }

  if (footerRoot) {
    footerRoot.innerHTML = `
      <footer class="site-footer">
        <div class="footer-cta reveal">
          <div>
            <p class="eyebrow">Ready when you are</p>
            <p>Let’s build something memorable.</p>
          </div>
          <a class="btn btn-primary magnetic" href="contact.html">Contact Me</a>
        </div>
        <div class="footer-meta reveal">
          <span>Crafted with intention</span>
          <span>© <span id="year"></span> CRYPT000</span>
        </div>
      </footer>
      <button class="back-to-top" type="button" aria-label="Back to top">↑</button>
    `;
  }
})();
