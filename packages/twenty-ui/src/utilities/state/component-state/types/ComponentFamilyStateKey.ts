import { SerializableParam } from 'recoil';

export type ComponentFamilyStateKey<FamilyKey extends SerializableParam> = {
  scopeId: string;
  familyKey: FamilyKey;
};
