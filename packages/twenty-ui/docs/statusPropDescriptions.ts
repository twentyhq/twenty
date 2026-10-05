import { type StatusProps } from '../src/primitives/data-display/Status/types/StatusProps';

export const STATUS_PROP_DESCRIPTIONS = {
  color: 'Theme color used for the status background, text, and loader.',
  weight: 'Font weight of the label.',
  disabled:
    'Applies disabled styling and disables activation when `onClick` is supplied.',
  loading:
    'Shows a loader after the label. Does not disable the control or announce a status change by itself.',
  onClick:
    'Handles activation and renders a native button by default. Without it, the default element is a span.',
  nativeButton:
    'Set to `false` when using `render` with an element other than a native button.',
  render:
    'Replaces the default element. Required when `nativeButton` is `false`.',
} satisfies Partial<Record<keyof StatusProps, string>>;
