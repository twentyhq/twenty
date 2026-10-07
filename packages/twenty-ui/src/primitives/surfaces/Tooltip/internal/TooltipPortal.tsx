import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { useThemeContainer } from '@ui/theme';

import { type TooltipPortalProps } from '../types/TooltipPortalProps';

export const TooltipPortal = ({ container, ...props }: TooltipPortalProps) => {
  const themeContainer = useThemeContainer();

  return (
    <TooltipPrimitive.Portal
      {...props}
      container={container ?? themeContainer ?? undefined}
    />
  );
};
