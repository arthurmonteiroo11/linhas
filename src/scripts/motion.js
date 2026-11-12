import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE_OUT = 'expo.out';
const EASE_POP = 'back.out(2.2)';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isStackedLayout = () => window.matchMedia('(max-width: 899px)').matches;

const chapterRange = () =>
  isStackedLayout()
    ? { drawStart: 'top 95%', drawEnd: 'top 50%', reveal: 'top 92%' }
    : { drawStart: 'top 75%', drawEnd: 'center center', reveal: 'top 70%' };

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
  const labels = document.querySelectorAll(`.map__labels[data-line="${id}"] text`);
  gsap.set(stations, { scale: 0, transformOrigin: '50% 50%' });
  gsap.set(labels, { opacity: 0, y: 4 });
  strokes.forEach((path) => {
    const length = Math.ceil(path.getTotalLength()) + 1;
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  });

  return gsap
    .timeline()
    .to(strokes, { strokeDashoffset: 0, ease: 'power1.inOut', duration: 1 })
    .to(stations, { scale: 1, ease: EASE_POP, duration: 0.25, stagger: 0.05 }, '-=0.15')
    .to(labels, { opacity: 1, y: 0, ease: EASE_OUT, duration: 0.3, stagger: 0.04 }, '-=0.1');
};

const announceLine = (color = null) => {
  if (color) document.documentElement.dataset.lineColor = color;
  else delete document.documentElement.dataset.lineColor;
  window.dispatchEvent(new CustomEvent('linhas:linha', { detail: { color } }));
};

const animateChapters = () => {
  const yearLabel = document.querySelector('.map__year');
  const range = chapterRange();

  ScrollTrigger.create({
    trigger: '.story__chapters',
    start: 'top center',
    onLeaveBack: () => announceLine(),
  });

  document.querySelectorAll('.chapter').forEach((chapter) => {
    ScrollTrigger.create({
      trigger: chapter,
      start: range.drawStart,
      end: range.drawEnd,
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
      scrollTrigger: { trigger: chapter, start: range.reveal },
    });
  });
};

export const initMotion = () => {
  if (prefersReducedMotion()) return;
  startSmoothScroll();
  revealHero();
  animateChapters();
};