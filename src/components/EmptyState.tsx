import { Language } from '../types';
import { t } from '../i18n';

interface EmptyStateProps {
  language: Language;
  onReset: () => void;
}

export default function EmptyState({ language, onReset }: EmptyStateProps) {
  return (
    <div id="empty-state" className="empty-state">
      <div className="empty-icon">🔍</div>
      <h3>{t('noGames', language)}</h3>
      <p>{t('noGamesDesc', language)}</p>
      <button className="btn-primary" onClick={onReset}>{t('clearFilters', language)}</button>
    </div>
  );
}
