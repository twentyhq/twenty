import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { type BadgeProps } from './types/BadgeProps';

import styles from './Badge.module.scss';

export const Badge = ({
  size = 'sm',
  color = 'tertiary',
  shape = 'pill',
  className,
  render,
  ref,
  ...props
}: BadgeProps) =>
  useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.badge, className),
      'data-badge-size': size,
      'data-badge-color': color,
      'data-badge-shape': shape,
    },
  });
