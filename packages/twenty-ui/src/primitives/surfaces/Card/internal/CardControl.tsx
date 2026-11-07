import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { type CardControlProps } from '../types/CardControlProps';

import styles from '../CardControl.module.scss';

export const CardControl = ({
  className,
  render,
  ref,
  ...props
}: CardControlProps) =>
  useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.control, className),
    },
  });
