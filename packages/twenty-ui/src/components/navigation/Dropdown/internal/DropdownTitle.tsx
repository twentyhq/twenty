import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Dropdown.module.scss';
import { type DropdownTitleProps } from '../types/DropdownTitleProps';

export const DropdownTitle = ({
  className,
  render,
  ...props
}: DropdownTitleProps) => (
  <PopoverPrimitive.Title
    {...props}
    render={render ?? <div />}
    className={mergeClassNames(styles.title, className)}
  />
);
