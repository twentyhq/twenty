import { RecoilState, SerializableParam } from 'recoil';

import { ComponentFamilyStateKey } from '../../state/component-state/types/ComponentFamilyStateKey';

export const getScopedFamilyStateDeprecated = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  recoilState: (
    scopedFamilyKey: ComponentFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>,
  scopeId: string,
  familyKey: FamilyKey,
) => {
  return recoilState({
    scopeId,
    familyKey: familyKey || ('' as FamilyKey),
  });
};
