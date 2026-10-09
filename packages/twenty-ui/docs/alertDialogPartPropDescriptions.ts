import { type AlertDialogPopupProps } from '../src/primitives/surfaces/AlertDialog/types/AlertDialogPopupProps';
import { type AlertDialogPortalProps } from '../src/primitives/surfaces/AlertDialog/types/AlertDialogPortalProps';

export const ALERT_DIALOG_PART_PROP_DESCRIPTIONS = {
  Popup: {
    size: 'Width of the alert, or `fullscreen` to fill the viewport.',
  } satisfies Partial<Record<keyof AlertDialogPopupProps, string>>,
  Portal: {
    container:
      'Portal destination. Omission uses the theme container or Base UI default; explicit `null` defers mounting. A ref with a null current value uses the Base UI default destination.',
    keepMounted: 'Keeps content mounted while the alert is closed.',
  } satisfies Partial<Record<keyof AlertDialogPortalProps, string>>,
};
