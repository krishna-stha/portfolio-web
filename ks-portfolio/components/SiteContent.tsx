"use client";

import { SiteData } from "@/lib/types";
import Nav from "./Nav";
import Hero from "./Hero";
import About from "./About";
import Skills from "./Skills";
import Journey from "./Journey";
import Projects from "./Projects";
import Achievements from "./Achievements";
import Contact from "./Contact";
import Footer from "./Footer";

export default function SiteContent({ data }: { data: SiteData }) {
  return (
    <>
      <Nav logoUrl={data.brand.logoUrl} />
      <main>
        <Hero hero={data.hero} />
        <About about={data.about} />
        <Skills skills={data.skills} />
        <Journey experience={data.experience} education={data.education} />
        <Projects projects={data.projects} />
        <Achievements achievements={data.achievements} />
        <Contact socials={data.socials} />
      </main>
      <Footer hero={data.hero} />
    </>
  );
}
