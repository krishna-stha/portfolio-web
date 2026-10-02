"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AchievementItem } from "@/lib/types";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { ArrowUpRight, ExpandIcon, CloseIcon } from "./icons";
import { sanitizeUrl } from "@/lib/sanitizeUrl";
import Carousel from "./Carousel";

export default function Achievements({ achievements }: { achievements: AchievementItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = achievements.find((a) => a.id === activeId) || null;

  // Lock background scroll and allow Escape to close while a card is expanded.
  useEffect(() => {
    if (!activeId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeId]);

  return (
    <section className="achievements-section" id="achievements">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <p className="section-num">06 / ACHIEVEMENTS</p>
            <h2 className="section-title">Milestones</h2>
          </div>
        </Reveal>

        {achievements.length ? (
          <RevealGroup className="achievements-grid" stagger={0.08}>
            {achievements.map((item) => (
              <RevealItem key={item.id}>
                <motion.div
                  className="achievement-card"
                  layoutId={`achievement-card-${item.id}`}
                  onClick={() => setActiveId(item.id)}
                  whileHover={{ x: -3, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${item.title}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setActiveId(item.id);
                  }}
                >
                  <span className="achievement-expand-hint" aria-hidden="true">
                    <ExpandIcon />
                  </span>
                  {item.imageUrls[0] && <img className="achievement-image" src={item.imageUrls[0]} alt={item.title} />}
                  <span className="achievement-year">{item.year}</span>
                  <div className="achievement-title">{item.title}</div>
                  <p className="achievement-desc">{item.description}</p>
                  {item.credentialUrl && (
                    <a
                      className="achievement-credential"
                      href={sanitizeUrl(item.credentialUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View credential <ArrowUpRight />
                    </a>
                  )}
                </motion.div>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <p className="empty-state">No achievements added yet — add your first one from the admin panel.</p>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="achievement-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setActiveId(null)}
          >
            <motion.div
              className="achievement-expanded"
              layoutId={`achievement-card-${active.id}`}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="achievement-expanded-close" aria-label="Close" onClick={() => setActiveId(null)}>
                <CloseIcon />
              </button>
              {active.imageUrls.length > 0 && <Carousel images={active.imageUrls} alt={active.title} />}
              <div className="achievement-expanded-body">
                <span className="achievement-expanded-year">{active.year}</span>
                <h3 className="achievement-expanded-title">{active.title}</h3>
                <p className="achievement-expanded-desc">{active.description}</p>
                {active.credentialUrl && (
                  <a
                    className="btn btn-sm achievement-expanded-credential"
                    href={sanitizeUrl(active.credentialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View credential <ArrowUpRight />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
