import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Game, Language } from '../types';
import { t } from '../i18n';
import { parsePrice } from '../utils/format';

interface HeroCarouselProps {
  games: Game[];
  language: Language;
  onOpenDetail: (game: Game) => void;
}

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.5, ease: easeOut } },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, transition: { duration: 0.3 } }),
};

const bgVariants: Variants = {
  enter: { scale: 1.1, opacity: 0 },
  center: { scale: 1.05, opacity: 1, transition: { duration: 0.7, ease: easeOut } },
  exit: { scale: 1, opacity: 0, transition: { duration: 0.3 } },
};

const contentVariants: Variants = {
  enter: { opacity: 0 },
  center: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants: Variants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

export default function HeroCarousel({ games, language, onOpenDetail }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const heroGames = games.slice(0, 5);
  const totalSlides = heroGames.length;

  const goTo = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    intervalRef.current = setInterval(goNext, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, goNext, totalSlides]);

  if (totalSlides === 0) return null;

  return (
    <section
      className="hero-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
    >
      <div className="hero-carousel-track" style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
        <AnimatePresence custom={direction} mode="popLayout">
          {heroGames.map((game, idx) => {
            if (idx !== currentIndex) return null;
            const gameWorth = game.worth && game.worth !== 'N/A' && game.worth !== 'Pago'
              ? parsePrice(game.worth)
              : 0;

            return (
              <motion.div
                key={game.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="hero-carousel-slide active"
                onClick={() => onOpenDetail(game)}
                style={{ position: 'absolute', inset: 0, minWidth: '100%' }}
              >
                <motion.img
                  key={`bg-${game.id}`}
                  variants={bgVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  src={game.image}
                  alt=""
                  className="hero-carousel-bg"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.hero-carousel-fallback');
                    if (fallback) fallback.classList.add('visible');
                  }}
                />
                <div className="hero-carousel-fallback">
                  <span>{game.title.slice(0, 2).toUpperCase()}</span>
                </div>

                <div className="hero-carousel-gradient" />
                <div className="hero-carousel-gradient-side" />

                <motion.div
                  key={`content-${game.id}`}
                  className="hero-carousel-content"
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <motion.div variants={itemVariants} className="hero-carousel-badges">
                    {game.platformIcon && (
                      <span className="hero-carousel-platform-badge">
                        {game.platformIcon} {game.platformName || game.platform}
                      </span>
                    )}
                    {gameWorth > 0 && (
                      <span className="hero-carousel-worth-badge">
                        💰 ${game.worth}
                      </span>
                    )}
                    {idx === 0 && (
                      <span className="hero-carousel-featured-badge">
                        ⭐ {t('gameOfDay', language)}
                      </span>
                    )}
                  </motion.div>

                  <motion.h2 variants={itemVariants} className="hero-carousel-title">
                    {game.title}
                  </motion.h2>

                  {game.description && (
                    <motion.p variants={itemVariants} className="hero-carousel-desc">
                      {game.description.length > 120
                        ? game.description.slice(0, 120) + '...'
                        : game.description}
                    </motion.p>
                  )}

                  <motion.div variants={itemVariants} className="hero-carousel-actions">
                    <button
                      className="hero-carousel-btn primary"
                      onClick={e => { e.stopPropagation(); onOpenDetail(game); }}
                    >
                      👁️ {t('viewDetail', language)}
                    </button>
                    <a
                      href={game.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-carousel-btn secondary"
                      onClick={e => e.stopPropagation()}
                    >
                      🎮 {t('reclaim', language)}
                    </a>
                  </motion.div>
                </motion.div>

                <div className="hero-carousel-slide-num">
                  {String(idx + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {totalSlides > 1 && (
        <>
          <motion.button
            className="hero-carousel-arrow left"
            onClick={e => { e.stopPropagation(); goPrev(); }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
          >
            ‹
          </motion.button>
          <motion.button
            className="hero-carousel-arrow right"
            onClick={e => { e.stopPropagation(); goNext(); }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
          >
            ›
          </motion.button>
        </>
      )}

      {totalSlides > 1 && (
        <div className="hero-carousel-dots">
          {heroGames.map((_, idx) => (
            <motion.button
              key={idx}
              className={`hero-carousel-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={e => { e.stopPropagation(); goTo(idx); }}
              aria-label={`Slide ${idx + 1}`}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.8 }}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          ))}
        </div>
      )}

      {totalSlides > 1 && (
        <div className="hero-carousel-progress">
          <motion.div
            className="hero-carousel-progress-bar"
            animate={{ width: `${((currentIndex + 1) / totalSlides) * 100}%` }}
            transition={{ duration: 0.5, ease: easeOut }}
          />
        </div>
      )}
    </section>
  );
}
