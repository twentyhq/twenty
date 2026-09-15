import styles from './SeparatorLineText.module.scss';

export const SeparatorLineText = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className={styles.container}>{children}</div>;
};
