import { type ConditionalDisplaySurface } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { isLegacyNonAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/is-legacy-non-authored-override.util';

export const getUniversalFlatEntityConditionalDisplays = ({
  metadataName,
  universalConditionalDisplay,
  universalOverrides,
}: {
  metadataName: ConditionalDisplaySurface;
  universalConditionalDisplay: unknown;
  universalOverrides?: unknown;
}): unknown[] => {
  if (!isPlainObject(universalOverrides)) {
    return [universalConditionalDisplay];
  }

  const overrideEntries = isLegacyNonAuthoredOverride({
    metadataName,
    overrides: universalOverrides,
  })
    ? [universalOverrides]
    : Object.values(universalOverrides);

  return [
    universalConditionalDisplay,
    ...overrideEntries
      .filter(isPlainObject)
      .map((overrideEntry) => overrideEntry.conditionalDisplay),
  ];
};
