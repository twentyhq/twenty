import {
  createTimeoutRegistry,
  type TimeoutRegistry,
} from '@/lib/react/timeout-registry';
import { useEffect, useRef } from 'react';

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
