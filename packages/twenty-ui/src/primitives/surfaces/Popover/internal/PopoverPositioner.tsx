import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Popover.module.scss';
import { type PopoverPositionerProps } from '../types/PopoverPositionerProps';

export const PopoverPositioner = ({
  className,
  positionMethod = 'fixed',
  sideOffset = 8,
  ...props
}: PopoverPositionerProps) => {
  const direction = useProvidedTextDirection();

  return (
    <PopoverPrimitive.Positioner
      dir={direction}
      positionMethod={positionMethod}
      sideOffset={sideOffset}
      {...props}
      className={mergeClassNames(styles.positioner, className)}
    />
  );
};
