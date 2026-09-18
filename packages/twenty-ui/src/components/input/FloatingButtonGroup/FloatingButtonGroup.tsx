import { isDefined } from '@ui/utilities/utils/isDefined';
import { clsx } from 'clsx';
import React from 'react';
import { type FloatingButtonGroupProps } from './types/FloatingButtonGroupProps';

import { type FloatingButtonPosition } from '@ui/components/input/FloatingButton/types/FloatingButtonPosition';

import styles from './FloatingButtonGroup.module.scss';

export const FloatingButtonGroup = ({
  children,
  size,
  className,
}: FloatingButtonGroupProps) => {
  return (
    <div className={clsx(styles.container, className)}>
      {React.Children.map(children, (child, index) => {
        let position: FloatingButtonPosition;

        if (index === 0) {
          position = 'left';
        } else if (index === children.length - 1) {
          position = 'right';
        } else {
          position = 'middle';
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const additionalProps: any = {
          position,
          size,
          applyShadow: false,
          applyBlur: false,
        };

        if (isDefined(size)) {
          additionalProps.size = size;
        }

        return React.cloneElement(child, additionalProps);
      })}
    </div>
  );
};
