import { isDropdownRow } from './isDropdownRow';
import { useDropdownContext } from './useDropdownContext';

export const useDropdownItemFocus = ({
  id,
  disabled,
  isSubmenuTrigger = false,
}: {
  id: string;
  disabled: boolean;
  isSubmenuTrigger?: boolean;
}) => {
  const context = useDropdownContext();
  const type = isSubmenuTrigger ? context.parentType : context.type;
  const rowFocus = isSubmenuTrigger ? context.parentRowFocus : context.rowFocus;
  const isRovingRow =
    type !== 'panel' && (rowFocus?.rowIds.includes(id) ?? false);
  const isOutsideTabOrder =
    disabled || (isRovingRow && rowFocus?.tabStopRowId !== id);

  return {
    tabIndex: isOutsideTabOrder ? -1 : 0,
    activate: (item: HTMLElement) => {
      if (isDropdownRow(item)) {
        rowFocus?.focusRow(id);
      }
    },
  };
};
