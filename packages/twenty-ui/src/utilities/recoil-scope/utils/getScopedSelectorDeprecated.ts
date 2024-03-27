import { RecoilScopedSelector } from '../types/RecoilScopedSelector';

export const getScopedSelectorDeprecated = <StateType>(
  recoilScopedState: RecoilScopedSelector<StateType>,
  scopeId: string,
) => {
  return recoilScopedState({
    scopeId,
  });
};
