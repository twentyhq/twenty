import { selectorFamily, SerializableParam } from 'recoil';

import { SelectorGetter } from '../../types/SelectorGetter';
import { SelectorSetter } from '../../types/SelectorSetter';
import { ComponentFamilyStateKey } from '../types/ComponentFamilyStateKey';

export const createComponentFamilySelector = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  get,
  set,
}: {
  key: string;
  get: SelectorGetter<ValueType, ComponentFamilyStateKey<FamilyKey>>;
  set: SelectorSetter<ValueType, ComponentFamilyStateKey<FamilyKey>>;
}) => {
  return selectorFamily<ValueType, ComponentFamilyStateKey<FamilyKey>>({
    key,
    get,
    set,
  });
};
