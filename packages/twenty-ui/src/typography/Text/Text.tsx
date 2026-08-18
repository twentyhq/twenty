import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Text.module.scss';

type TextTruncationProps =
  | { truncate?: boolean; lineClamp?: never }
  | { truncate?: never; lineClamp?: number };

type TextProps = Omit<useRender.ComponentProps<'div'>, 'ref'> &
  TextTruncationProps;

export const Text = forwardRef<HTMLDivElement, TextProps>(
  ({ render, truncate, lineClamp, className, style, ...props }, ref) => {
    const shouldClamp =
      isDefined(lineClamp) && Number.isInteger(lineClamp) && lineClamp > 0;

    return useRender({
      render: render ?? <div />,
      ref,
      props: {
        ...props,
        className: clsx(
          truncate && styles.truncate,
          shouldClamp && styles.lineClamp,
          className,
        ),
        style: shouldClamp
          ? ({
              ...style,
              '--text-line-clamp': lineClamp,
            } as React.CSSProperties)
          : style,
      },
    });
  },
);

Text.displayName = 'Text';
