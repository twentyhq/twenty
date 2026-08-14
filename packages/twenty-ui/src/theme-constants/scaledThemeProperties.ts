// Every token that multiplies by --t-scale in the theme CSS. Registering them
// makes getComputedStyle return computed values ("8.8px", "17.6") instead of
// the raw calc() text, which is what lets ThemeProvider keep resolving numeric
// tokens with Number(). CSS consumers do not need the registration — var()
// substitution into a real property evaluates calc either way.
//
// The scaledTokensStayRegistered test pins this list against the theme CSS,
// so a token cannot gain a calc() without being registered here.

const SCALED_LENGTH_TOKENS = [
  ...Array.from({ length: 33 }, (_, index) => `--t-spacing-${index}`),
  '--t-spacing-0_5',
  '--t-spacing-1_5',
  '--t-border-radius-xs',
  '--t-border-radius-sm',
  '--t-border-radius-md',
  '--t-border-radius-lg',
  '--t-border-radius-xl',
  '--t-border-radius-xxl',
  '--t-border-radius-sm-round',
  '--t-border-radius-md-round',
  '--t-modal-size-sm-width',
  '--t-modal-size-md-width',
  '--t-modal-size-xl-width',
  '--t-modal-size-xl-height',
  '--t-between-siblings-gap',
  '--t-table-horizontal-cell-margin',
  '--t-table-checkbox-column-width',
  '--t-table-horizontal-cell-padding',
  '--t-side-panel-width',
];

const SCALED_NUMBER_TOKENS = [
  '--t-spacing-multiplicator',
  '--t-icon-size-sm',
  '--t-icon-size-md',
  '--t-icon-size-lg',
  '--t-icon-size-xl',
  '--t-text-icon-size-medium',
  '--t-text-icon-size-small',
];

const SCALE_FACTOR_TOKENS = ['--t-scale-user', '--t-scale-base', '--t-scale'];

export const SCALED_THEME_PROPERTIES = [
  ...SCALE_FACTOR_TOKENS.map((name) => ({
    name,
    syntax: '<number>',
    initialValue: '1',
  })),
  ...SCALED_NUMBER_TOKENS.map((name) => ({
    name,
    syntax: '<number>',
    initialValue: '0',
  })),
  ...SCALED_LENGTH_TOKENS.map((name) => ({
    name,
    syntax: '<length>',
    initialValue: '0px',
  })),
];

let scaledThemePropertiesRegistered = false;

export const registerScaledThemeProperties = () => {
  if (scaledThemePropertiesRegistered) {
    return;
  }

  if (
    typeof CSS === 'undefined' ||
    typeof CSS.registerProperty !== 'function'
  ) {
    return;
  }

  scaledThemePropertiesRegistered = true;

  for (const property of SCALED_THEME_PROPERTIES) {
    try {
      CSS.registerProperty({ ...property, inherits: true });
    } catch {
      // Re-registration throws (hot reload, storybook remounts); the first
      // registration is the one that counts.
    }
  }
};
