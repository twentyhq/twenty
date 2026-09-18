import { Pill } from '@ui/primitives/data-display/internal/Pill/Pill';

import styles from './ButtonSoon.module.scss';

type ButtonSoonProps = {
  label?: string;
};

export const ButtonSoon = ({ label = 'Soon' }: ButtonSoonProps) => (
  <span className={styles.soonPillContainer}>
    <Pill label={label} />
  </span>
);
