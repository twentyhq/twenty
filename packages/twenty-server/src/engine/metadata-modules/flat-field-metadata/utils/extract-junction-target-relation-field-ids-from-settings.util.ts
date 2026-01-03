import { type AllFieldMetadataSettings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Extracts junctionTargetRelationFieldIds from untyped settings input
// This function handles the boundary where settings come from external API input
export const extractJunctionTargetRelationFieldIdsFromSettings = (
  settings: AllFieldMetadataSettings | null | undefined,
): string[] | undefined => {
  if (!isDefined(settings)) {
    return undefined;
  }

  if (typeof settings !== 'object' || settings === null) {
    return undefined;
  }

  if (!('junctionTargetRelationFieldIds' in settings)) {
    return undefined;
  }

  const junctionTargetRelationFieldIds =
    settings.junctionTargetRelationFieldIds;

  if (!Array.isArray(junctionTargetRelationFieldIds)) {
    return undefined;
  }

  // Validate all items are strings
  if (!junctionTargetRelationFieldIds.every((id) => typeof id === 'string')) {
    return undefined;
  }

  return junctionTargetRelationFieldIds;
};
