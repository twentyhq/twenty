import { atomFamily, SerializableParam } from 'recoil';

import { ComponentFamilyStateKey } from '../types/ComponentFamilyStateKey';

export const createComponentFamilyState = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: ValueType;
}) => {
  return atomFamily<ValueType, ComponentFamilyStateKey<FamilyKey>>({
    key,
    default: defaultValue,
  });
};
