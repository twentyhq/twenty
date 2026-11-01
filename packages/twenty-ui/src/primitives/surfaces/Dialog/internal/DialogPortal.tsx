import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { isUndefined } from '@sniptt/guards';

import { useThemeContainer } from '@ui/theme';

import { type DialogPortalProps } from '../types/DialogPortalProps';

export const DialogPortal = ({ container, ...props }: DialogPortalProps) => {
  const themeContainer = useThemeContainer();

  return (
    <DialogPrimitive.Portal
      {...props}
      container={
        isUndefined(container) ? (themeContainer ?? undefined) : container
      }
    />
  );
};
