import { clsx } from 'clsx';
import { type FloatingIconButtonGroupProps } from './types/FloatingIconButtonGroupProps';

import { FloatingIconButton } from '@ui/components/FloatingIconButton/FloatingIconButton';
import { type FloatingIconButtonPosition } from '@ui/components/FloatingIconButton/types/FloatingIconButtonPosition';

import styles from './FloatingIconButtonGroup.module.scss';

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
