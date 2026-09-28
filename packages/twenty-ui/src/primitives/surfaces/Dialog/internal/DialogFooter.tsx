import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type DialogFooterProps } from '../types/DialogFooterProps';

export const DialogFooter = ({
  render,
  ref,
  className,
  ...props
}: DialogFooterProps) =>
  useRender({
    render,
    ref,
    props: { ...props, className: clsx(styles.footer, className) },
  });
