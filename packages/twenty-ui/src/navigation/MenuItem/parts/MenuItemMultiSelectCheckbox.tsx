import { Checkbox } from '@ui/input/Checkbox/Checkbox';

import styles from './MenuItemMultiSelectCheckbox.module.scss';

type MenuItemMultiSelectCheckboxProps = {
  selected: boolean;
  onSelectChange?: (selected: boolean) => void;
  ariaLabel?: string;
};

export const MenuItemMultiSelectCheckbox = ({
  selected,
  onSelectChange,
  ariaLabel,
}: MenuItemMultiSelectCheckboxProps) => {
  // The surrounding row also toggles selection on click.
  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className={styles.container}
      onClick={(event) => event.stopPropagation()}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onSelectChange?.(checked)}
        aria-label={ariaLabel}
      />
    </div>
  );
};
