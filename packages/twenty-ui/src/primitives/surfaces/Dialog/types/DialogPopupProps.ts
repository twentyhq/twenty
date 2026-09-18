import { type Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { type DialogSize } from './DialogSize';

export type DialogPopupProps = DialogPrimitive.Popup.Props & {
  size?: DialogSize;
  container?: DialogPrimitive.Portal.Props['container'];
  keepMounted?: boolean;
  backdrop?: boolean | DialogPrimitive.Backdrop.Props;
  viewportProps?: DialogPrimitive.Viewport.Props;
};
