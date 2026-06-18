import { clsx } from 'clsx';
import { type MouseEvent } from 'react';

import { type IconComponent } from '@ui/icon';

import {
  FloatingIconButton,
  type FloatingIconButtonPosition,
  type FloatingIconButtonProps,
} from '@ui/input/FloatingIconButton/FloatingIconButton';

import styles from './FloatingIconButtonGroup.module.scss';

export type FloatingIconButtonGroupProps = Pick<
  FloatingIconButtonProps,
  'className' | 'size'
> & {
  iconButtons: {
    Icon: IconComponent;
    ariaLabel?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick?: (event: MouseEvent<any>) => void;
    isActive?: boolean;
  }[];
};

export const FloatingIconButtonGroup = ({
  iconButtons,
  size,
  className,
}: FloatingIconButtonGroupProps) => {
  return (
    <div className={clsx(styles.container, className)}>
      {iconButtons.map(({ Icon, onClick, isActive, ariaLabel }, index) => {
        const position: FloatingIconButtonPosition =
          iconButtons.length === 1
            ? 'standalone'
            : index === 0
              ? 'left'
              : index === iconButtons.length - 1
                ? 'right'
                : 'middle';

        return (
          <FloatingIconButton
            key={`floating-icon-button-${index}`}
            applyBlur={false}
            applyShadow={false}
            Icon={Icon}
            ariaLabel={ariaLabel}
            onClick={onClick}
            position={position}
            size={size}
            isActive={isActive}
          />
        );
      })}
    </div>
  );
};
