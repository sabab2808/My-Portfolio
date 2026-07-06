import SiteShell from '../components/site-shell';

export default function AboutPage() {
  return (
    <SiteShell intro="About" title="A curious developer blending engineering depth with thoughtful product design.">
      <section className="section-block">
        <div className="card-grid">
          <article className="glass-card">
            <h3>My journey</h3>
            <p>I’m a Computer Science and Engineering student at Daffodil International University, driven by building practical digital products that merge strong engineering with polished user experience.</p>
          </article>
          <article className="glass-card">
            <h3>Education</h3>
            <p>B.Sc. in CSE, Daffodil International University • Relevant coursework in Data Structures, DBMS, Networking, AI, NLP, and Web Engineering.</p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
