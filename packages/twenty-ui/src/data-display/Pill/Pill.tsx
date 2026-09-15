import { type IconComponent } from '@ui/icon';
import { clsx } from 'clsx';

import styles from './Pill.module.scss';

type PillProps = {
  className?: string;
  label?: string;
  Icon?: IconComponent;
};

export const Pill = ({ className, label, Icon }: PillProps) => {
  return (
    <span className={clsx(styles.pill, className)}>
      {Icon && <Icon size={12} />}
      {label}
    </span>
  );
};
