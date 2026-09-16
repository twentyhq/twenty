import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type DialogBodyProps } from '../types/DialogBodyProps';

export const DialogBody = ({
  render,
  ref,
  className,
  ...props
}: DialogBodyProps) =>
  useRender({
    render,
    ref,
    props: { ...props, className: clsx(styles.body, className) },
  });
