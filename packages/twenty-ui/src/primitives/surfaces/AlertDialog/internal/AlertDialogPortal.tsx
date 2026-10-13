import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { useThemeContainer } from '@ui/theme/useThemeContainer';

import { type AlertDialogPortalProps } from '../types/AlertDialogPortalProps';

export const AlertDialogPortal = ({
  container,
  ...props
}: AlertDialogPortalProps) => {
  const themeContainer = useThemeContainer();
  const direction = useProvidedTextDirection();

  return (
    <AlertDialogPrimitive.Portal
      dir={direction}
      {...props}
      container={
        container === undefined ? (themeContainer ?? undefined) : container
      }
    />
  );
};
