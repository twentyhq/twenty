'use client';

import { useContext } from 'react';

import { VisualRuntimeContext } from './visual-runtime-context';

export function useVisualRuntime() {
  return useContext(VisualRuntimeContext);
}
