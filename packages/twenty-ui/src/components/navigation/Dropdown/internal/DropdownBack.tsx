import { clsx } from 'clsx';

import { IconChevronLeft } from '@ui/icon';

import styles from '../Dropdown.module.scss';
import { type DropdownActionItemProps } from '../types/DropdownActionItemProps';
import { DropdownActionItem } from './DropdownActionItem';
import { DropdownBackContext } from './DropdownBackContext';
import { useDropdownContext } from './useDropdownContext';

export const DropdownBack = ({
  children = 'Back',
  className,
  onClick,
  ...props
}: Omit<
  DropdownActionItemProps,
  'page' | 'closeOnClick' | 'actions' | 'actionsVisibility'
>) => {
  const { goBack, canGoBack } = useDropdownContext();

  return (
    <DropdownBackContext.Provider value>
      <DropdownActionItem
        {...props}
        className={clsx(styles.back, className)}
        disabled={props.disabled || !canGoBack}
        startIcon={<IconChevronLeft className={styles.backIcon} />}
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
    </DropdownBackContext.Provider>
  );
};
