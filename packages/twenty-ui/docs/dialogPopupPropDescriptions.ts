import { type DialogPopupProps } from '../src/primitives/surfaces/Dialog/types/DialogPopupProps';

export const DIALOG_POPUP_PROP_DESCRIPTIONS = {
  size: 'Width of the dialog, or `fullscreen` to fill the viewport.',
  children:
    'Dialog content. Compose inside Viewport and Portal; Popup does not create those parts or a Backdrop.',
  ref: 'Ref to the popup div, or the element supplied through render.',
  render:
    'Composes the popup element while retaining native props, handlers, dialog semantics and focus behavior.',
  initialFocus:
    'Controls focus on opening. Accepts a boolean, element ref or callback receiving the interaction type.',
  finalFocus:
    'Controls focus restoration on closing. Accepts a boolean, element ref or callback receiving the interaction type.',
} satisfies Partial<Record<keyof DialogPopupProps, string>>;
