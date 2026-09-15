import { clsx } from 'clsx';

import styles from './NotificationCounter.module.scss';

type NotificationCounterProps = {
  count: number;
  variant?: 'primary' | 'secondary';
  className?: string;
};

export const NotificationCounter = ({
  count,
  variant = 'primary',
  className,
}: NotificationCounterProps) => {
  return (
    <div
      className={clsx(styles.notificationCounter, styles[variant], className)}
    >
      {count}
    </div>
  );
};
