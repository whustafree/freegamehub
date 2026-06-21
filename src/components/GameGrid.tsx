import { motion } from 'framer-motion';
import { Game, ViewMode, Language } from '../types';
import GameCard from './GameCard';

interface GameGridProps {
  games: Game[];
  viewedGames: string[];
  newGameIds: string[];
  viewMode: ViewMode;
  language: Language;
  multiSelectActive?: boolean;
  multiSelectedIds?: string[];
  onMarkAsViewed: (id: string) => void;
  onOpenDetail: (game: Game) => void;
  onToggleMultiSelectGame?: (id: string) => void;
}

export default function GameGrid({
  games, viewedGames, newGameIds, viewMode, language,
  multiSelectActive, multiSelectedIds,
  onMarkAsViewed, onOpenDetail,
  onToggleMultiSelectGame,
}: GameGridProps) {

  if (games.length === 0) return null;

  // CSS class switches between grid and list layout
  const containerClass = viewMode === 'list' ? 'games-list' : 'games-grid';

  return (
    <div id="games-container">
      <motion.div
        className={containerClass}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      >
        {games.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            index={index}
            isFavorite={false}
            isViewed={viewedGames.includes(game.id)}
            isNew={newGameIds.includes(game.id)}
            viewMode={viewMode}
            language={language}
            multiSelectActive={multiSelectActive}
            isMultiSelected={multiSelectedIds?.includes(game.id)}
            onToggleFavorite={() => {}}
            onMarkAsViewed={onMarkAsViewed}
            onOpenDetail={onOpenDetail}
            onToggleMultiSelectGame={onToggleMultiSelectGame}
          />
        ))}
      </motion.div>
    </div>
  );
}
