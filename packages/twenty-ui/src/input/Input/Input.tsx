import { Input as InputPrimitive } from '@base-ui/react/input';
import { clsx } from 'clsx';
import { useContext } from 'react';

import { InputGroupContext } from '@ui/input/InputGroup/internal/InputGroupContext';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Input.module.scss';
import { type InputProps } from './types/InputProps';

export const Input = ({ size, className, ...props }: InputProps) => {
  const inputGroup = useContext(InputGroupContext);
  const resolvedSize = size ?? inputGroup?.size ?? 'md';

  return (
    <InputPrimitive
      {...props}
      className={mergeClassNames(
        clsx(styles.input, styles[resolvedSize]),
        className,
      )}
      data-grouped={isDefined(inputGroup) || undefined}
    />
  );
};
