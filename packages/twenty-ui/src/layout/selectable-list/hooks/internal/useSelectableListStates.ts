import { useAvailableScopeIdOrThrow } from 'src/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentFamilyState } from 'src/utilities/state/component-state/utils/extractComponentFamilyState';
import { extractComponentState } from 'src/utilities/state/component-state/utils/extractComponentState';

import { SelectableListScopeInternalContext } from '../../scopes/scope-internal-context/SelectableListScopeInternalContext';
import { selectableItemIdsComponentState } from '../../states/selectableItemIdsComponentState';
import { selectableListOnEnterComponentState } from '../../states/selectableListOnEnterComponentState';
import { selectedItemIdComponentState } from '../../states/selectedItemIdComponentState';
import { isSelectedItemIdFamilySelector } from '../../states/selectors/isSelectedItemIdFamilySelector';

type useSelectableListStatesProps = {
  selectableListScopeId?: string;
};

export const useSelectableListStates = ({
  selectableListScopeId,
}: useSelectableListStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    SelectableListScopeInternalContext,
    selectableListScopeId,
  );

  return {
    scopeId,
    isSelectedItemIdSelector: extractComponentFamilyState(
      isSelectedItemIdFamilySelector,
      scopeId,
    ),
    selectableItemIdsState: extractComponentState(
      selectableItemIdsComponentState,
      scopeId,
    ),
    selectableListOnEnterState: extractComponentState(
      selectableListOnEnterComponentState,
      scopeId,
    ),
    selectedItemIdState: extractComponentState(
      selectedItemIdComponentState,
      scopeId,
    ),
  };
};
