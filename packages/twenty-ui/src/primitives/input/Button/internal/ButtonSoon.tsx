import styles from './ButtonSoon.module.scss';

type ButtonSoonProps = {
  label?: string;
};

export const ButtonSoon = ({ label = 'Soon' }: ButtonSoonProps) => (
  <span className={styles.soonPillContainer}>
    <span className={styles.soonPill}>{label}</span>
  </span>
);
