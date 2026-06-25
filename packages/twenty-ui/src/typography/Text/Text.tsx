import { clsx } from 'clsx';
import { forwardRef } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Text.module.scss';

type TextProps = React.ComponentPropsWithoutRef<'div'> & {
  truncate?: boolean;
  lineClamp?: number;
};

export const Text = forwardRef<HTMLDivElement, TextProps>(
  ({ truncate, lineClamp, className, style, children, ...divProps }, ref) => (
    <div
      ref={ref}
      className={clsx(
        truncate === true && styles.truncate,
        isDefined(lineClamp) && styles.lineClamp,
        className,
      )}
      style={
        isDefined(lineClamp)
          ? ({
              ...style,
              '--text-line-clamp': lineClamp,
            } as React.CSSProperties)
          : style
      }
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...divProps}
    >
      {children}
    </div>
  ),
);
