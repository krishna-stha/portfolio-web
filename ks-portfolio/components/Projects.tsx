"use client";

import { ProjectItem } from "@/lib/types";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { ArrowUpRight } from "./icons";
import { sanitizeUrl } from "@/lib/sanitizeUrl";

export default function Projects({ projects }: { projects: ProjectItem[] }) {
  return (
    <section className="projects-section" id="projects">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <p className="section-num">05 / PROJECTS</p>
            <h2 className="section-title">Things I&apos;ve built</h2>
          </div>
        </Reveal>

        {projects.length ? (
          <RevealGroup className="projects-grid" stagger={0.08}>
            {projects.map((item) => (
              <RevealItem className="project-card" key={item.id}>
                {item.imageUrl && <img className="project-image" src={item.imageUrl} alt={item.title} />}
                <span className="project-year">{item.year}</span>
                <div className="project-title">{item.title}</div>
                <p className="project-desc">{item.description}</p>
                {item.projectUrl && (
                  <a className="project-link" href={sanitizeUrl(item.projectUrl)} target="_blank" rel="noopener noreferrer">
                    View project <ArrowUpRight />
                  </a>
                )}
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <p className="empty-state">No projects added yet — add your first one from the admin panel.</p>
        )}
      </div>
    </section>
  );
}
