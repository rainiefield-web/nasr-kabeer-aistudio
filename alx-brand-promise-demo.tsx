/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import { GemSmoke, gemSmokePresets } from "@paper-design/shaders-react";
import "./alx-brand-promise-demo.css";

const LOGO_SRC = "/site-assets/nkaco-logo.png";

function useRevealStyle(
  progress: MotionValue<number>,
  start: number,
  end: number,
  travel = 18
): MotionStyle {
  const reduceMotion = useReducedMotion();
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [travel, 0]);
  const filter = useTransform(progress, [start, end], ["blur(12px)", "blur(0px)"]);
  const scale = useTransform(progress, [start, end], [0.985, 1]);

  if (reduceMotion) {
    return { opacity: 1, y: 0, scale: 1, filter: "none" };
  }

  return { opacity, y, scale, filter };
}

function App() {
  const stageRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 82,
    damping: 28,
    mass: 0.72,
  });
  const visualScale = useTransform(progress, [0, 0.14], [0.978, 1]);
  const brand = useRevealStyle(progress, 0.16, 0.3, 16);
  const promise = useRevealStyle(progress, 0.34, 0.48, 18);
  const row1 = useRevealStyle(progress, 0.52, 0.64, 14);
  const row2 = useRevealStyle(progress, 0.64, 0.76, 14);
  const row3 = useRevealStyle(progress, 0.76, 0.88, 14);
  const visualStyle: MotionStyle = reduceMotion ? { scale: 1 } : { scale: visualScale };

  return (
    <main className="alx-page">
      <section ref={stageRef} className="alx-scroll-stage" aria-label="ALX Brand Promise">
        <div className="alx-section">
          <motion.div className="alx-visual" aria-label="ALX Gem Smoke visual" style={visualStyle}>
            <div className="alx-shader-shell">
              <GemSmoke
                className="alx-gem-smoke"
                {...gemSmokePresets[0].params}
                image={LOGO_SRC}
                fit="contain"
                suspendWhenProcessingImage
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </motion.div>

          <div className="alx-copy">
            <motion.div className="alx-brand-lockup" style={brand}>
              <p className="alx-kicker">ALX Brand Promise</p>
              <img className="alx-brand-logo" src={LOGO_SRC} alt="ALX" />
              <p className="alx-byline">by NKACO</p>
            </motion.div>
            <motion.p className="alx-promise alx-reveal" style={promise}>
              Saudi-made profiles for architectural, industrial, and transportation applications.
            </motion.p>
            <div className="alx-proof-list" aria-label="Application areas">
              <motion.article className="alx-proof-item alx-reveal" style={row1}>
                <span className="alx-proof-index">01</span>
                <strong>Architectural systems</strong>
                <p>Door, window, facade, and curtain wall profile programs.</p>
              </motion.article>
              <motion.article className="alx-proof-item alx-reveal" style={row2}>
                <span className="alx-proof-index">02</span>
                <strong>Industrial extrusion</strong>
                <p>Precision sections for machinery, energy, and engineered assemblies.</p>
              </motion.article>
              <motion.article className="alx-proof-item alx-reveal" style={row3}>
                <span className="alx-proof-index">03</span>
                <strong>Transportation supply</strong>
                <p>Lightweight aluminum profiles for mobility and export markets.</p>
              </motion.article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing root element");

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
