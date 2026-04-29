import { useRef, type RefObject } from 'react';

export const useLatestRef = <Value>(value: Value): RefObject<Value> => {
  const reference = useRef(value);
  reference.current = value;
  return reference;
};
