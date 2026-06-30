import { clsx } from 'clsx';
import React, { type ReactNode } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ButtonPosition, type ButtonProps } from '@ui/input/Button/Button';

import styles from './ButtonGroup.module.scss';

export type ButtonGroupProps = Partial<
  Pick<ButtonProps, 'variant' | 'size' | 'accent'>
> & {
  className?: string;
  children: ReactNode[];
};

export const ButtonGroup = ({
  className,
  children,
  variant,
  size,
  accent,
}: ButtonGroupProps) => {
  return (
    <div className={clsx(styles.container, className)}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;

        let position: ButtonPosition;

        if (index === 0) {
          position = 'left';
        } else if (index === children.length - 1) {
          position = 'right';
        } else {
          position = 'middle';
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const additionalProps: any = { position };

        if (isDefined(variant)) {
          additionalProps.variant = variant;
        }

        if (isDefined(accent)) {
          additionalProps.accent = accent;
        }

        if (isDefined(size)) {
          additionalProps.size = size;
        }

        return React.cloneElement(child, additionalProps);
      })}
    </div>
  );
};
