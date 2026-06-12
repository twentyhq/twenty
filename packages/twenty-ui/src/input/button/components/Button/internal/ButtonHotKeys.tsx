import {
  type ButtonAccent,
  type ButtonSize,
  type ButtonVariant,
} from '@ui/input/button/components/Button/Button';
import { getOsShortcutSeparator } from '@ui/utilities';

import styles from './ButtonHotKeys.module.scss';

export const ButtonHotkeys = ({
  size,
  accent,
  variant,
  hotkeys,
}: {
  size: ButtonSize;
  accent: ButtonAccent;
  variant: ButtonVariant;
  hotkeys: string[];
}) => {
  return (
    <>
      <div className={styles.separator} data-size={size} data-accent={accent} />
      <div
        className={styles.shortcutLabel}
        data-variant={variant}
        data-accent={accent}
      >
        {hotkeys.join(getOsShortcutSeparator())}
      </div>
    </>
  );
};
