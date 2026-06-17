export function parsePrice(price: string | undefined | null): number {
  if (!price || price === 'N/A' || price === 'Pago') return 0;
  const match = price.toString().match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount.toFixed(0)}`;
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function getTimeInfo(endDate?: string, type?: string): { text: string; className: string } {
  if (!endDate) {
    return type === 'App'
      ? { text: '⚡ Oferta Flash', className: 'urgent' }
      : { text: '', className: 'normal' };
  }

  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { text: '✗ Expirado', className: 'expired' };
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  if (days > 0) {
    return {
      text: `⏰ ${days}d ${hours}h`,
      className: days <= 2 ? 'urgent' : 'normal'
    };
  }

  return { text: `🔥 ${hours}h restantes`, className: 'urgent' };
}

export function getRelativeTime(timestamp: string | null): string {
  if (!timestamp) return '--';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diff < 1) return 'Hace un momento';
  if (diff < 60) return `Hace ${diff} min`;
  if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`;
  return date.toLocaleDateString('es-CL');
}

// --- Haptic feedback (works on Android APK) ---
export function vibrate(pattern: number | number[] = 10): void {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// Simple fuzzy match: returns true if all chars of query appear in order in text
export function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  if (lowerQuery.length === 0) return false;
  let queryIdx = 0;
  for (let i = 0; i < lowerText.length && queryIdx < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIdx]) {
      queryIdx++;
    }
  }
  return queryIdx === lowerQuery.length;
}

export const GENRE_KEYWORDS: Record<string, string[]> = {
  action: ['action', 'acción', 'combat', 'fight', 'shooter', 'fps', 'battle', 'war'],
  rpg: ['rpg', 'role', 'adventure', 'aventura', 'fantasy', 'medieval'],
  indie: ['indie', 'pixel', 'retro', '2d'],
  strategy: ['strategy', 'estrategia', 'tower defense', 'rts', 'tactical'],
  puzzle: ['puzzle', 'logic', 'logico', 'brain'],
  racing: ['racing', 'carrera', 'drive', 'car', 'motorsport'],
  sports: ['sports', 'deporte', 'fifa', 'football', 'basketball', 'soccer'],
  shooter: ['shooter', 'fps', 'call of duty', 'battlefield', 'valorant']
};

/**
 * Convierte una clave VAPID base64 URL-safe a Uint8Array
 * para usar con la Push API del navegador.
 */
// --- UI Sounds (Web Audio API) ---
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}

/** Play a simple UI sound effect */
export function playSound(type: 'click' | 'success' | 'error' | 'favorite' | 'swipe') {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    switch (type) {
      case 'click':
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        osc.type = 'sine';
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'success':
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(784, now + 0.2);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      case 'error':
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        osc.type = 'sawtooth';
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'favorite':
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
        osc.type = 'sine';
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case 'swipe':
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        osc.type = 'triangle';
        osc.start(now);
        osc.stop(now + 0.08);
        break;
    }
  } catch { /* Audio not available */ }
}

// --- Seasonal Theme ---
export function getSeasonalTheme(): string | null {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  
  // Christmas: Dec 15 - Jan 6
  if ((month === 11 && day >= 15) || (month === 0 && day <= 6)) return 'christmas';
  // Halloween: Oct 20 - Oct 31
  if (month === 9 && day >= 20) return 'halloween';
  // New Year: Jan 1 - Jan 3
  if (month === 0 && day <= 3) return 'newyear';
  
  return null;
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

