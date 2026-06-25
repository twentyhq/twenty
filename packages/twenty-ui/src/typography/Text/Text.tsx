import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Text.module.scss';

type TextProps = Omit<useRender.ComponentProps<'div'>, 'ref'> & {
  truncate?: boolean;
  lineClamp?: number;
};

export const Text = forwardRef<HTMLDivElement, TextProps>(
  ({ render, truncate, lineClamp, className, style, ...props }, ref) =>
    useRender({
      render: render ?? <div />,
      ref,
      props: {
        ...props,
        className: clsx(
          truncate === true && styles.truncate,
          isDefined(lineClamp) && styles.lineClamp,
          className,
        ),
        style: isDefined(lineClamp)
          ? ({
              ...style,
              '--text-line-clamp': lineClamp,
            } as React.CSSProperties)
          : style,
      },
    }),
);
