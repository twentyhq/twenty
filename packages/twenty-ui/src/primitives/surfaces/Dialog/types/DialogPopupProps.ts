import { type Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { type DialogSize } from './DialogSize';

export type DialogPopupProps = DialogPrimitive.Popup.Props & {
  size?: DialogSize;
};
