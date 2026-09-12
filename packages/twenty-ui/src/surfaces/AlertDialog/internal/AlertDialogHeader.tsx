import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import styles from '../../internal/Dialog.module.scss';
import { type AlertDialogHeaderProps } from '../types/AlertDialogHeaderProps';

export const AlertDialogHeader = ({
  render,
  ref,
  className,
  ...props
}: AlertDialogHeaderProps) =>
  useRender({
    render,
    ref,
    props: { ...props, className: clsx(styles.header, className) },
  });
