import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { type CardContentProps } from '../types/CardContentProps';

import styles from '../CardContent.module.scss';

export const CardContent = ({
  className,
  divider,
  render,
  ref,
  ...props
}: CardContentProps) =>
  useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.cardContent, className),
      'data-divider': divider || undefined,
    },
  });
