import { Game, ViewMode, Language } from '../types';
import { t } from '../i18n';
import GameCard from './GameCard';

interface TrendingSectionProps {
  trendingGames: Game[];
  viewedGames: string[];
  newGameIds: string[];
  viewMode: ViewMode;
  language: Language;
  multiSelectActive: boolean;
  handleMarkAsViewed: (id: string) => void;
  handleOpenDetail: (game: Game) => void;
}

export default function TrendingSection({
  trendingGames,
  viewedGames,
  newGameIds,
  viewMode,
  language,
  multiSelectActive,
  handleMarkAsViewed,
  handleOpenDetail,
}: TrendingSectionProps) {
  if (trendingGames.length === 0 || multiSelectActive) {
    return null;
  }

  return (
    <section className="trending-section">
      <div className="trending-header">
        <div className="trending-icon">🔥</div>
        <h2 className="trending-title">{t('trendingTitle', language)}</h2>
        <span className="trending-subtitle">{t('trendingSubtitle', language)}</span>
      </div>
      {/*
        Cada tarjeta necesita un wrapper con ancho fijo para que el scroll
        horizontal funcione correctamente — sin él las tarjetas se expanden.
      */}
      <div className="trending-scroll">
        {trendingGames.map((game, index) => (
          <div
            key={game.id}
            style={{
              minWidth: 180,
              maxWidth: 200,
              width: 180,
              scrollSnapAlign: 'start',
              flexShrink: 0,
            }}
          >
            <GameCard
              game={game}
              index={index}
              isFavorite={false}
              isViewed={viewedGames.includes(game.id)}
              isNew={newGameIds.includes(game.id)}
              viewMode={viewMode}
              language={language}
              onToggleFavorite={() => {}}
              onMarkAsViewed={handleMarkAsViewed}
              onOpenDetail={handleOpenDetail}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
