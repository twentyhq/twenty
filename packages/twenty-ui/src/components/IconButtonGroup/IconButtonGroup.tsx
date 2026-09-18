import { clsx } from 'clsx';
import { type IconButtonGroupProps } from './types/IconButtonGroupProps';

import { InsideButton } from '@ui/components/IconButtonGroup/internal/InsideButton/InsideButton';

import styles from './IconButtonGroup.module.scss';

export const IconButtonGroup = ({
  iconButtons,
  disabled,
  className,
}: IconButtonGroupProps) => {
  return (
    <div
      className={clsx(styles.container, className)}
      data-disabled={disabled || undefined}
    >
      {iconButtons.map(({ Icon, onClick, ariaLabel }, index) => {
        return (
          <InsideButton
            key={index}
            Icon={Icon}
            ariaLabel={ariaLabel}
            onClick={onClick}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};
