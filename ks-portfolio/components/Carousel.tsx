"use client";

import { useState } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface CarouselProps {
  images: string[];
  alt?: string;
}

const SWIPE_THRESHOLD = 60;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 })
};

export default function Carousel({ images, alt = "" }: CarouselProps) {
  const [[index, direction], setIndexDirection] = useState<[number, number]>([0, 0]);

  if (images.length === 0) return null;

  const current = ((index % images.length) + images.length) % images.length;

  function go(delta: number) {
    setIndexDirection(([i]) => [i + delta, delta]);
  }

  function goTo(target: number) {
    setIndexDirection([target, target > current ? 1 : -1]);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) go(1);
    else if (info.offset.x > SWIPE_THRESHOLD) go(-1);
  }

  return (
    <div className="carousel">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          className="carousel-slide"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          drag={images.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={handleDragEnd}
        >
          <img src={images[current]} alt={alt} draggable={false} />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button className="carousel-arrow prev" aria-label="Previous image" onClick={() => go(-1)}>
            <ChevronLeftIcon />
          </button>
          <button className="carousel-arrow next" aria-label="Next image" onClick={() => go(1)}>
            <ChevronRightIcon />
          </button>
          <div className="carousel-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot ${i === current ? "active" : ""}`}
                aria-label={`Go to image ${i + 1}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
