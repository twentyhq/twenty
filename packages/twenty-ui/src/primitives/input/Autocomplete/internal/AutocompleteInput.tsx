import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';
import { clsx } from 'clsx';
import { useContext } from 'react';

import inputStyles from '@ui/primitives/input/Input/Input.module.scss';
import { InputGroupContext } from '@ui/primitives/input/InputGroup/internal/InputGroupContext';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type AutocompleteInputProps } from '../types/AutocompleteInputProps';

export const AutocompleteInput = ({
  size,
  className,
  ...props
}: AutocompleteInputProps) => {
  const inputGroup = useContext(InputGroupContext);
  const resolvedSize = size ?? inputGroup?.size ?? 'md';

  return (
    <AutocompletePrimitive.Input
      {...props}
      className={mergeClassNames(
        clsx(inputStyles.input, inputStyles[resolvedSize]),
        className,
      )}
      data-grouped={isDefined(inputGroup) || undefined}
    />
  );
};
