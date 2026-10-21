import { useCallback, useState } from 'react';

export const useRegisteredElementId = () => {
  const [elementId, setElementId] = useState<string>();

  const registerElementId = useCallback((id: string) => {
    setElementId(id);

    return () =>
      setElementId((currentElementId) =>
        currentElementId === id ? undefined : currentElementId,
      );
  }, []);

  return [elementId, registerElementId] as const;
};
