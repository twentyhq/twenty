import { atomFamily } from 'recoil';

import { ComponentStateKey } from '../types/ComponentStateKey';

export const createComponentState = <ValueType>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: ValueType;
}) => {
  return atomFamily<ValueType, ComponentStateKey>({
    key,
    default: defaultValue,
  });
};
