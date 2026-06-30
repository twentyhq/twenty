import styles from './AnimatedCircleLoading.module.scss';

export const AnimatedCircleLoading = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className={styles.container}>{children}</div>;
