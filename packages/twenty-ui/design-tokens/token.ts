import { type DesignTokenLeaf } from './types/DesignTokenLeaf';

export const token = (
  value: string | { light: string; dark: string },
  options?: { unit: 'number' },
): DesignTokenLeaf =>
  typeof value === 'string'
    ? { light: value, dark: value, ...options }
    : { ...value, ...options };
