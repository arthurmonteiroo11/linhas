import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE_OUT = 'expo.out';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const startSmoothScroll = () => {
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
};

const revealHero = () => {
  gsap.from('.hero > *', {
    yPercent: 40,
    opacity: 0,
    duration: 1.1,
    ease: EASE_OUT,
    stagger: 0.08,
  });
};

const drawLinesOnScroll = () => {
  const yearLabel = document.querySelector('.map__year');

  document.querySelectorAll('.chapter').forEach((chapter) => {
    const line = document.querySelector(`.map__line[data-line="${chapter.dataset.line}"]`);
    if (!line) return;

    gsap.to(line, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: chapter,
        start: 'top 75%',
        end: 'center center',
        scrub: 0.6,
      },
    });

    ScrollTrigger.create({
      trigger: chapter,
      start: 'top center',
      end: 'bottom center',
      onToggle: ({ isActive }) => {
        if (isActive && yearLabel) yearLabel.textContent = chapter.dataset.year;
      },
    });

    gsap.from(chapter.children, {
      y: 32,
      opacity: 0,
      duration: 0.9,
      ease: EASE_OUT,
      stagger: 0.06,
      scrollTrigger: { trigger: chapter, start: 'top 70%' },
    });
  });
};

export const initMotion = () => {
  if (prefersReducedMotion()) return;
  startSmoothScroll();
  revealHero();
  drawLinesOnScroll();
};
