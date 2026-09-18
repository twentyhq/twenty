import { getOsShortcutSeparator } from '@ui/utilities';

import styles from './ButtonHotKeys.module.scss';

type ButtonHotkeysProps = { hotkeys: string[] };

export const ButtonHotkeys = ({ hotkeys }: ButtonHotkeysProps) => (
  <span className={styles.hotkeys} aria-hidden>
    {hotkeys.join(getOsShortcutSeparator())}
  </span>
);
