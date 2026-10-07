import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { type SkeletonProps } from './types/SkeletonProps';

import styles from './Skeleton.module.scss';

export const Skeleton = ({
  width,
  height,
  borderRadius,
  baseColor,
  highlightColor,
  animated = true,
  className,
  style,
  render,
  ref,
  ...props
}: SkeletonProps) =>
  useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      'aria-hidden': true,
      ...props,
      'data-skeleton': '',
      'data-animated': animated || undefined,
      className: clsx(styles.root, className),
      style: {
        width,
        height,
        borderRadius,
        backgroundColor: baseColor,
        '--skeleton-highlight-color': highlightColor,
        ...style,
      } as CSSProperties,
    },
  });
