import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type CardRootProps } from '../types/CardRootProps';

import styles from '../Card.module.scss';

export const CardRoot = ({
  className,
  fullWidth,
  backgroundColor,
  variant = 'default',
  style,
  render,
  ref,
  ...props
}: CardRootProps) =>
  useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.card, className),
      'data-full-width': fullWidth || undefined,
      'data-variant': variant,
      style: isDefined(backgroundColor)
        ? ({
            ...style,
            '--card-background-color': backgroundColor,
          } as CSSProperties)
        : style,
    },
  });
