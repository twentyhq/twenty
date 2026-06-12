import { clsx } from 'clsx';

import styles from './Label.module.scss';

export type LabelVariant = 'default' | 'small';

type LabelProps = {
  variant?: LabelVariant;
  children?: React.ReactNode;
  className?: string;
};

export const Label = ({
  variant = 'default',
  children,
  className,
}: LabelProps) => {
  return (
    <div className={clsx(styles.label, styles[variant], className)}>
      {children}
    </div>
  );
};
