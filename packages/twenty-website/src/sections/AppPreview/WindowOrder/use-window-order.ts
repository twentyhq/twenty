'use client';

import { useCallback, useContext, useEffect, useMemo } from 'react';

import {
  WindowOrderApiContext,
  WindowOrderStackContext,
} from './WindowOrderProvider';

export const useWindowOrder = (id: string) => {
  const api = useContext(WindowOrderApiContext);
  const stack = useContext(WindowOrderStackContext);

  useEffect(() => {
    if (!api) {
      return undefined;
    }
    api.register(id);
    return () => {
      api.unregister(id);
    };
  }, [api, id]);

  const zIndex = useMemo(() => {
    const index = stack.indexOf(id);
    return index === -1 ? 1 : index + 2;
  }, [stack, id]);

  const activate = useCallback(() => {
    api?.activate(id);
  }, [api, id]);

  return { activate, zIndex };
};
