import { useAvailableScopeIdOrThrow } from 'src/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentState } from 'src/utilities/state/component-state/utils/extractComponentState';

import { TabListScopeInternalContext } from '../../scopes/scope-internal-context/TabListScopeInternalContext';
import { activeTabIdComponentState } from '../../states/activeTabIdComponentState';

type useTabListStatesProps = {
  tabListScopeId?: string;
};

export const useTabListStates = ({ tabListScopeId }: useTabListStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    TabListScopeInternalContext,
    tabListScopeId,
  );

  return {
    scopeId,
    getActiveTabIdState: extractComponentState(
      activeTabIdComponentState,
      scopeId,
    ),
  };
};
