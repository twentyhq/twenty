import { type DialogPopupProps } from '../src/primitives/surfaces/Dialog/types/DialogPopupProps';

export const DIALOG_PROP_DESCRIPTIONS = {
  size: 'Width of the dialog, or `fullscreen` to fill the viewport.',
  container:
    'Portal destination. Defaults to the theme container; `null` defers mounting.',
  keepMounted: 'Keeps content mounted while the dialog is closed.',
  backdrop:
    'Show the backdrop, customize its native props, or pass `false` to hide it.',
  viewportProps:
    'Native props and render composition for the viewport surrounding the popup.',
} satisfies Partial<Record<keyof DialogPopupProps, string>>;
