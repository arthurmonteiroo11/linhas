const DWELL_MS = { start: 0, chapter: 2800, card: 2200, end: 0 };
const LABELS = { idle: 'Iniciar viagem', playing: 'Pausar', paused: 'Continuar', end: 'Voltar ao início' };
const ICONS = { idle: '▶', playing: '❚❚', paused: '▶', end: '↺' };
const INTERRUPT_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End']);

const easeInOutQuint = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);

const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
const pageTop = (el) => el.getBoundingClientRect().top + window.scrollY;
const centeredOn = (el) => pageTop(el) + el.offsetHeight / 2 - window.innerHeight / 2;
const clampScroll = (y) => Math.min(Math.max(y, 0), maxScroll());

const collectStops = (curiositiesTrigger) => {
  const stops = [{ label: 'Início', y: 0, kind: 'start' }];

  document.querySelectorAll('.chapter').forEach((chapter) => {
    stops.push({ label: chapter.dataset.label, y: centeredOn(chapter), kind: 'chapter' });
  });

  const cards = [...document.querySelectorAll('.curiosity')];
  if (curiositiesTrigger && cards.length > 1) {
    const { start, end } = curiositiesTrigger;
    cards.forEach((card, i) => {
      const y = start + (i / (cards.length - 1)) * (end - start);
      stops.push({ label: card.dataset.label, y, kind: 'card' });
    });
  } else {
    const section = document.querySelector('.curiosities');
    if (section) stops.push({ label: 'Curiosidades', y: pageTop(section), kind: 'card' });
  }

  stops.push({ label: 'Fim da linha', y: maxScroll(), kind: 'end' });
  return stops.map((stop) => ({ ...stop, y: clampScroll(stop.y) }));
};

const findUpcoming = (stops) => stops.find((stop) => stop.y > window.scrollY + 4) ?? stops.at(-1);

const createScroller = (lenis) => (y, onArrive) => {
  const distance = Math.abs(y - window.scrollY);
  if (distance < 2) return onArrive();

  if (!lenis) {
    window.scrollTo({ top: y, behavior: 'instant' });
    return onArrive();
  }

  const duration = Math.min(2.4, Math.max(1, distance / 900));
  lenis.scrollTo(y, { duration, easing: easeInOutQuint, onComplete: onArrive });
};

export const initTour = ({ lenis, curiositiesTrigger }) => {
  const root = document.querySelector('.tour');
  if (!root) return;

  const toggleButton = root.querySelector('[data-action="toggle"]');
  const nextButton = root.querySelector('[data-action="next"]');
  const nextLabel = root.querySelector('.tour__next');
  const bar = root.querySelector('.tour__bar');
  const chapters = [...document.querySelectorAll('.chapter')];
  const scrollTo = createScroller(lenis);

  let state = 'idle';
  let dwellTimer = 0;
  let frame = 0;

  const setVehicle = (vehicle = 'metro') => {
    if (root.dataset.vehicle === vehicle) return;
    root.dataset.vehicle = vehicle;
    root.classList.remove('is-switching');
    void root.offsetWidth;
    root.classList.add('is-switching');
  };

  const setState = (next) => {
    state = next;
    root.dataset.state = next;
    toggleButton.querySelector('.tour__icon').textContent = ICONS[next];
    toggleButton.querySelector('.tour__label').textContent = LABELS[next];
  };

  const goToNextStop = (onArrive = () => {}) => {
    const stop = findUpcoming(collectStops(curiositiesTrigger));
    scrollTo(stop.y, () => onArrive(stop));
  };

  const playStep = () => {
    goToNextStop((stop) => {
      if (state !== 'playing') return;
      if (stop.kind === 'end') return setState('end');
      dwellTimer = window.setTimeout(playStep, DWELL_MS[stop.kind]);
    });
  };

  const play = () => {
    setState('playing');
    playStep();
  };

  const pause = () => {
    window.clearTimeout(dwellTimer);
    lenis?.scrollTo(window.scrollY, { immediate: true });
    setState('paused');
  };

  const backToStart = () => {
    setState('idle');
    scrollTo(0, () => {});
  };

  const interrupt = () => {
    if (state === 'playing') pause();
  };

  const updateIndicators = () => {
    frame = 0;
    const max = maxScroll();
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;

    const middle = window.innerHeight / 2;
    const activeChapter = chapters.filter((ch) => ch.getBoundingClientRect().top < middle).at(-1);
    if (activeChapter) {
      root.style.setProperty('--tour-color', activeChapter.dataset.color);
      setVehicle(activeChapter.dataset.vehicle);
    }

    const atEnd = window.scrollY >= max - 8;
    if (atEnd && state !== 'end') {
      window.clearTimeout(dwellTimer);
      setState('end');
    } else if (!atEnd && state === 'end') {
      setState('idle');
    }

    nextLabel.textContent = atEnd
      ? 'Fim da linha'
      : `Próxima: ${findUpcoming(collectStops(curiositiesTrigger)).label}`;
  };

  toggleButton.addEventListener('click', () => {
    if (state === 'playing') pause();
    else if (state === 'end') backToStart();
    else play();
  });

  nextButton.addEventListener('click', () => {
    interrupt();
    goToNextStop();
  });

  window.addEventListener('wheel', interrupt, { passive: true });
  window.addEventListener('touchstart', interrupt, { passive: true });
  window.addEventListener('keydown', (event) => {
    if (INTERRUPT_KEYS.has(event.key) && !root.contains(event.target)) interrupt();
  });
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(updateIndicators);
  }, { passive: true });

  root.addEventListener('animationend', (event) => {
    if (event.animationName.includes('car-hop')) root.classList.remove('is-switching');
  });

  root.hidden = false;
  setState('idle');
  updateIndicators();
};