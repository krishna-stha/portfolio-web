"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HeroData } from "@/lib/types";
import { smoothScrollTo } from "./Nav";
import { sanitizeUrl } from "@/lib/sanitizeUrl";

export default function Hero({ hero }: { hero: HeroData }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);

  const nameParts = hero.name.trim().split(" ");
  const last = nameParts.pop() || "";
  const rest = nameParts.join(" ");

  function handleCta(e: React.MouseEvent, url: string) {
    if (url.startsWith("#")) {
      e.preventDefault();
      smoothScrollTo(url);
    }
  }

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.12, delayChildren: 0.05 } }
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.01 : 0.6, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section className="hero" id="home" ref={sectionRef}>
      <div className="wrap">
        <motion.div className="hero-copy" initial="hidden" animate="visible" variants={container}>
          <motion.p className="hero-eyebrow" variants={item}>
            <span className="blip" />
            AVAILABLE FOR COLLABORATIONS
          </motion.p>
          <motion.h1 className="hero-title" variants={item}>
            {rest}
            {rest ? <br /> : null}
            <span className="accent">{last}</span>
          </motion.h1>
          <motion.p className="hero-role" variants={item}>
            {hero.role}
          </motion.p>
          <motion.p className="hero-tagline" variants={item}>
            {hero.tagline}
          </motion.p>
          <motion.div className="hero-ctas" variants={item}>
            <a href={sanitizeUrl(hero.cta1Url)} className="btn" onClick={(e) => handleCta(e, hero.cta1Url)}>
              {hero.cta1Label}
            </a>
            <a href={sanitizeUrl(hero.cta2Url)} className="btn btn-outline" onClick={(e) => handleCta(e, hero.cta2Url)}>
              {hero.cta2Label}
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          style={{ y: parallaxY }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduce ? 0.01 : 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="doodle-window dw-terminal">
            <div className="dw-bar">
              <span />
              <span />
              <span />
            </div>
            <div className="dw-body">
              &gt;&gt;&gt; <span className="c1">import</span> torch
              <br />
              &gt;&gt;&gt; model = <span className="c2">NeuralNet</span>()
              <br />
              &gt;&gt;&gt; model.<span className="c3">train</span>(epochs=100)
              <br />
              Loss: 0.0021 <span className="dw-cursor" />
            </div>
          </div>

          <div className="dw-badge">STATUS: LEARNING()</div>

          <div className="doodle-window dw-node">
            <div className="dw-bar">
              <span />
              <span />
            </div>
            <svg className="node-svg" viewBox="0 0 190 90">
              <line x1="20" y1="20" x2="95" y2="45" stroke="#0B0B0D" strokeWidth="2" />
              <line x1="20" y1="70" x2="95" y2="45" stroke="#0B0B0D" strokeWidth="2" />
              <line x1="95" y1="45" x2="170" y2="20" stroke="#0B0B0D" strokeWidth="2" />
              <line x1="95" y1="45" x2="170" y2="70" stroke="#0B0B0D" strokeWidth="2" />
              <circle cx="20" cy="20" r="8" fill="#0B0B0D" />
              <circle cx="20" cy="70" r="8" fill="#0B0B0D" />
              <circle cx="95" cy="45" r="9" fill="#F1EEE4" stroke="#0B0B0D" strokeWidth="2" />
              <circle cx="170" cy="20" r="8" fill="#0B0B0D" />
              <circle cx="170" cy="70" r="8" fill="#0B0B0D" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
