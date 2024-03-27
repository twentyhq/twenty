import { RecoilState } from 'recoil';

import { ComponentStateKey } from '../types/ComponentStateKey';

export const extractComponentState = <StateType>(
  componentState: (
    componentStateKey: ComponentStateKey,
  ) => RecoilState<StateType>,
  scopeId: string,
) => {
  return () => componentState({ scopeId });
};
