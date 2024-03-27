import { selectorFamily } from 'recoil';

import { SelectorGetter } from '../../types/SelectorGetter';
import { ComponentStateKey } from '../types/ComponentStateKey';

export const createComponentReadOnlySelector = <ValueType>({
  key,
  get,
}: {
  key: string;
  get: SelectorGetter<ValueType, ComponentStateKey>;
}) => {
  return selectorFamily<ValueType, ComponentStateKey>({
    key,
    get,
  });
};
