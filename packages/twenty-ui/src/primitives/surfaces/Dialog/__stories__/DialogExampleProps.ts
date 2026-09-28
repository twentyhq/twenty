import { type ReactNode } from 'react';

import { type DialogPopupProps } from '../types/DialogPopupProps';
import { type DialogRootProps } from '../types/DialogRootProps';

export type DialogExampleProps = DialogRootProps & {
  size?: DialogPopupProps['size'];
  popupProps?: DialogPopupProps;
  disabled?: boolean;
  content?: ReactNode;
};
