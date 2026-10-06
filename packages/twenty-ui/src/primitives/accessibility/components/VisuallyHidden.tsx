import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { type VisuallyHiddenProps } from '../types/VisuallyHiddenProps';

import styles from './VisuallyHidden.module.scss';

export const VisuallyHidden = ({
  render,
  ref,
  className,
  ...props
}: VisuallyHiddenProps) =>
  useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: { ...props, className: clsx(styles.root, className) },
  });
