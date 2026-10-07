import { type ButtonProps } from '../src/primitives/input/Button/types/ButtonProps';

export const BUTTON_PROP_DESCRIPTIONS = {
  variant:
    'Visual treatment of the button surface. `link` uses compact text styling without a filled surface or border; `href` still determines link semantics.',
  color: 'Semantic color of the button.',
  size: 'Button height: `sm` (24px) or `md` (32px). The `link` variant uses its content height at either size.',
  fullWidth: 'Expands the button to fill its container width.',
  loading: 'Shows a loading indicator and disables activation.',
  loadingPosition:
    'Where the loading indicator appears. `center` hides the content while preserving its layout space; `start` and `end` keep children and the opposite icon visible and replace the corresponding icon with the spinner.',
  elevated:
    'Adds a shadow and backdrop blur. Neutral outline buttons also use elevated surface colors.',
  startIcon: 'Decorative content displayed before the label.',
  endIcon: 'Decorative content displayed after the label.',
  shortcutJoinLabel: 'Localized text between sequence steps. Defaults to then.',
  shortcut:
    'Flat key array for simultaneous keys, or nested key arrays for an ordered sequence. Displayed on non-mobile screens.',
  href: 'Destination URL. Enables native link semantics instead of button semantics.',
  render:
    'Caller-supplied root element or renderer. Preserve a native button, or an anchor when `href` is set. Router integration belongs to the caller.',
} satisfies Partial<Record<keyof ButtonProps, string>>;
