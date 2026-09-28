import { useOsShortcutSeparator } from '@ui/utilities/device/internal/useOsShortcutSeparator';

import styles from './ButtonHotKeys.module.scss';

type ButtonHotkeysProps = { hotkeys: string[] };

export const ButtonHotkeys = ({ hotkeys }: ButtonHotkeysProps) => {
  const shortcutSeparator = useOsShortcutSeparator();

  return (
    <span className={styles.hotkeys} aria-hidden>
      {hotkeys.join(shortcutSeparator)}
    </span>
  );
};
