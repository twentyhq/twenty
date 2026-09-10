import { Select as SelectPrimitive } from '@base-ui/react/select';
import { clsx } from 'clsx';

import { IconCheck } from '@ui/icon';
import { isRenderableSlot } from '@ui/navigation/ListItem/internal/isRenderableSlot';
import listItemStyles from '@ui/navigation/ListItem/ListItem.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Select.module.scss';
import { type SelectItemProps } from '../types/SelectItemProps';

export const SelectItem = ({
  className,
  children,
  startIcon,
  endIcon,
  description,
  descriptionPlacement = 'inline',
  ...props
}: SelectItemProps) => (
  <SelectPrimitive.Item
    {...props}
    className={mergeClassNames(
      clsx(listItemStyles.root, styles.item),
      className,
    )}
    data-color="neutral"
    data-indicator="check"
  >
    {isRenderableSlot(startIcon) && (
      <div className={listItemStyles.startIcon} aria-hidden>
        {startIcon}
      </div>
    )}
    <div className={listItemStyles.label}>
      <SelectPrimitive.ItemText className={listItemStyles.text}>
        {children}
      </SelectPrimitive.ItemText>
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
    <SelectPrimitive.ItemIndicator className={styles.indicator}>
      <IconCheck className={listItemStyles.checkIndicator} />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
);
