import { clsx } from 'clsx';

import { IconChevronLeft } from '@ui/icon';

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
  const { goBack, canGoBack } = useDropdownContext();

  return (
    <DropdownActionItem
      {...props}
      className={clsx(styles.back, className)}
      data-dropdown-back=""
      disabled={props.disabled || !canGoBack}
      startIcon={<IconChevronLeft />}
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
