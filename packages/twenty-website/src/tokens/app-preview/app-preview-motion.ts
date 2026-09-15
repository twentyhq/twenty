// The mockup's authored motion grammar (reveal choreography curves; the
// standard curve comes from EASING).
export const APP_PREVIEW_MOTION: {
  revealPopEase: string;
  revealPulseEase: string;
  revealPulseFrames: string;
  windowSpringEase: string;
} = {
  // The icon's rotate-pop when the AI scenario creates an object.
  revealPopEase: 'cubic-bezier(0.34, 1.7, 0.64, 1)',
  // The sidebar row's slide-in ring pulse for the same reveal.
  revealPulseEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  // The pulse's keyframe body: a tone-colored ring that slides the row in,
  // flares, and decays. The consumer supplies --highlight-rgb (the icon's
  // tone) and the resting --highlight-rest-background.
  revealPulseFrames: `
    0% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0);
      box-shadow:
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0),
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0);
      opacity: 0;
      transform: translateX(-32px) translateY(-6px) scale(0.6);
    }
    16% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0.55);
      box-shadow:
        0 0 0 6px rgba(var(--highlight-rgb, 237, 95, 0), 0.4),
        0 12px 28px -6px rgba(var(--highlight-rgb, 237, 95, 0), 0.55);
      opacity: 1;
      transform: translateX(0) translateY(0) scale(1.18);
    }
    32% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0.42);
      box-shadow:
        0 0 0 12px rgba(var(--highlight-rgb, 237, 95, 0), 0.24),
        0 10px 22px -6px rgba(var(--highlight-rgb, 237, 95, 0), 0.38);
      transform: translateX(0) scale(0.97);
    }
    50% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0.28);
      box-shadow:
        0 0 0 18px rgba(var(--highlight-rgb, 237, 95, 0), 0.12),
        0 6px 16px -6px rgba(var(--highlight-rgb, 237, 95, 0), 0.22);
      transform: translateX(0) scale(1.02);
    }
    72% {
      background: rgba(var(--highlight-rgb, 237, 95, 0), 0.16);
      box-shadow:
        0 0 0 22px rgba(var(--highlight-rgb, 237, 95, 0), 0),
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0);
      transform: translateX(0) scale(1);
    }
    100% {
      background: var(--highlight-rest-background, transparent);
      box-shadow:
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0),
        0 0 0 0 rgba(var(--highlight-rgb, 237, 95, 0), 0);
      transform: translateX(0) scale(1);
    }
  `,
  // The terminal window's spring grow between chat states.
  windowSpringEase: 'cubic-bezier(0.34, 1.45, 0.55, 1)',
};
