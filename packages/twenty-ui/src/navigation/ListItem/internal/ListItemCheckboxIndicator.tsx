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
      checkboxStyles.primary,
      checkboxStyles.small,
      checkboxStyles.squared,
      checkboxStyles.blue,
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
