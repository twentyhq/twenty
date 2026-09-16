import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type DialogHeaderProps } from '../types/DialogHeaderProps';

export const DialogHeader = ({
  render,
  ref,
  className,
  ...props
}: DialogHeaderProps) =>
  useRender({
    render,
    ref,
    props: { ...props, className: clsx(styles.header, className) },
  });
