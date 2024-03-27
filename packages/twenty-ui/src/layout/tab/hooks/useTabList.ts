import { useSetRecoilState } from 'recoil';

import { useTabListStates } from './internal/useTabListStates';

export const useTabList = (tabListId?: string) => {
  const { getActiveTabIdState } = useTabListStates({
    tabListScopeId: `${tabListId}-scope`,
  });

  const setActiveTabId = useSetRecoilState(getActiveTabIdState());

  return {
    getActiveTabIdState,
    setActiveTabId,
  };
};
