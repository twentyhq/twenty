import { type ReactNode } from 'react';

import { type DialogPopupProps } from '../types/DialogPopupProps';
import { type DialogPortalProps } from '../types/DialogPortalProps';
import { type DialogRootProps } from '../types/DialogRootProps';

export type DialogExampleProps = DialogRootProps & {
  size?: DialogPopupProps['size'];
  portalProps?: DialogPortalProps;
  popupProps?: DialogPopupProps;
  backdrop?: boolean;
  disabled?: boolean;
  content?: ReactNode;
};
