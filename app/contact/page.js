import SiteShell from '../components/site-shell';

export default function ContactPage() {
  return (
    <SiteShell intro="Contact" title="Let’s create something elegant, useful, and memorable together.">
      <section className="section-block">
        <div className="card-grid">
          <article className="glass-card">
            <h3>Email</h3>
            <p>sadmansabab2808@gmail.com</p>
          </article>
          <article className="glass-card">
            <h3>Social</h3>
            <p>GitHub • Instagram • Facebook</p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
