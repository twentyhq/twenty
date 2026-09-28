import { useDirection } from '@base-ui/react/direction-provider';
import { clsx } from 'clsx';

import { IconChevronLeft, IconChevronRight } from '@ui/icon';

import styles from '../Dropdown.module.scss';
import { type DropdownActionItemProps } from '../types/DropdownActionItemProps';
import { DropdownActionItem } from './DropdownActionItem';
import { useDropdownContext } from './useDropdownContext';

export const DropdownBack = ({
  children = 'Back',
  className,
  onClick,
  ...props
}: Omit<DropdownActionItemProps, 'page' | 'closeOnClick'>) => {
  const direction = useDirection();
  const BackIcon = direction === 'rtl' ? IconChevronRight : IconChevronLeft;
  const { goBack, canGoBack } = useDropdownContext();

  return (
    <DropdownActionItem
      {...props}
      className={clsx(styles.back, className)}
      data-dropdown-back=""
      disabled={props.disabled || !canGoBack}
      startIcon={<BackIcon />}
      closeOnClick={false}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        goBack();
      }}
    >
      {children}
    </DropdownActionItem>
  );
};
