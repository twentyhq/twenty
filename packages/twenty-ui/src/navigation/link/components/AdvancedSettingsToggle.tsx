import { Toggle } from '@ui/input';
import { ThemeContext } from '@ui/theme-constants';
import { clsx } from 'clsx';
import { useContext, useId } from 'react';

import styles from './AdvancedSettingsToggle.module.scss';

type AdvancedSettingsToggleProps = {
  isAdvancedModeEnabled: boolean;
  setIsAdvancedModeEnabled: (enabled: boolean) => void;
  label?: string;
  className?: string;
};

export const AdvancedSettingsToggle = ({
  isAdvancedModeEnabled,
  setIsAdvancedModeEnabled,
  label = 'Advanced',
  className,
}: AdvancedSettingsToggleProps) => {
  const { theme } = useContext(ThemeContext);

  const onChange = (newValue: boolean) => {
    setIsAdvancedModeEnabled(newValue);
  };
  const instanceId = useId();

  return (
    <label className={clsx(styles.container, className)} htmlFor={instanceId}>
      <div className={styles.text}>{label}</div>
      <Toggle
        id={instanceId}
        onChange={onChange}
        color={theme.color.yellow}
        value={isAdvancedModeEnabled}
      />
    </label>
  );
};
