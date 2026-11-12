import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE_OUT = 'expo.out';
const EASE_POP = 'back.out(2.2)';

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

const buildLineTimeline = (id) => {
  const strokes = document.querySelectorAll(`.map__group[data-line="${id}"] path`);
  const stations = document.querySelectorAll(`.map__stations[data-line="${id}"] circle`);

  return gsap
    .timeline()
    .to(strokes, { strokeDashoffset: 0, ease: 'power1.inOut', duration: 1 })
    .to(stations, { scale: 1, ease: EASE_POP, duration: 0.25, stagger: 0.05 }, '-=0.15');
};

const announceLine = (color = null) => {
  if (color) document.documentElement.dataset.lineColor = color;
  else delete document.documentElement.dataset.lineColor;
  window.dispatchEvent(new CustomEvent('linhas:linha', { detail: { color } }));
};

const animateChapters = () => {
  const yearLabel = document.querySelector('.map__year');

  ScrollTrigger.create({
    trigger: '.story__chapters',
    start: 'top center',
    onLeaveBack: () => announceLine(),
  });

  document.querySelectorAll('.chapter').forEach((chapter) => {
    ScrollTrigger.create({
      trigger: chapter,
      start: 'top 75%',
      end: 'center center',
      scrub: 0.6,
      animation: buildLineTimeline(chapter.dataset.line),
    });

    ScrollTrigger.create({
      trigger: chapter,
      start: 'top center',
      end: 'bottom center',
      onToggle: ({ isActive }) => {
        if (!isActive) return;
        if (yearLabel) yearLabel.textContent = chapter.dataset.year;
        announceLine(chapter.dataset.color);
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
  animateChapters();
};