import React from 'react';

import styles from './CardPicker.module.scss';
import { Radio } from '@ui/input/Radio/Radio';

type CardPickerProps = {
  children: React.ReactNode;
  handleChange?: () => void;
  checked?: boolean;
};

export const CardPicker = ({
  children,
  checked,
  handleChange,
}: CardPickerProps) => {
  return (
    <button className={styles.container} onClick={handleChange}>
      <div className={styles.radioContainer}>
        <Radio checked={checked} />
      </div>
      <div className={styles.cardInner}>{children}</div>
    </button>
  );
};
