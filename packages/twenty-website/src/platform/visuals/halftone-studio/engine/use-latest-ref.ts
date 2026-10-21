import { type RefObject, useRef } from 'react';

export function useLatestRef<Value>(value: Value): RefObject<Value> {
  const reference = useRef(value);
  reference.current = value;
  return reference;
}
