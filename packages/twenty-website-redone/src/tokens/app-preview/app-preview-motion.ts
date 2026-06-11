// The mockup's authored motion grammar (reveal choreography curves; the
// standard curve comes from EASING).
export const APP_PREVIEW_MOTION: {
  revealPopEase: string;
  revealPulseEase: string;
} = {
  // The icon's rotate-pop when the AI scenario creates an object.
  revealPopEase: 'cubic-bezier(0.34, 1.7, 0.64, 1)',
  // The sidebar row's slide-in ring pulse for the same reveal.
  revealPulseEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};
