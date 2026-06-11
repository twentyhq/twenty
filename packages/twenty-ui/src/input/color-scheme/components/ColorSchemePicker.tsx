import { clsx } from 'clsx';

import { type ColorScheme } from '@ui/input/types/ColorScheme';

import { ColorSchemeCard } from './ColorSchemeCard';
import styles from './ColorSchemePicker.module.scss';

export type ColorSchemePickerProps = {
  value: ColorScheme;
  className?: string;
  onChange: (value: ColorScheme) => void;
  lightLabel: string;
  darkLabel: string;
  systemLabel: string;
};

export const ColorSchemePicker = ({
  value,
  onChange,
  className,
  lightLabel,
  darkLabel,
  systemLabel,
}: ColorSchemePickerProps) => {
  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.cardContainer}>
        <ColorSchemeCard
          onClick={() => onChange('Light')}
          variant="Light"
          selected={value === 'Light'}
        />
        <span className={styles.label}>{lightLabel}</span>
      </div>
      <div className={styles.cardContainer}>
        <ColorSchemeCard
          onClick={() => onChange('Dark')}
          variant="Dark"
          selected={value === 'Dark'}
        />
        <span className={styles.label}>{darkLabel}</span>
      </div>
      <div className={styles.cardContainer}>
        <ColorSchemeCard
          onClick={() => onChange('System')}
          variant="System"
          selected={value === 'System'}
        />
        <span className={styles.label}>{systemLabel}</span>
      </div>
    </div>
  );
};
