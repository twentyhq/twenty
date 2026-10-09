import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { type CardFooterProps } from '../types/CardFooterProps';

import styles from '../CardFooter.module.scss';

export const CardFooter = ({
  className,
  divider,
  render,
  ref,
  ...props
}: CardFooterProps) =>
  useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.cardFooter, className),
      'data-no-divider': divider === false || undefined,
    },
  });
