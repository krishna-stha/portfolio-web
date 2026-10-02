"use client";

import { EducationItem, ExperienceItem } from "@/lib/types";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";

export default function Journey({
  experience,
  education
}: {
  experience: ExperienceItem[];
  education: EducationItem[];
}) {
  return (
    <section className="journey-section" id="journey">
      <div className="wrap">
        <div className="journey-sub" id="experience">
          <Reveal className="journey-sub-head">
            <h3>Where I&apos;ve worked</h3>
            <span>03 / EXPERIENCE</span>
          </Reveal>
          {experience.length ? (
            <RevealGroup className="timeline" stagger={0.08}>
              {experience.map((item) => (
                <RevealItem className="timeline-item" key={item.id}>
                  <div className="timeline-period">{item.period}</div>
                  <div>
                    <div className="timeline-role">{item.role}</div>
                    <div className="timeline-org">{item.company}</div>
                    <p className="timeline-desc">{item.description}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <p className="empty-state">No experience added yet — add your first entry from the admin panel.</p>
          )}
        </div>

        <div className="journey-sub" id="education">
          <Reveal className="journey-sub-head">
            <h3>What I&apos;ve studied</h3>
            <span>04 / EDUCATION</span>
          </Reveal>
          {education.length ? (
            <RevealGroup className="timeline" stagger={0.08}>
              {education.map((item) => (
                <RevealItem className="timeline-item" key={item.id}>
                  <div className="timeline-period">{item.period}</div>
                  <div>
                    <div className="timeline-role">{item.degree}</div>
                    <div className="timeline-org">{item.institution}</div>
                    <p className="timeline-desc">{item.description}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <p className="empty-state">No education added yet — add your first entry from the admin panel.</p>
          )}
        </div>
      </div>
    </section>
  );
}
