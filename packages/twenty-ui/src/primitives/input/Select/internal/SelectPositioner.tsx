import { Select as SelectPrimitive } from '@base-ui/react/select';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Select.module.scss';
import { type SelectPositionerProps } from '../types/SelectPositionerProps';

export const SelectPositioner = ({
  className,
  positionMethod = 'fixed',
  ...props
}: SelectPositionerProps) => {
  const direction = useProvidedTextDirection();

  return (
    <SelectPrimitive.Positioner
      dir={direction}
      positionMethod={positionMethod}
      {...props}
      className={mergeClassNames(styles.positioner, className)}
    />
  );
};
