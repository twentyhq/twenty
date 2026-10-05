import { type IconComponent } from '@ui/icon';
import { clsx } from 'clsx';

import styles from './Pill.module.scss';

type PillProps = {
  className?: string;
  label?: string;
  Icon?: IconComponent;
  size?: 'sm' | 'md';
  color?: 'tertiary' | 'inherit';
};

export const Pill = ({
  className,
  label,
  Icon,
  size = 'sm',
  color = 'tertiary',
}: PillProps) => {
  return (
    <span
      className={clsx(styles.pill, className)}
      data-size={size}
      data-color={color}
    >
      {Icon && <Icon size={12} />}
      {label}
    </span>
  );
};
