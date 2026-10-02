"use client";

import { HeroData } from "@/lib/types";
import { smoothScrollTo } from "./Nav";

const FOOTER_LINKS = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
  { href: "#projects", label: "Projects" },
  { href: "#achievements", label: "Achievements" },
  { href: "#contact", label: "Contact" }
];

export default function Footer({ hero }: { hero: HeroData }) {
  function handleClick(e: React.MouseEvent, href: string) {
    e.preventDefault();
    smoothScrollTo(href);
  }

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <p className="footer-name">{hero.name}</p>
            <p className="footer-role">AI &amp; ML Enthusiast — building &amp; learning in public</p>
          </div>
          <ul className="footer-links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={(e) => handleClick(e, link.href)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} {hero.name}. All rights reserved.
          </p>
          <a
            href="#home"
            className="back-to-top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
