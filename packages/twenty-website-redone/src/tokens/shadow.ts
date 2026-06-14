// The site's elevation shadows. Components never write box-shadow values
// inline.
export const SHADOW: Record<'header' | 'popup' | 'popupDark' | 'card', string> =
  {
    // sticky menu when the page is scrolled
    header: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    // light popups (nav dropdown)
    popup: '0 12px 32px rgba(0, 0, 0, 0.08)',
    // dark popups (locale switcher)
    popupDark: '0 12px 32px rgba(0, 0, 0, 0.4)',
    // a content card lifting on hover (the partner marketplace cards): a
    // tight, focused lift via negative spread, stronger than the nav popup.
    card: '0 12px 32px -16px rgba(0, 0, 0, 0.18)',
  };
