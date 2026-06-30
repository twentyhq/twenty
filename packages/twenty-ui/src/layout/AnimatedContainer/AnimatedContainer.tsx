import styles from './AnimatedContainer.module.scss';

export const AnimatedContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className={styles.container}>{children}</div>;
