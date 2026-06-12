// The mockup's tone tables, ported verbatim (single module — the old site
// scattered four copies). LEDGERED UPGRADE PENDING: derive from the
// product's TAG_LIGHT (color11 text on color3 background) as its own
// commit so the visual A/B judges the change in isolation.
type ToneSurface = { background: string; border: string; color: string };
type TonePair = { background: string; color: string };

const SIDEBAR: Record<string, ToneSurface> = {
  amber: { background: '#FEF2A4', border: '#FEF2A4', color: '#35290F' },
  blue: { background: '#d9e2fc', border: '#c6d4f9', color: '#3A5CCC' },
  gray: { background: '#ebebeb', border: '#d6d6d6', color: '#838383' },
  green: { background: '#ccebd7', border: '#bbe4c9', color: '#153226' },
  orange: { background: '#ffdcc3', border: '#ffcca7', color: '#ED5F00' },
  pink: { background: '#ffe1e7', border: '#ffc8d6', color: '#a51853' },
  purple: { background: '#e0e7ff', border: '#c7d2fe', color: '#4f46e5' },
  red: { background: '#fdd8d8', border: '#f9c6c6', color: '#DC3D43' },
  teal: { background: '#c7ebe5', border: '#afdfd7', color: '#0E9888' },
  violet: { background: '#ebe5ff', border: '#d8cbff', color: '#5b3fd1' },
};

