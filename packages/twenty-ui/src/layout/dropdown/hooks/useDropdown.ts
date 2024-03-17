import { useRecoilState } from 'recoil';

import { usePreviousHotkeyScope } from '../../../utilities/hotkey/hooks/usePreviousHotkeyScope';
import { getScopeIdOrUndefinedFromComponentId } from '../../../utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { isDefined } from '../../../utils/isDefined';
import { useDropdownStates } from '../hooks/internal/useDropdownStates';

export const useDropdown = (dropdownId?: string) => {
  const {
    scopeId,
    dropdownHotkeyScopeState,
    dropdownWidthState,
    isDropdownOpenState,
  } = useDropdownStates({
    dropdownScopeId: getScopeIdOrUndefinedFromComponentId(dropdownId),
  });

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [dropdownHotkeyScope] = useRecoilState(dropdownHotkeyScopeState());

  const [dropdownWidth, setDropdownWidth] =
    useRecoilState(dropdownWidthState());

  const [isDropdownOpen, setIsDropdownOpen] = useRecoilState(
    isDropdownOpenState(),
  );

  const closeDropdown = () => {
    goBackToPreviousHotkeyScope();
    setIsDropdownOpen(false);
  };

  const openDropdown = () => {
    setIsDropdownOpen(true);
    if (isDefined(dropdownHotkeyScope)) {
      setHotkeyScopeAndMemorizePreviousScope(
        dropdownHotkeyScope.scope,
        dropdownHotkeyScope.customScopes,
      );
    }
  };

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  return {
    scopeId,
    isDropdownOpen: isDropdownOpen,
    closeDropdown,
    toggleDropdown,
    openDropdown,
    dropdownWidth,
    setDropdownWidth,
  };
};
