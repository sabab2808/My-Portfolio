import Link from 'next/link';
import SiteShell from './components/site-shell';

const highlights = ['Available for internships', 'Remote & on-site', 'Full-stack & UI/UX'];
const achievements = [
  {
    title: '160+ Beecrowd problems solved',
    text: 'Consistent problem-solving practice with a strong foundation in algorithms, logic, and competitive programming.',
    link: 'https://judge.beecrowd.com/en/profile/782321?__cf_chl_f_tk=_viiwIexdFeuoehIHLoGmUF5ziIYSz3ybZVoaVcNaPs-1783347684-1.0.1.1-_9C6XjbLX81JL0C25sllb1FEit_ztIqzKUNvKPS3fU4'
  }
];
const skills = [
  { title: 'Programming languages', text: 'JavaScript, TypeScript, Python, SQL, HTML5, CSS3' },
  { title: 'Frontend', text: 'React, Next.js, responsive UI, motion, accessibility' },
  { title: 'Backend', text: 'Node.js, Express.js, REST APIs, MongoDB, MySQL' },
  { title: 'Tools & AI', text: 'Git, GitHub, Vercel, Netlify, AI integration, automation' }
];

const projectCards = [
  {
    title: 'HostelMania',
    description: 'A full-stack hostel food management system with auth, ordering flow, role access, and payments.',
    tags: ['Full Stack', 'Final Year Project']
  },
  {
    title: 'Computer Graphics',
    description: 'A 2D space-shooting game built with C++ and OpenGL that feels polished and interactive.',
    tags: ['C++', 'OpenGL']
  },
  {
    title: 'ML & NLP Labs',
    description: 'Academic projects focused on practical machine learning and language processing workflows.',
    tags: ['AI', 'Academic']
  }
];

export default function HomePage() {
  return (
    <SiteShell intro="Computer Science & Engineering Student • Full Stack Web Developer • UI/UX Designer" title="I build polished digital products that feel premium and perform beautifully.">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="hero-lead">
            I’m Md. Sadman Al Islam Shabab, a CSE student at Daffodil International University who loves crafting modern web apps, backend systems, and elegant product experiences.
          </p>
          <div className="hero-actions">
            <Link href="/contact" className="btn btn-primary">Let’s Work Together</Link>
            <Link href="/projects" className="btn btn-secondary">Explore Projects</Link>
          </div>
          <div className="pill-row">
            {highlights.map((item) => (
              <span key={item} className="pill">{item}</span>
            ))}
          </div>
        </div>

        <div className="hero-card glass-card">
          <div className="avatar-orbit">
            <div className="avatar">
              <img src="/photo-1.jpg" alt="Md. Sadman Al Islam Shabab" />
            </div>
          </div>
          <h2>Building with curiosity, craft, and purposeful motion.</h2>
          <p>
            My work combines strong engineering fundamentals with a sharp eye for interface design and user experience.
          </p>
          <div className="stats-grid">
            <div>
              <strong>4+</strong>
              <span>Projects</span>
            </div>
            <div>
              <strong>3+</strong>
              <span>Leadership roles</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Growth-driven</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Problem solving</p>
          <h2>Built with logic, consistency, and a strong competitive programming habit.</h2>
        </div>
        <div className="card-grid">
          {achievements.map((item) => (
            <article key={item.title} className="glass-card interactive-card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <a href={item.link} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ marginTop: '12px', width: 'fit-content' }}>
                View Beecrowd Profile
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Core capabilities</p>
          <h2>Designed for modern product teams and ambitious founders.</h2>
        </div>
        <div className="card-grid">
          {skills.map((skill) => (
            <article key={skill.title} className="glass-card interactive-card">
              <h3>{skill.title}</h3>
              <p>{skill.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Featured work</p>
          <h2>Selected experiences shaped with clarity and impact.</h2>
        </div>
        <div className="card-grid projects-grid">
          {projectCards.map((project) => (
            <article key={project.title} className="glass-card project-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="tag-row">
                {project.tags.map((tag) => (
                  <span key={tag} className="pill small-pill">{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
