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
  // The checkbox handles its own toggle via onCheckedChange. Base UI
  // re-dispatches a bubbling click on its hidden input, so we stop propagation
  // here to keep the surrounding row's onClick from toggling twice.
  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className={styles.container}
      onClick={(event) => event.stopPropagation()}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={onSelectChange}
        aria-label={ariaLabel}
      />
    </div>
  );
};
