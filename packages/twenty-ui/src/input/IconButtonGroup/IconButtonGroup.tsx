import { clsx } from 'clsx';
import { type MouseEvent } from 'react';

import { type IconComponent } from '@ui/icon';
import { InsideButton } from '@ui/input/InsideButton/InsideButton';

import styles from './IconButtonGroup.module.scss';

export type IconButtonGroupProps = {
  disabled?: boolean;
  iconButtons: {
    Icon: IconComponent;
    ariaLabel?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick?: (event: MouseEvent<any>) => void;
  }[];
  className?: string;
};

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
