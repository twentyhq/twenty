import { clsx } from 'clsx';
import { type MouseEvent } from 'react';

import { type IconComponent } from '@ui/display';

import {
  FloatingIconButton,
  type FloatingIconButtonPosition,
  type FloatingIconButtonProps,
} from './FloatingIconButton';

import styles from './FloatingIconButtonGroup.module.scss';

export type FloatingIconButtonGroupProps = Pick<
  FloatingIconButtonProps,
  'className' | 'size'
> & {
  iconButtons: {
    Icon: IconComponent;
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
      {iconButtons.map(({ Icon, onClick, isActive }, index) => {
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
