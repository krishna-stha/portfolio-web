"use client";

import { SkillItem } from "@/lib/types";
import { SKILL_LEVELS } from "@/lib/defaultData";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";

// Not linked in the primary nav on purpose — reachable by scrolling.
export default function Skills({ skills }: { skills: SkillItem[] }) {
  return (
    <section className="skills-section" id="skills">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <p className="section-num">02 / STACK</p>
            <h2 className="section-title">Languages &amp; tools</h2>
          </div>
        </Reveal>

        {skills.length ? (
          <RevealGroup className="skills-grid" stagger={0.06}>
            {skills.map((skill) => {
              const pct = SKILL_LEVELS[skill.level] ?? 50;
              return (
                <RevealItem className="skill-card" key={skill.id} y={18}>
                  <div className="skill-name">{skill.name}</div>
                  <span className="skill-level-label">{skill.level}</span>
                  <div className="skill-bar">
                    <div className="skill-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        ) : (
          <p className="empty-state">No languages or tools added yet — add some from the admin panel.</p>
        )}
      </div>
    </section>
  );
}
