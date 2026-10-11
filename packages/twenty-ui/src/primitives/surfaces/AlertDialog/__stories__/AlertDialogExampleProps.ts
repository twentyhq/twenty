import { type ReactNode } from 'react';

import { type AlertDialogPopupProps } from '../types/AlertDialogPopupProps';
import { type AlertDialogPortalProps } from '../types/AlertDialogPortalProps';
import { type AlertDialogRootProps } from '../types/AlertDialogRootProps';

export type AlertDialogExampleProps = AlertDialogRootProps & {
  size?: AlertDialogPopupProps['size'];
  popupProps?: AlertDialogPopupProps;
  portalProps?: AlertDialogPortalProps;
  disabled?: boolean;
  content?: ReactNode;
};
