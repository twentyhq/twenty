import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import styles from '../../internal/Dialog.module.scss';
import { type AlertDialogFooterProps } from '../types/AlertDialogFooterProps';

export const AlertDialogFooter = ({
  render,
  ref,
  className,
  ...props
}: AlertDialogFooterProps) =>
  useRender({
    render,
    ref,
    props: { ...props, className: clsx(styles.footer, className) },
  });
