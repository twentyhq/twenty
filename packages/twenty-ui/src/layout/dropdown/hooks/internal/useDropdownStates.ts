import { useAvailableScopeIdOrThrow } from '../../../../utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentState } from '../../../../utilities/state/component-state/utils/extractComponentState';
import { DropdownScopeInternalContext } from '../../scopes/scope-internal-context/DropdownScopeInternalContext';
import { dropdownHotkeyComponentState } from '../../states/dropdownHotkeyComponentState';
import { dropdownWidthComponentState } from '../../states/dropdownWidthComponentState';
import { isDropdownOpenComponentState } from '../../states/isDropdownOpenComponentState';

type UseDropdownStatesProps = {
  dropdownScopeId?: string;
};

export const useDropdownStates = ({
  dropdownScopeId,
}: UseDropdownStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    DropdownScopeInternalContext,
    dropdownScopeId,
  );

  return {
    scopeId,
    dropdownHotkeyScopeState: extractComponentState(
      dropdownHotkeyComponentState,
      scopeId,
    ),
    dropdownWidthState: extractComponentState(
      dropdownWidthComponentState,
      scopeId,
    ),
    isDropdownOpenState: extractComponentState(
      isDropdownOpenComponentState,
      scopeId,
    ),
  };
};
