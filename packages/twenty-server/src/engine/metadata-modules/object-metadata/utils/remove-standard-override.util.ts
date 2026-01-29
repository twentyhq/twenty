import { isDefined } from 'twenty-shared/utils';

import { type ObjectStandardOverridesDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-standard-overrides.dto';
import { type ObjectMetadataStandardOverridesProperties } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-standard-overrides-properties.types';

export const removeStandardOverride = ({
  overrides,
  property,
}: {
  overrides: ObjectStandardOverridesDTO | null;
  property: ObjectMetadataStandardOverridesProperties;
}): ObjectStandardOverridesDTO | null => {
  if (!isDefined(overrides)) {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(overrides, property)) {
    return overrides;
  }

  const { [property]: _, ...rest } = overrides as Record<string, unknown>;

  return rest as ObjectStandardOverridesDTO;
};
