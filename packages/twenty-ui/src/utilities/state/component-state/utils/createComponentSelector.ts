import { selectorFamily } from 'recoil';

import { SelectorGetter } from '../../types/SelectorGetter';
import { SelectorSetter } from '../../types/SelectorSetter';
import { ComponentStateKey } from '../types/ComponentStateKey';

export const createComponentSelector = <ValueType>({
  key,
  get,
  set,
}: {
  key: string;
  get: SelectorGetter<ValueType, ComponentStateKey>;
  set: SelectorSetter<ValueType, ComponentStateKey>;
}) => {
  return selectorFamily<ValueType, ComponentStateKey>({
    key,
    get,
    set,
  });
};
