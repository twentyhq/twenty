import { useDropdownContext } from './useDropdownContext';

export const useDropdownItemFocus = ({
  id,
  isSubmenuTrigger = false,
}: {
  id: string;
  isSubmenuTrigger?: boolean;
}) => {
  const context = useDropdownContext();
  const kind = isSubmenuTrigger ? context.parentKind : context.kind;
  const activeItemId = isSubmenuTrigger
    ? context.parentActiveItemId
    : context.activeItemId;
  const setActiveItemId = isSubmenuTrigger
    ? context.setParentActiveItemId
    : context.setActiveItemId;

  return {
    tabIndex: kind === 'menu' && activeItemId !== id ? -1 : 0,
    activate: () => setActiveItemId?.(id),
  };
};
