import { THEME_COMMON } from 'twenty-ui/theme';

// Product layout facts the mockup mirrors that aren't part of twenty-ui's
// theme. The spacing base and nav-item height derive from twenty-ui's spacing
// unit; the drawer width and record-table row height are twenty-front layout
// constants (NavigationDrawerConstraints / RecordTableRowHeight).
export const APP_PREVIEW_CHROME = {
  spacingBasePx: THEME_COMMON.spacingMultiplicator,
  navigationItemHeightPx: THEME_COMMON.spacingMultiplicator * 7,
  navigationDrawerWidthPx: 220,
  recordTableRowHeightPx: 32,
};
