"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
  { href: "#projects", label: "Projects" },
  { href: "#achievements", label: "Achievements" },
  { href: "#contact", label: "Contact" }
];

export function smoothScrollTo(hash: string) {
  const target = document.querySelector(hash);
  const nav = document.querySelector(".site-nav") as HTMLElement | null;
  if (!target || !nav) return;
  const top = target.getBoundingClientRect().top + window.pageYOffset - (nav.offsetHeight - 2);
  window.scrollTo({ top, behavior: "smooth" });
}

export default function Nav({ logoUrl }: { logoUrl?: string }) {
  const [open, setOpen] = useState(false);

  function handleClick(e: React.MouseEvent, href: string) {
    e.preventDefault();
    smoothScrollTo(href);
    setOpen(false);
  }

  return (
    <nav className="site-nav">
      <div className="wrap">
        <a href="#home" className="nav-logo" onClick={(e) => handleClick(e, "#home")}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="nav-logo-img" />
          ) : (
            <>
              <span className="dot" />
              KS.
            </>
          )}
        </a>

        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={(e) => handleClick(e, link.href)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <ThemeToggle />
          <button className="nav-burger" aria-label="Open menu" onClick={() => setOpen((v) => !v)}>
            <span />
          </button>
        </div>
      </div>

      {open && (
        <ul className="nav-links-mobile">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={(e) => handleClick(e, link.href)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
