import { RecoilState } from 'recoil';

import { ComponentStateKey } from '../types/ComponentStateKey';

export const extractComponentSelector = <StateType>(
  componentSelector: (
    componentStateKey: ComponentStateKey,
  ) => RecoilState<StateType>,
  scopeId: string,
) => {
  return () => componentSelector({ scopeId });
};
