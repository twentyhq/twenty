// The mockup's tone tables (single module). The product-color groups derive
// straight from twenty-ui: TAG (tag color3/11), SIDEBAR (TintedIconTile
// color5/6/11), DASHBOARD_CHART (graph color8), WORKFLOW_CANVAS (blue/red
// trigger+action, turquoise tag), RECORD_FILE_SHEET_INK (turquoise).
// Still authored (no product equivalent): TERMINAL + EDITOR (the bespoke AI
// window), the PRODUCT_VISUAL cursor inks, RECORD_NOTE_HIGHLIGHT_SHADOW, and
// WORKFLOW_AVATAR_INK (product uses gray for workflow avatars — drift to
// resolve on the workflow page).
import { THEME_LIGHT } from 'twenty-ui/theme';

type ToneSurface = { background: string; border: string; color: string };
type TonePair = { background: string; color: string };

// Our tone names map 1:1 onto twenty-ui's tag colors, except `teal` is the
// product's `turquoise`.
const tagTone = (name: keyof typeof THEME_LIGHT.tag.text): TonePair => ({
  background: THEME_LIGHT.tag.background[name],
  color: THEME_LIGHT.tag.text[name],
});

// Object nav items render as the product's TintedIconTile: color5 surface,
// color6 border, color11 icon. (Our `teal` is the product's `turquoise`.)
const sidebarTone = (
  name:
    | 'amber'
    | 'blue'
    | 'gray'
    | 'green'
    | 'orange'
    | 'pink'
    | 'purple'
    | 'red'
    | 'turquoise'
    | 'violet',
): ToneSurface => ({
  background: THEME_LIGHT.color[`${name}5`],
  border: THEME_LIGHT.color[`${name}6`],
  color: THEME_LIGHT.color[`${name}11`],
});

const SIDEBAR: Record<string, ToneSurface> = {
  amber: sidebarTone('amber'),
  blue: sidebarTone('blue'),
  gray: sidebarTone('gray'),
  green: sidebarTone('green'),
  orange: sidebarTone('orange'),
  pink: sidebarTone('pink'),
  purple: sidebarTone('purple'),
  red: sidebarTone('red'),
  teal: sidebarTone('turquoise'),
  violet: sidebarTone('violet'),
};

const TAG: Record<string, TonePair> = {
  amber: tagTone('amber'),
  blue: tagTone('blue'),
  gray: tagTone('gray'),
  green: tagTone('green'),
  orange: tagTone('orange'),
  pink: tagTone('pink'),
  purple: tagTone('purple'),
  red: tagTone('red'),
  teal: tagTone('turquoise'),
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

// The product's spreadsheet file-icon color (useFileIconColors); documents
// reuse the accent.
const RECORD_FILE_SHEET_INK = THEME_LIGHT.color.turquoise;

// The lift shadow under a scenario-highlighted note card (authored).
const RECORD_NOTE_HIGHLIGHT_SHADOW = '0 4px 14px rgba(0, 0, 0, 0.06)';

// The named-workflow avatar ink (authored data color).
const WORKFLOW_AVATAR_INK = '#451E11';

// The product's workflow-node colors: blue trigger, red action, a turquoise
// "completed" tag, and the neutral medium border for edges.
const WORKFLOW_CANVAS = {
  activeBadgeBackground: THEME_LIGHT.tag.background.turquoise,
  activeBadgeText: THEME_LIGHT.tag.text.turquoise,
  arrowStroke: THEME_LIGHT.border.color.medium,
  triggerIcon: THEME_LIGHT.color.blue,
  actionIcon: THEME_LIGHT.color.red,
};

// twenty-front's graph-color registry assigns chart series from the color8
// shade; trend arrows use the turquoise8/red8 success/danger pair.
const DASHBOARD_CHART = {
  accent: THEME_LIGHT.color.blue8,
  trendUp: THEME_LIGHT.color.turquoise8,
  trendDown: THEME_LIGHT.color.red8,
  slicePurple: THEME_LIGHT.color.purple8,
  sliceOrange: THEME_LIGHT.color.orange8,
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
  productVisual: PRODUCT_VISUAL,
  recordFileSheetInk: RECORD_FILE_SHEET_INK,
  recordNoteHighlightShadow: RECORD_NOTE_HIGHLIGHT_SHADOW,
  sidebar: SIDEBAR,
  tag: TAG,
  // The reveal pulse reads the tone as an `r, g, b` tuple string.
  sidebarToneRgb: (tone: string): string =>
    hexToRgbTuple((SIDEBAR[tone] ?? SIDEBAR.gray).color),
};
