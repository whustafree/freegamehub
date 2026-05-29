import { Game, Vote, Language, WishlistStatus } from '../types';
import { t } from '../i18n';
import { getTimeInfo } from '../utils/format';
import { showToast } from './Toast';

interface GameDetailProps {
  game: Game;
  votes: Record<string, Vote>;
  wishlist: Record<string, WishlistStatus>;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onVote: (gameId: string, type: 'up' | 'down') => void;
  onToggleWishlist: (gameId: string) => void;
  onMarkClaimed: (gameId: string) => void;
}

export default function GameDetail({
  game, votes, wishlist, language, isOpen,
  onClose, onVote, onToggleWishlist, onMarkClaimed
}: GameDetailProps) {
  const timeInfo = getTimeInfo(game.endDate, game.type);
  const gameVotes = votes[game.id] || { up: 0, down: 0, userVote: null };
  const wishlistStatus = wishlist[game.id];
  const iconMap: Record<string, string> = {
    steam: '🟦', epic: '⬛', gog: '🟥', itch: '🤍',
  };

  const handleShare = async () => {
    const shareData = {
      title: game.title,
      text: `🎮 ${game.title} - ¡Gratis! Ahorra ${game.worth}`,
      url: game.url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(game.url);
      showToast(t('copied', language), 'success');
    }
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const handleVote = (type: 'up' | 'down') => {
    onVote(game.id, type);
    showToast(t('voteRecorded', language), 'success');
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleClaim = () => {
    onMarkClaimed(game.id);
    showToast(t('gameClaimed', language), 'success');
    if (navigator.vibrate) navigator.vibrate(20);
    window.location.href = game.url;
  };

  const handleWishlist = () => {
    onToggleWishlist(game.id);
    if (wishlistStatus) {
      showToast(t('gameRemoved', language), 'info');
    } else {
      showToast(t('gameWishlisted', language), 'success');
    }
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div className={`detail-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="detail-sheet" onClick={e => e.stopPropagation()}>
        <div className="detail-handle" />

        {game.image ? (
          <img
            src={game.image}
            alt={game.title}
            className="detail-header-img"
            onError={e => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = 'none';
              const parent = img.parentElement;
              if (parent) {
                const ph = parent.querySelector('.detail-header-img-placeholder') as HTMLElement;
                if (ph) ph.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div className="detail-header-img-placeholder" style={{ display: game.image ? 'none' : 'flex' }}>
          🎮
        </div>

        <div className="detail-body">
          <h2 className="detail-title">{game.title}</h2>

          {/* Action buttons */}
          <div className="detail-actions-row">
            <button className="detail-btn primary" onClick={handleClaim}>
              🎁 {t('reclaimBtn', language)}
            </button>
            <button
              className={`detail-btn outline ${wishlistStatus ? 'active' : ''}`}
              onClick={handleWishlist}
            >
              {wishlistStatus ? '📋 ' + t('removeWishlist', language) : '📋 ' + t('markWishlist', language)}
            </button>
            <button className="detail-btn outline" onClick={handleShare}>
              📤 {t('share', language)}
            </button>
          </div>

          {/* Info grid */}
          <div className="detail-info-grid">
            {game.worth && game.worth !== 'N/A' && (
              <div className="detail-info-item">
                <span className="detail-info-label">{t('price', language)}</span>
                <span className="detail-info-value" style={{ color: 'var(--gold)' }}>${game.worth}</span>
              </div>
            )}
            <div className="detail-info-item">
              <span className="detail-info-label">{t('platform', language)}</span>
              <span className="detail-info-value">{game.platformName || game.platform}</span>
            </div>
            {game.source && (
              <div className="detail-info-item">
                <span className="detail-info-label">{t('store', language)}</span>
                <span className="detail-info-value">
                  {iconMap[game.source] || '🛒'} {game.source.charAt(0).toUpperCase() + game.source.slice(1)}
                </span>
              </div>
            )}
            <div className="detail-info-item">
              <span className="detail-info-label">{t('ends', language)}</span>
              <span className={`detail-info-value card-time ${timeInfo.className}`} style={{ fontSize: '0.75rem' }}>
                {timeInfo.text}
              </span>
            </div>
          </div>

          {/* Description */}
          {game.description && (
            <div className="detail-section">
              <span className="detail-section-label">{t('description', language)}</span>
              <p className="detail-section-text">{game.description}</p>
            </div>
          )}

          {/* Instructions */}
          {game.instructions && (
            <div className="detail-section">
              <span className="detail-section-label">{t('instructions', language)}</span>
              <p className="detail-section-text" style={{ whiteSpace: 'pre-wrap' }}>{game.instructions}</p>
            </div>
          )}

          {/* Voting */}
          <div className="detail-section">
            <span className="detail-section-label">{t('share', language)}</span>
            <div className="vote-section">
              <button
                className={`vote-btn ${gameVotes.userVote === 'up' ? 'active' : ''}`}
                onClick={() => handleVote('up')}
              >
                👍 {gameVotes.up > 0 ? gameVotes.up : ''}
              </button>
              <span className="vote-count">·</span>
              <button
                className={`vote-btn ${gameVotes.userVote === 'down' ? 'active' : ''}`}
                onClick={() => handleVote('down')}
              >
                👎 {gameVotes.down > 0 ? gameVotes.down : ''}
              </button>
            </div>
          </div>

          {/* Store link */}
          <a
            href={game.url}
            target="_blank"
            rel="noopener"
            className="detail-btn primary"
            style={{ textAlign: 'center', textDecoration: 'none', width: '100%', justifyContent: 'center' }}
          >
            🔗 {t('openStore', language)}
          </a>
        </div>

        <button className="detail-close-btn" onClick={onClose}>
          {t('close', language)} ✕
        </button>
      </div>
    </div>
  );
}
