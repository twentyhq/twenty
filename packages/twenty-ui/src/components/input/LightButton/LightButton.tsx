import { useContext } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { ButtonGroupContext } from '@ui/primitives/input/ButtonGroup/internal/ButtonGroupContext';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './LightButton.module.scss';
import { type LightButtonProps } from './types/LightButtonProps';

export const LightButton = ({
  className,
  emphasis = 'standard',
  size,
  variant,
  ...props
}: LightButtonProps) => {
  const buttonGroup = useContext(ButtonGroupContext);
  const resolvedSize = size ?? buttonGroup?.size ?? 'sm';
  const resolvedVariant = variant ?? buttonGroup?.variant ?? 'ghost';

  return (
    <Button
      {...props}
      size={resolvedSize}
      variant={resolvedVariant}
      data-emphasis={emphasis}
      className={mergeClassNames(styles.button, className)}
    />
  );
};
