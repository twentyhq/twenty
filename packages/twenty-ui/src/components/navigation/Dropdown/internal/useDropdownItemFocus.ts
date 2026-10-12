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
  const activeItemId = isSubmenuTrigger
    ? context.parentActiveItemId
    : context.activeItemId;
  const setActiveItemId = isSubmenuTrigger
    ? context.setParentActiveItemId
    : context.setActiveItemId;
  const isOutsideMenuRovingFocus = type === 'menu' && activeItemId !== id;

  return {
    tabIndex: disabled || isOutsideMenuRovingFocus ? -1 : 0,
    activate: () => setActiveItemId?.(id),
  };
};
