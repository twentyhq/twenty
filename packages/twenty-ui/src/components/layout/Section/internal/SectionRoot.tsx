import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { type SectionRootProps } from '../types/SectionRootProps';

import styles from '../SectionRoot.module.scss';

export const SectionRoot = ({
  align = 'left',
  color = 'primary',
  fullWidth = true,
  className,
  render,
  ref,
  ...props
}: SectionRootProps) =>
  useRender({
    render,
    ref,
    props: {
      ...props,
      'data-align': align,
      'data-color': color,
      className: clsx(styles.root, fullWidth && styles.fullWidth, className),
    },
  });
