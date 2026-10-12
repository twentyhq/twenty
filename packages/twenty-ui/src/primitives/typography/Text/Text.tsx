import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type TextProps } from './types/TextProps';

import styles from './Text.module.scss';

export const Text = ({
  render,
  truncate,
  lineClamp,
  className,
  style,
  ref,
  ...props
}: TextProps) => {
  const shouldClamp =
    isDefined(lineClamp) && Number.isInteger(lineClamp) && lineClamp > 0;

  return useRender({
    render,
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
          } as CSSProperties)
        : style,
    },
  });
};
