"use client";

import { AboutData } from "@/lib/types";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { DownloadIcon } from "./icons";

export default function About({ about }: { about: AboutData }) {
  return (
    <section className="about" id="about">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <p className="section-num">01 / ABOUT</p>
            <h2 className="section-title">About me</h2>
          </div>
        </Reveal>

        <RevealGroup className="about-grid" stagger={0.15}>
          <RevealItem>
            <div className="about-photo">
              <div className="corner tl" />
              {about.photoUrl ? <img src={about.photoUrl} alt={about.initials} /> : <span className="initials">{about.initials}</span>}
              <div className="corner br" />
            </div>
          </RevealItem>
          <RevealItem y={16}>
            <p className="about-bio">{about.bio}</p>
            <div className="about-tags">
              {about.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            {about.resumeUrl && (
              <div className="about-resume">
                <a
                  className="btn"
                  href={about.resumeUrl}
                  download={about.resumeName || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadIcon />
                  Download resume
                </a>
              </div>
            )}
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
