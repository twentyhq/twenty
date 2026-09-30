import { clsx } from 'clsx';
import { type ColorSchemePickerProps } from './types/ColorSchemePickerProps';

import { ColorSchemeCard } from '@ui/components/input/ColorSchemePicker/internal/ColorSchemeCard/ColorSchemeCard';
import styles from './ColorSchemePicker.module.scss';

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
          className={styles.card}
          onClick={() => onChange('Light')}
          variant="Light"
          aria-label={lightLabel}
          selected={value === 'Light'}
        />
        <span className={styles.label}>{lightLabel}</span>
      </div>
      <div className={styles.cardContainer}>
        <ColorSchemeCard
          className={styles.card}
          onClick={() => onChange('Dark')}
          variant="Dark"
          aria-label={darkLabel}
          selected={value === 'Dark'}
        />
        <span className={styles.label}>{darkLabel}</span>
      </div>
      <div className={styles.cardContainer}>
        <ColorSchemeCard
          className={styles.card}
          onClick={() => onChange('System')}
          variant="System"
          aria-label={systemLabel}
          selected={value === 'System'}
        />
        <span className={styles.label}>{systemLabel}</span>
      </div>
    </div>
  );
};
