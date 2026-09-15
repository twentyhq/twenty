import type { ButtonAccent } from '@ui/primitives/input/Button/types/ButtonAccent';
import type { ButtonSize } from '@ui/primitives/input/Button/types/ButtonSize';
import type { ButtonVariant } from '@ui/primitives/input/Button/types/ButtonVariant';
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
