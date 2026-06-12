import { PALETTE } from '../palette';

// The product feature tiles' authored dark-window fiction (a distinct
// stage from the light product mockup — its own inks, verbatim from the
// old visual-tokens; even the traffic dots differ from the mockup's).
export const PRODUCT_FEATURE_SCENE = {
  window: {
    background: '#1c1c28',
    panelBackground: '#242434',
    border: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#f0f0f4',
    textSecondary: '#8b8b9e',
    textMuted: '#55556a',
    trafficDots: {
      close: '#ff5f57',
      minimize: '#ffbd2e',
      zoom: '#28c840',
    },
  },
  card: {
    background: '#1d1d25',
    border: 'rgba(255, 255, 255, 0.06)',
    text: 'rgba(255, 255, 255, 0.88)',
    textSecondary: 'rgba(255, 255, 255, 0.55)',
    textTertiary: 'rgba(255, 255, 255, 0.35)',
    accent: '#3e63dd',
    font: "'Inter', sans-serif",
    rowHoverWash: 'rgba(255, 255, 255, 0.02)',
  },
  // The tasks/emails record-activity windows share a deeper surface.
  activity: {
    background: '#191920',
    tabLine: 'rgba(255, 255, 255, 0.08)',
    activeTabWash: 'rgba(255, 255, 255, 0.06)',
    line: 'rgba(255, 255, 255, 0.06)',
    rowHoverWash: 'rgba(255, 255, 255, 0.03)',
    selectedRowWash: 'rgba(255, 255, 255, 0.04)',
    ink: 'rgba(255, 255, 255, 0.9)',
    inkStrong: 'rgba(255, 255, 255, 0.85)',
    inkBody: 'rgba(255, 255, 255, 0.75)',
    inkSoft: 'rgba(255, 255, 255, 0.65)',
    inkDetail: 'rgba(255, 255, 255, 0.5)',
    inkMuted: 'rgba(255, 255, 255, 0.45)',
    inkFaint: 'rgba(255, 255, 255, 0.4)',
    inkGhost: 'rgba(255, 255, 255, 0.35)',
    inkDim: 'rgba(255, 255, 255, 0.3)',
    circleBorder: 'rgba(255, 255, 255, 0.3)',
    circleBorderHover: 'rgba(255, 255, 255, 0.5)',
    strikethrough: 'rgba(255, 255, 255, 0.4)',
    buttonBorder: 'rgba(255, 255, 255, 0.15)',
    buttonBorderHover: 'rgba(255, 255, 255, 0.3)',
    inkOnFill: '#ffffff',
    taskCircleFill: '#3b82f6',
    taskCircleFillHover: '#2563eb',
    avatarInks: {
      indigo: '#6366f1',
      amber: '#f59e0b',
      violet: '#8b5cf6',
      cyan: '#06b6d4',
    },
  },
  // The dashboard widgets' chart inks (the accent IS the site blue).
  dashboard: {
    accent: PALETTE.blue,
    accentDim: 'rgba(74, 56, 245, 0.25)',
    accentSecondary: '#7938B2',
  },
  files: {
    dashedBorder: 'rgba(255, 255, 255, 0.12)',
    rowHoverWash: 'rgba(255, 255, 255, 0.03)',
    uploadOverWash: 'rgba(59, 130, 246, 0.05)',
    ghostBackground: '#2a2a34',
    ghostBorder: 'rgba(255, 255, 255, 0.1)',
    ghostShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    tones: {
      audio: { ink: '#f97316', wash: 'rgba(249, 115, 22, 0.15)' },
      document: { ink: '#ef4444', wash: 'rgba(239, 68, 68, 0.15)' },
      sheet: { ink: '#22c55e', wash: 'rgba(34, 197, 94, 0.15)' },
    },
  },
};
