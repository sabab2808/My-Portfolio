import SiteShell from '../components/site-shell';

const projects = [
  { title: 'HostelMania', description: 'A full-stack hostel food management platform built with secure auth, order tracking, and payment integrations.' },
  { title: 'Computer Graphics Project', description: 'A 2D space shooting game built in C++ with OpenGL/GLUT for gameplay, animation, and collision handling.' },
  { title: 'ML & NLP Labs', description: 'Academic projects focused on preprocessing, model training, feature extraction, and prediction pipelines.' }
];

export default function ProjectsPage() {
  return (
    <SiteShell intro="Projects" title="Selected projects that reflect both technical skill and design sensibility.">
      <section className="section-block">
        <div className="card-grid projects-grid">
          {projects.map((project) => (
            <article key={project.title} className="glass-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
