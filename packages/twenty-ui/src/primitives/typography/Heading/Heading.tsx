import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { type HeadingProps } from './types/HeadingProps';

import styles from './Heading.module.scss';

export const Heading = ({
  level = 2,
  size = 'md',
  color = 'primary',
  render,
  ref,
  className,
  ...props
}: HeadingProps) =>
  useRender({
    defaultTagName: `h${level}`,
    render,
    ref,
    props: {
      ...props,
      'data-size': size,
      'data-color': color,
      className: clsx(styles.heading, className),
    },
  });
