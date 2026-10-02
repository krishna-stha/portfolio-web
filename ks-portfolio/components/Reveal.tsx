"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  amount?: number;
}

/** Fades + slides an element in as it enters the viewport, once, smoothly. */
export function Reveal({ children, className, delay = 0, y = 28, once = true, amount = 0.2 }: RevealProps) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.01 : 0.65, delay, ease: [0.16, 1, 0.3, 1] }
    }
  };
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

/** Staggers its direct motion children in as a group enters the viewport. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  once = true,
  amount = 0.15
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : stagger } }
  };
  return (
    <motion.div className={className} initial="hidden" whileInView="visible" viewport={{ once, amount }} variants={container}>
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, y = 22 }: { children: ReactNode; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.01 : 0.55, ease: [0.16, 1, 0.3, 1] } }
  };
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
