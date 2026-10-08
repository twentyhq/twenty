import { useContext } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';
import { ButtonGroupContext } from '@ui/primitives/input/ButtonGroup/internal/ButtonGroupContext';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './MainButton.module.scss';

export const MainButton = ({
  className,
  elevated = true,
  variant,
  ...props
}: ButtonProps) => {
  const buttonGroup = useContext(ButtonGroupContext);
  const resolvedVariant = variant ?? buttonGroup?.variant ?? 'solid';

  return (
    <Button
      {...props}
      elevated={elevated}
      variant={resolvedVariant}
      className={mergeClassNames(styles.button, className)}
    />
  );
};
