import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { type CardHeaderProps } from '../types/CardHeaderProps';

import styles from '../CardHeader.module.scss';

export const CardHeader = ({
  className,
  render,
  ref,
  ...props
}: CardHeaderProps) =>
  useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.cardHeader, className),
    },
  });
