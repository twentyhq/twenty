import { RecoilState, SerializableParam } from 'recoil';

import { ComponentFamilyStateKey } from '../types/ComponentFamilyStateKey';

export const extractComponentFamilyState = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  componentfamilyState: (
    componentFamilyStateKey: ComponentFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>,
  scopeId: string,
) => {
  return (familyKey: FamilyKey) =>
    componentfamilyState({
      scopeId,
      familyKey: familyKey || ('' as FamilyKey),
    });
};
