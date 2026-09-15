import { type RefObject, useRef } from 'react';

// Keeps a ref in sync with the latest value every render, so effects and
// long-lived render loops can read current props/callbacks without resubscribing.
export function useLatestRef<Value>(value: Value): RefObject<Value> {
  const reference = useRef(value);
  reference.current = value;
  return reference;
}
