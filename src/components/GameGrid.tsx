import { Game, ViewMode, Language, Vote } from '../types';
import GameCard from './GameCard';

interface GameGridProps {
  games: Game[];
  favorites: string[];
  viewedGames: string[];
  newGameIds: string[];
  votes: Record<string, Vote>;
  viewMode: ViewMode;
  language: Language;
  onToggleFavorite: (id: string) => void;
  onHideGame: (id: string) => void;
  onMarkAsViewed: (id: string) => void;
  onOpenDetail: (game: Game) => void;
}

export default function GameGrid({
  games, favorites, viewedGames, newGameIds, votes, viewMode, language,
  onToggleFavorite, onHideGame, onMarkAsViewed, onOpenDetail
}: GameGridProps) {
  if (games.length === 0) return null;

  return (
    <div id="games-container" className={`games-${viewMode}`}>
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          game={game}
          index={index}
          isFavorite={favorites.includes(game.id)}
          isViewed={viewedGames.includes(game.id)}
          isNew={newGameIds.includes(game.id)}
          votes={votes}
          viewMode={viewMode}
          language={language}
          onToggleFavorite={onToggleFavorite}
          onHideGame={onHideGame}
          onMarkAsViewed={onMarkAsViewed}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
}
