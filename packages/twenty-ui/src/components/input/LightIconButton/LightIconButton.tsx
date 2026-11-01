import { useContext } from 'react';

import { IconButton } from '@ui/components/input/IconButton/IconButton';
import { ButtonGroupContext } from '@ui/primitives/input/ButtonGroup/internal/ButtonGroupContext';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './LightIconButton.module.scss';
import { type LightIconButtonProps } from './types/LightIconButtonProps';

export const LightIconButton = ({
  className,
  emphasis = 'standard',
  size,
  variant,
  ...props
}: LightIconButtonProps) => {
  const buttonGroup = useContext(ButtonGroupContext);
  const resolvedSize = size ?? buttonGroup?.size ?? 'sm';
  const resolvedVariant = variant ?? buttonGroup?.variant ?? 'ghost';

  return (
    <IconButton
      {...props}
      size={resolvedSize}
      variant={resolvedVariant}
      data-emphasis={emphasis}
      className={mergeClassNames(styles.button, className)}
    />
  );
};
