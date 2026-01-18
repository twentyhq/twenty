import { type AllFieldMetadataSettings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type JunctionTargetSettings = {
  junctionTargetFieldId?: string;
  junctionTargetMorphId?: string;
};

// Extracts junction target settings from untyped settings input
// This function handles the boundary where settings come from external API input
export const extractJunctionTargetSettingsFromSettings = (
  settings: AllFieldMetadataSettings | null | undefined,
): JunctionTargetSettings => {
  if (!isDefined(settings)) {
    return {};
  }

  if (typeof settings !== 'object' || settings === null) {
    return {};
  }

  const result: JunctionTargetSettings = {};

  // Extract junctionTargetFieldId (singular string)
  if (
    'junctionTargetFieldId' in settings &&
    typeof settings.junctionTargetFieldId === 'string'
  ) {
    result.junctionTargetFieldId = settings.junctionTargetFieldId;
  }

  // Extract junctionTargetMorphId
  if (
    'junctionTargetMorphId' in settings &&
    typeof settings.junctionTargetMorphId === 'string'
  ) {
    result.junctionTargetMorphId = settings.junctionTargetMorphId;
  }

  return result;
};
