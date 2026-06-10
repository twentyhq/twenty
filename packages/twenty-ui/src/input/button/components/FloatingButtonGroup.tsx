import { clsx } from 'clsx';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  type FloatingButtonPosition,
  type FloatingButtonProps,
} from './FloatingButton';

import styles from './FloatingButtonGroup.module.scss';

export type FloatingButtonGroupProps = Pick<FloatingButtonProps, 'size'> & {
  children: React.ReactElement[];
  className?: string;
};

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
