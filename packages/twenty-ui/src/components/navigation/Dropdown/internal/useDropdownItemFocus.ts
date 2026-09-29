import { useDropdownContext } from './useDropdownContext';

export const useDropdownItemFocus = ({
  id,
  isSubmenuTrigger = false,
}: {
  id: string;
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

  return {
    tabIndex: type === 'menu' && activeItemId !== id ? -1 : 0,
    activate: () => setActiveItemId?.(id),
  };
};
