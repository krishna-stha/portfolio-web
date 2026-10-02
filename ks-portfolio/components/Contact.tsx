"use client";

import { SocialItem } from "@/lib/types";
import { SocialGlyph } from "./icons";
import { Reveal } from "./Reveal";
import { sanitizeUrl } from "@/lib/sanitizeUrl";

export default function Contact({ socials }: { socials: SocialItem[] }) {
  return (
    <section className="contact-section" id="contact">
      <div className="wrap">
        <Reveal className="contact-inner" y={36}>
          <div>
            <h2 className="contact-title">Let&apos;s build something intelligent together.</h2>
            <p className="contact-sub">
              Open to collaborations, internships, and interesting conversations about AI. Reach out on any of these.
            </p>
          </div>
          <div className="social-list">
            {socials.length ? (
              socials.map((item) => (
                <a className="social-item" href={sanitizeUrl(item.url)} target="_blank" rel="noopener noreferrer" key={item.id}>
                  <span className="s-label">{item.label}</span>
                  <SocialGlyph icon={item.icon} />
                </a>
              ))
            ) : (
              <p className="empty-state">Add your social links from the admin panel.</p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
