import { atom, type PrimitiveAtom } from 'jotai';

export const createState = <ValueType>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: ValueType;
}): PrimitiveAtom<ValueType> => {
  const jotaiAtom = atom<ValueType>(defaultValue);
  jotaiAtom.debugLabel = key;
  return jotaiAtom;
};
