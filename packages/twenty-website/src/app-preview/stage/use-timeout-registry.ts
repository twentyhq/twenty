'use client';

import { useEffect, useRef } from 'react';

import {
  createTimeoutRegistry,
  type TimeoutRegistry,
} from './timeout-registry';

export function useTimeoutRegistry(): TimeoutRegistry {
  const registryReference = useRef<TimeoutRegistry | null>(null);
  registryReference.current ??= createTimeoutRegistry();

  useEffect(() => {
    const registry = registryReference.current;
    return () => {
      registry?.clearAll();
    };
  }, []);

  return registryReference.current;
}
