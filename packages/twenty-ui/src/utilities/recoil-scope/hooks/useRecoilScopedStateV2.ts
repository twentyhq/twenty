import { RecoilState, useRecoilState } from 'recoil';

import { ComponentStateKey } from '../../state/component-state/types/ComponentStateKey';

export const useRecoilScopedStateV2 = <StateType>(
  recoilState: (scopedKey: ComponentStateKey) => RecoilState<StateType>,
  scopeId: string,
) => {
  return useRecoilState<StateType>(
    recoilState({
      scopeId,
    }),
  );
};
