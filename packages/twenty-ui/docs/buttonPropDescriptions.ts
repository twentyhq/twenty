import { type ButtonProps } from '../src/primitives/input/Button/types/ButtonProps';

export const BUTTON_PROP_DESCRIPTIONS = {
  variant:
    'Visual treatment of the button surface. `link` uses compact text styling without a filled surface or border; render composition determines native semantics.',
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
  href: 'Destination URL. Renders a native anchor when `render` is omitted unless `nativeButton` is explicitly true. Custom renderers retain their own element contract.',
  render:
    'Caller-supplied root element or renderer. Native attributes, handlers, event details, and refs reach the rendered root. Use `nativeButton={false}` and `role="link"` for a custom navigation anchor. Router integration belongs to the caller.',
  nativeButton:
    'Whether the rendered root is a native button. Defaults to true for custom renderers. The built-in `href` anchor defaults to false; an explicit value takes precedence.',
  role: 'Role of the root element. Use `link` for custom navigation renderers.',
} satisfies Partial<Record<keyof ButtonProps, string>>;
