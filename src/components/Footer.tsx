import { Language } from '../types';
import { t } from '../i18n';

interface FooterProps {
  language: Language;
}

export default function Footer({ language }: FooterProps) {
  return (
    <footer className="app-footer">
      <p className="footer-text">
        {t('footerText', language)}
      </p>
    </footer>
  );
}
