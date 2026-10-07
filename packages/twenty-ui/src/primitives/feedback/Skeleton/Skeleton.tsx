import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { type CSSProperties, Fragment } from 'react';

import { type SkeletonProps } from './types/SkeletonProps';

import styles from './Skeleton.module.scss';

export const Skeleton = ({
  width,
  height,
  borderRadius,
  baseColor,
  highlightColor,
  animated = true,
  layout = 'shape',
  count = 1,
  containerClassName,
  className,
  style,
  render,
  ref,
  ...props
}: SkeletonProps) => {
  const placeholder = useRender({
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
        '--skeleton-base-color': baseColor,
        '--skeleton-highlight-color': highlightColor,
        ...style,
      } as CSSProperties,
      children: '\u200c',
    },
  });

  if (layout === 'shape') {
    return placeholder;
  }

  return (
    <span
      className={containerClassName}
      aria-live="polite"
      aria-busy={animated}
    >
      {Array.from({ length: count }, (_, index) => (
        <Fragment key={index}>
          {placeholder}
          <br />
        </Fragment>
      ))}
    </span>
  );
};
