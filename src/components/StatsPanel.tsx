import { Language, UserStats } from '../types';
import { t } from '../i18n';
import { showToast } from './Toast';

interface StatsPanelProps {
  stats: UserStats;
  language: Language;
  onClose: () => void;
}

export default function StatsPanel({ stats, language, onClose }: StatsPanelProps) {
  const handleExportJSON = () => {
    const data = JSON.stringify(stats, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freegamehub-stats-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('dataExported', language), 'success');
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const handleExportText = () => {
    const lines = [
      `FreeGameHub Stats - ${new Date().toLocaleDateString()}`,
      `────────────────────────`,
      `${t('totalClaimed', language)}: ${stats.totalClaimed}`,
      `${t('totalSavingsStats', language)}: $${stats.totalSavings.toFixed(2)}`,
      `${t('gamesSeen', language)}: ${stats.totalGamesSeen}`,
      `${t('favorites', language)}: ${stats.favoriteCount}`,
      `${t('votesMade', language)}: ${stats.votesMade}`,
      `Session started: ${new Date(stats.sessionStart).toLocaleString()}`,
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freegamehub-stats-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('dataExported', language), 'success');
    if (navigator.vibrate) navigator.vibrate(15);
  };

  return (
    <div className="filter-overlay open" onClick={onClose} style={{ zIndex: 400 }}>
      <div className="filter-sheet open" onClick={e => e.stopPropagation()}>
        <div className="filter-handle" />
        <div className="filter-head">
          <h3 className="filter-title">{t('myStats', language)}</h3>
          <button className="filter-close" onClick={onClose}>✕</button>
        </div>

        <div className="stats-modal">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalClaimed}</div>
              <div className="stat-label">{t('totalClaimed', language)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${stats.totalSavings.toFixed(0)}</div>
              <div className="stat-label">{t('totalSavingsStats', language)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalGamesSeen}</div>
              <div className="stat-label">{t('gamesSeen', language)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.favoriteCount}</div>
              <div className="stat-label">{t('favorites', language)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.votesMade}</div>
              <div className="stat-label">{t('votesMade', language)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalSavings > 0 ? `${(stats.totalSavings / (stats.totalClaimed || 1)).toFixed(0)}` : '0'}</div>
              <div className="stat-label">$/reclamo</div>
            </div>
          </div>

          <div className="stats-actions">
            <button className="filter-btn secondary" onClick={handleExportJSON}>
              📄 {t('exportJSON', language)}
            </button>
            <button className="filter-btn secondary" onClick={handleExportText}>
              📝 {t('exportText', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
