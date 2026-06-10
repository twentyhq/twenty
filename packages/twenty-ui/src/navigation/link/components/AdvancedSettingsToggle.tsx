import { IconPoint } from '@ui/display';
import { Toggle } from '@ui/input';
import { ThemeContext } from '@ui/theme-constants';
import { useContext, useId } from 'react';

import styles from './AdvancedSettingsToggle.module.scss';

type AdvancedSettingsToggleProps = {
  isAdvancedModeEnabled: boolean;
  setIsAdvancedModeEnabled: (enabled: boolean) => void;
  label?: string;
};

export const AdvancedSettingsToggle = ({
  isAdvancedModeEnabled,
  setIsAdvancedModeEnabled,
  label = 'Advanced:',
}: AdvancedSettingsToggleProps) => {
  const { theme } = useContext(ThemeContext);

  const onChange = (newValue: boolean) => {
    setIsAdvancedModeEnabled(newValue);
  };
  const instanceId = useId();

  const yellowColor = theme.color.yellow;

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <IconPoint size={12} color={yellowColor} fill={yellowColor} />
      </div>
      <label className={styles.toggleContainer} htmlFor={instanceId}>
        <div className={styles.text}>{label}</div>

        <Toggle
          id={instanceId}
          onChange={onChange}
          color={yellowColor}
          value={isAdvancedModeEnabled}
        />
      </label>
    </div>
  );
};
