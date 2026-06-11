// The site's three elevation shadows. Components never write box-shadow
// values inline.
export const SHADOW: Record<'header' | 'popup' | 'popupDark', string> = {
  // sticky menu when the page is scrolled
  header: '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
  // light popups (nav dropdown)
  popup: '0 12px 32px rgba(0, 0, 0, 0.08)',
  // dark popups (locale switcher)
  popupDark: '0 12px 32px rgba(0, 0, 0, 0.4)',
};
