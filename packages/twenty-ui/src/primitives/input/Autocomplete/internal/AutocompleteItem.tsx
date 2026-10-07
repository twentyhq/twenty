import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';
import { clsx } from 'clsx';

import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import listItemStyles from '@ui/primitives/navigation/ListItem/ListItem.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import { type AutocompleteItemProps } from '../types/AutocompleteItemProps';

export const AutocompleteItem = ({
  className,
  children,
  startIcon,
  endIcon,
  description,
  descriptionPlacement = 'inline',
  ...props
}: AutocompleteItemProps) => (
  <AutocompletePrimitive.Item
    {...props}
    className={mergeClassNames(listItemStyles.root, className)}
    data-color="neutral"
  >
    {isRenderableSlot(startIcon) && (
      <div className={listItemStyles.startIcon} aria-hidden>
        {startIcon}
      </div>
    )}
    <div className={listItemStyles.label}>
      <div className={listItemStyles.text}>{children}</div>
      {isRenderableSlot(description) && descriptionPlacement === 'inline' && (
        <div
          className={clsx(
            listItemStyles.description,
            listItemStyles.inlineDescription,
          )}
        >
          {description}
        </div>
      )}
    </div>
    {isRenderableSlot(description) && descriptionPlacement === 'end' && (
      <div
        className={clsx(
          listItemStyles.description,
          listItemStyles.endDescription,
        )}
      >
        {description}
      </div>
    )}
    {isRenderableSlot(endIcon) && (
      <div className={listItemStyles.endIcon} aria-hidden>
        {endIcon}
      </div>
    )}
  </AutocompletePrimitive.Item>
);
