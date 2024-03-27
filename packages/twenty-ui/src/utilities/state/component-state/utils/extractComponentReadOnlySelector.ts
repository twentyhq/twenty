import { RecoilValueReadOnly } from 'recoil';

import { ComponentStateKey } from '../types/ComponentStateKey';

export const extractComponentReadOnlySelector = <StateType>(
  componentSelector: (
    componentStateKey: ComponentStateKey,
  ) => RecoilValueReadOnly<StateType>,
  scopeId: string,
) => {
  return () => componentSelector({ scopeId });
};
