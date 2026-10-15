import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Autocomplete.module.scss';
import { type AutocompletePositionerProps } from '../types/AutocompletePositionerProps';

export const AutocompletePositioner = ({
  className,
  positionMethod = 'fixed',
  align = 'start',
  sideOffset = 8,
  ...props
}: AutocompletePositionerProps) => {
  const direction = useProvidedTextDirection();

  return (
    <AutocompletePrimitive.Positioner
      dir={direction}
      positionMethod={positionMethod}
      align={align}
      sideOffset={sideOffset}
      {...props}
      className={mergeClassNames(styles.positioner, className)}
    />
  );
};
