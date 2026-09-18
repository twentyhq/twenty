import styles from './VisibilityHidden.module.scss';

export const VisibilityHidden = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <span className={styles.root}>{children}</span>;
};
