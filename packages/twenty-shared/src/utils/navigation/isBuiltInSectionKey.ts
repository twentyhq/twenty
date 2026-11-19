import { BUILT_IN_SECTION_KEYS, type BuiltInSectionKey } from '../../types';

export const isBuiltInSectionKey = (
  value: unknown,
): value is BuiltInSectionKey =>
  BUILT_IN_SECTION_KEYS.some(
    (builtInSectionKey) => builtInSectionKey === value,
  );
