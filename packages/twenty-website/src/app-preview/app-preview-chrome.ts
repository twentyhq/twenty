import { THEME_COMMON } from 'twenty-ui/theme';

// Product layout facts the mockup mirrors that aren't part of twenty-ui's
// theme. The spacing base and nav-item height derive from twenty-ui's spacing
// unit; the header height, drawer width and record-table row height are
// twenty-front layout constants (AppHeaderHeight / NavigationDrawerConstraints
// / RecordTableRowHeight).
export const APP_PREVIEW_CHROME = {
  spacingBasePx: THEME_COMMON.spacingMultiplicator,
  appHeaderHeightPx: 48,
  navigationItemHeightPx: THEME_COMMON.spacingMultiplicator * 7,
  navigationDrawerWidthPx: 220,
  navigationDrawerPaddingPx: THEME_COMMON.spacingMultiplicator * 2,
  recordTableRowHeightPx: 32,
};
