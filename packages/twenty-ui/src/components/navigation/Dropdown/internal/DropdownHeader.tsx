import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import styles from '../Dropdown.module.scss';
import { type DropdownHeaderProps } from '../types/DropdownHeaderProps';

export const DropdownHeader = ({
  render,
  ref,
  className,
  ...props
}: DropdownHeaderProps) =>
  useRender({
    render,
    ref,
    props: { ...props, className: clsx(styles.header, className) },
  });
