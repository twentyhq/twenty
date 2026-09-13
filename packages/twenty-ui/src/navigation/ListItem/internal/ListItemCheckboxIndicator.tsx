import { clsx } from 'clsx';

import { IconCheck } from '@ui/icon';
import checkboxStyles from '@ui/input/Checkbox/Checkbox.module.scss';

type ListItemCheckboxIndicatorProps = {
  checked: boolean;
  disabled: boolean;
};

export const ListItemCheckboxIndicator = ({
  checked,
  disabled,
}: ListItemCheckboxIndicatorProps) => (
  <span
    aria-hidden
    className={clsx(
      checkboxStyles.root,
      checkboxStyles.solid,
      checkboxStyles.sm,
      checkboxStyles.square,
      checkboxStyles.accent,
    )}
    data-checked={checked || undefined}
    data-disabled={disabled || undefined}
  >
    <span className={checkboxStyles.box}>
      {checked && (
        <span className={checkboxStyles.indicator}>
          <IconCheck aria-hidden />
        </span>
      )}
    </span>
  </span>
);
