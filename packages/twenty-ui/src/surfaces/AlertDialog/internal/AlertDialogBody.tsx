import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import styles from '../../internal/Dialog.module.scss';
import { type AlertDialogBodyProps } from '../types/AlertDialogBodyProps';

export const AlertDialogBody = ({
  render,
  ref,
  className,
  ...props
}: AlertDialogBodyProps) =>
  useRender({
    render,
    ref,
    props: { ...props, className: clsx(styles.body, className) },
  });
