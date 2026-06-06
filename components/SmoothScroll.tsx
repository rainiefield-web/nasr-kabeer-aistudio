/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import Lenis from 'lenis';

declare global {
  interface Window {
    nasrLenis?: Lenis;
  }
}

const SmoothScroll = () => {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      anchors: {
        offset: -88,
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      },
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.86,
      touchMultiplier: 1,
    });

    window.nasrLenis = lenis;

    return () => {
      lenis.destroy();
      if (window.nasrLenis === lenis) {
        delete window.nasrLenis;
      }
    };
  }, []);

  return null;
};

export default SmoothScroll;
