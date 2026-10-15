import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Tooltip.module.scss';
import { type TooltipPositionerProps } from '../types/TooltipPositionerProps';

export const TooltipPositioner = ({
  className,
  positionMethod = 'fixed',
  ...props
}: TooltipPositionerProps) => {
  const direction = useProvidedTextDirection();

  return (
    <TooltipPrimitive.Positioner
      dir={direction}
      positionMethod={positionMethod}
      {...props}
      className={mergeClassNames(styles.positioner, className)}
    />
  );
};