const PERSON: Record<string, TonePair> = {
  amber: { background: '#f6e6d7', color: '#7a4f2a' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  gray: { background: '#e5e7eb', color: '#4b5563' },
  green: { background: '#dcfce7', color: '#15803d' },
  orange: { background: '#ffdcc3', color: '#ED5F00' },
  pink: { background: '#ffe4e6', color: '#be123c' },
  purple: { background: '#ede9fe', color: '#6d28d9' },
  red: { background: '#fee2e2', color: '#b91c1c' },
  teal: { background: '#ccfbf1', color: '#0f766e' },
};

const TAG: Record<string, TonePair> = {
  amber: { background: '#FEF2A4', color: '#35290F' },
  blue: { background: '#d9e2fc', color: '#3a5ccc' },
  gray: { background: '#fafafa', color: '#666666' },
  green: { background: '#ccebd7', color: '#299764' },
  orange: { background: '#ffdcc3', color: '#ed5f00' },
  pink: { background: '#fcdced', color: '#d6409f' },
  purple: { background: '#eddbf9', color: '#8347b9' },
  red: { background: '#fdd8d8', color: '#dc3d43' },
  teal: { background: '#c7ebe5', color: '#0E9888' },
};

function hexToRgbTuple(hex: string): string {
  const clean = hex.replace('#', '');
  const expanded =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean;
  const value = Number.parseInt(expanded, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].join(', ');
}

const KANBAN_LANE: Record<string, TonePair> = {
  blue: { background: '#def4ff', color: '#007bb8' },
  gray: { background: '#f3f1ef', color: '#666666' },
  green: { background: '#dcf7ed', color: '#1a7f50' },
  pink: { background: '#fce5f3', color: '#d6409f' },
  purple: { background: '#ede9fe', color: '#8e4ec6' },
};

// The product hero's Ask-AI panel inks (authored chrome washes + the
// Claude brand mark).
const PRODUCT_VISUAL = {
  userMessageBackground: '#f1f1f1',
  entityChipBackground: 'rgba(0, 0, 0, 0.04)',
  inputBoxBackground: 'rgba(0, 0, 0, 0.02)',
  cursorLabelInk: '#1f1f1f',
  heroCursorInks: {
    alice: '#ffb08d',
    ben: '#8db4ff',
    cara: '#9ee7c5',
  },
};

// The record page's file-chip ink for spreadsheets (authored; documents
// reuse the product accent).
const RECORD_FILE_SHEET_INK = '#12a594';

// The lift shadow under a scenario-highlighted note card (authored).
const RECORD_NOTE_HIGHLIGHT_SHADOW = '0 4px 14px rgba(0, 0, 0, 0.06)';

// The named-workflow avatar ink (authored data color).
const WORKFLOW_AVATAR_INK = '#451E11';

// The workflow canvas inks (authored artwork colors).
const WORKFLOW_CANVAS = {
  activeBadgeBackground: '#dff3e6',
  activeBadgeText: '#228b52',
  arrowStroke: '#d8d2cb',
  triggerIcon: '#4A67F6',
  actionIcon: '#FF6B5F',
};

// The dashboard chart inks (authored artwork colors; the donut slice
// palette is shared with the data module).
const DASHBOARD_CHART = {
  accent: '#8da4ef',
  trendUp: '#53b9ab',
  trendDown: '#eb8e90',
  slicePurple: '#be93e4',
  sliceOrange: '#ec9455',
};

// The AI terminal's authored chrome (a Cursor-class agent window: warm
// paper surface, zinc text alphas, green workspace chips, brand-blue send).
const TERMINAL = {
  surface: {
    window: '#fefefd',
    windowBorder: 'rgba(0, 0, 0, 0.04)',
    topBarBorder: 'rgba(0, 0, 0, 0.06)',
    promptBoxBackground: 'rgba(0, 0, 0, 0.02)',
    promptBoxBackgroundHover: 'rgba(0, 0, 0, 0.03)',
    promptBoxBorder: 'rgba(0, 0, 0, 0.08)',
    promptBoxBorderFocus: 'rgba(0, 0, 0, 0.18)',
    chipBackground: '#eef4f1',
    chipBorder: '#d3dfd9',
    chipHoverBackground: '#e3ede7',
    ghostHoverBackground: 'rgba(0, 0, 0, 0.04)',
    bubble: 'rgba(0, 0, 0, 0.055)',
    inlineCode: 'rgba(0, 0, 0, 0.045)',
    card: '#f5f5f5',
    cardHeader: '#fafafa',
    cardBorder: 'rgba(0, 0, 0, 0.08)',
    cardRowBorder: 'rgba(0, 0, 0, 0.04)',
    cardListBorder: 'rgba(0, 0, 0, 0.06)',
    cardSeeMoreBorder: 'rgba(0, 0, 0, 0.05)',
    cardRowHover: 'rgba(0, 0, 0, 0.02)',
    cardShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    undoHoverBackground: 'rgba(0, 0, 0, 0.04)',
    scrollbarThumb: 'rgba(0, 0, 0, 0.1)',
    resizeAffordance: 'rgba(0, 0, 0, 0.18)',
  },
  text: {
    primary: 'rgba(9, 9, 11, 0.92)',
    secondary: 'rgba(9, 9, 11, 0.55)',
    prompt: 'rgba(0, 0, 0, 0.8)',
    muted: 'rgba(0, 0, 0, 0.56)',
    mutedHover: 'rgba(0, 0, 0, 0.78)',
    chip: '#2f7468',
    inlineCode: 'rgba(0, 0, 0, 0.78)',
    fileLink: '#2a66de',
    fileLinkHover: '#1e4ea8',
    thinkingDot: 'rgba(0, 0, 0, 0.45)',
    diffAdded: '#2f7d52',
    diffRemoved: '#a94a4f',
    diffZero: 'rgba(0, 0, 0, 0.35)',
    cardTitle: 'rgba(0, 0, 0, 0.72)',
    undo: 'rgba(0, 0, 0, 0.55)',
    undoHover: 'rgba(0, 0, 0, 0.8)',
    seeMore: 'rgba(0, 0, 0, 0.48)',
    seeMoreHover: 'rgba(0, 0, 0, 0.72)',
    filePath: 'rgba(0, 0, 0, 0.78)',
    fileChevron: 'rgba(0, 0, 0, 0.3)',
  },
  toggle: {
    background: 'rgba(9, 9, 11, 0.04)',
    border: 'rgba(9, 9, 11, 0.06)',
    activeSegmentBackground: '#ffffff',
    activeSegmentBorder: 'rgba(9, 9, 11, 0.06)',
    inactiveSegmentHoverBackground: 'rgba(9, 9, 11, 0.04)',
    activeSegmentShadow:
      '0 0 1px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  // The light diff panel (GitHub-style inks, distinct from the card's
  // diff counters).
  diff: {
    background: 'rgba(0, 0, 0, 0.02)',
    panelBorder: 'rgba(0, 0, 0, 0.08)',
    fileHeaderBorder: 'rgba(0, 0, 0, 0.04)',
    filePath: 'rgba(0, 0, 0, 0.68)',
    added: '#377e5d',
    removed: '#a94a4f',
    rowAdded: '#eaf4ed',
    rowRemoved: '#faeceb',
    barAdded: '#82be9c',
    barRemoved: '#d2989b',
    lineNumber: 'rgba(0, 0, 0, 0.32)',
    lineText: 'rgba(0, 0, 0, 0.8)',
    unmodifiedChipBackground: 'rgba(0, 0, 0, 0.04)',
    unmodifiedChipBorder: 'rgba(0, 0, 0, 0.04)',
    unmodifiedChipText: 'rgba(0, 0, 0, 0.55)',
    syntaxKeyword: '#8250df',
    syntaxType: '#953800',
    syntaxString: '#0a3069',
    syntaxIdentifier: '#0550ae',
  },
  accent: {
    brand: '#1961ed',
    brandHover: '#1550c5',
    reset: '#5a5a5a',
    resetHover: '#4c4c4c',
    onAccent: '#ffffff',
    sendShadow: '0 0 0 1px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.12)',
  },
};

// The dark code-editor chrome (the terminal's second face), ported
// verbatim from the old EDITOR_TOKENS.
const EDITOR = {
  surface: {
    topBar: '#111216',
    topBarBorder: 'rgba(255, 255, 255, 0.08)',
    body: '#111216',
    sidebar: '#0b0b0d',
    sidebarBorder: 'rgba(255, 255, 255, 0.06)',
    explorerHeaderBorder: 'rgba(255, 255, 255, 0.05)',
    tabBar: '#141416',
    tabBarBorder: 'rgba(255, 255, 255, 0.06)',
    activeTab: '#111216',
    activeTabAccent: '#598ffa',
    activeRow: 'rgba(36, 87, 161, 0.28)',
    tabHover: 'rgba(255, 255, 255, 0.03)',
    rowHover: 'rgba(255, 255, 255, 0.04)',
    scrollbarThumb: 'rgba(255, 255, 255, 0.12)',
    explorerScrollbarThumb: 'rgba(255, 255, 255, 0.06)',
    toggleBackground: '#1e1f24',
    toggleBorder: 'rgba(255, 255, 255, 0.08)',
    activeSegmentBackground: '#2b2d35',
    activeSegmentBorder: 'rgba(255, 255, 255, 0.08)',
    activeSegmentShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.28)',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.96)',
    active: '#ebebf0',
    secondary: 'rgba(255, 255, 255, 0.82)',
    muted: 'rgba(255, 255, 255, 0.7)',
    dim: 'rgba(255, 255, 255, 0.6)',
    explorerLabel: 'rgba(255, 255, 255, 0.45)',
    caret: 'rgba(255, 255, 255, 0.4)',
    tabAccent: '#598ffa',
    gutter: '#45454d',
    code: '#bec2c9',
  },
  syntax: {
    keyword: '#c397f5',
    function: '#82aaff',
    string: '#a5d6a7',
    property: '#f07178',
    identifier: '#f5c78a',
    comment: 'rgba(255, 255, 255, 0.42)',
  },
  fileIcon: {
    ts: 'rgba(59, 140, 245, 0.85)',
    md: 'rgba(110, 186, 245, 0.85)',
    js: 'rgba(237, 184, 79, 0.85)',
    git: 'rgba(229, 115, 77, 0.85)',
    yaml: 'rgba(217, 122, 107, 0.85)',
    cf: 'rgba(140, 140, 153, 0.85)',
    lock: 'rgba(140, 140, 153, 0.85)',
  },
};

export const APP_PREVIEW_TONES = {
  terminal: TERMINAL,
  editor: EDITOR,
  dashboardChart: DASHBOARD_CHART,
  workflowCanvas: WORKFLOW_CANVAS,
  workflowAvatarInk: WORKFLOW_AVATAR_INK,
  kanbanLane: KANBAN_LANE,
  productVisual: PRODUCT_VISUAL,
  recordFileSheetInk: RECORD_FILE_SHEET_INK,
  recordNoteHighlightShadow: RECORD_NOTE_HIGHLIGHT_SHADOW,
  sidebar: SIDEBAR,
  person: PERSON,
  tag: TAG,
  // The reveal pulse reads the tone as an `r, g, b` tuple string.
  sidebarToneRgb: (tone: string): string =>
    hexToRgbTuple((SIDEBAR[tone] ?? SIDEBAR.gray).color),
};
