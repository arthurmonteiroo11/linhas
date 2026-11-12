import { gsap } from 'gsap';

const HOVER_SCALE = 1.35;
const EASE_POP = 'back.out(2.2)';

const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const isRevealed = (station) => Number(gsap.getProperty(station, 'scale')) > 0.5;

export const initStationHover = ({ animate = true } = {}) => {
  const figure = document.querySelector('.map');
  const tip = figure?.querySelector('.map__tip');
  if (!figure || !tip || !canHover()) return;

  const show = (station) => {
    const box = station.getBoundingClientRect();
    const origin = figure.getBoundingClientRect();
    tip.textContent = station.dataset.name;
    tip.style.setProperty('--tip-color', station.parentElement.dataset.color);
    tip.style.translate = `${box.left + box.width / 2 - origin.left}px ${box.top - origin.top}px`;
    tip.classList.add('is-visible');
    if (animate) gsap.to(station, { scale: HOVER_SCALE, duration: 0.25, ease: EASE_POP });
  };

  const hide = (station) => {
    tip.classList.remove('is-visible');
    if (animate) gsap.to(station, { scale: 1, duration: 0.2, ease: 'power2.out' });
  };

  figure.addEventListener('pointerover', (event) => {
    const station = event.target.closest('.map__station');
    if (station && isRevealed(station)) show(station);
  });

  figure.addEventListener('pointerout', (event) => {
    const station = event.target.closest('.map__station');
    if (station && tip.classList.contains('is-visible')) hide(station);
  });
};