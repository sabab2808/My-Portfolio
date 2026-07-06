'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' }
];

export default function SiteShell({ children, intro, title }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('portfolio-theme');
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = window.setTimeout(() => setIsTransitioning(false), 700);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <div className={`page-transition-layer ${isTransitioning ? 'active' : ''}`} aria-hidden="true" />

      <div className="background-scene" aria-hidden="true">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <div className="aurora aurora-three" />
        <div className="mesh-layer" />
        <div className="mesh-layer mesh-layer-2" />
        <div className="neon-glow glow-left" />
        <div className="neon-glow glow-right" />
        <div className="floating-card card-one" />
        <div className="floating-card card-two" />
        <div className="stars">
          {Array.from({ length: 26 }).map((_, index) => (
            <span key={index} className={`star star-${index % 6}`} />
          ))}
        </div>
      </div>

      <header className="site-header">
        <Link href="/" className="brand">
          <span className="brand-mark">S</span>
          <span>Md. Sadman Al Islam Shabab</span>
        </Link>

        <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav ${menuOpen ? 'open' : ''}`} aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Switch theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>

      <main className="page-shell">
        <section className="page-hero">
          <div className="page-hero__copy">
            <p className="eyebrow">{intro}</p>
            <h1>{title}</h1>
          </div>
        </section>

        {children}
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} CRYPT000</p>
      </footer>
    </>
  );
}
