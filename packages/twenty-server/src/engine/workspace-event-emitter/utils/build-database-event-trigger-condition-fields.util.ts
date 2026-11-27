import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';

// Undefined when the event names no single known object, so its condition cannot name fields
export const buildDatabaseEventTriggerConditionFields = ({
  eventName,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  shouldIncludeInactiveFields,
}: {
  eventName: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  shouldIncludeInactiveFields?: boolean;
}): ValidationRuleFieldDescriptor[] | undefined => {
  const [objectNameSingular] = eventName.split('.');
  const objectMetadataId = buildObjectIdByNameMaps(flatObjectMetadataMaps)
    .idByNameSingular[objectNameSingular];

  return isDefined(objectMetadataId)
    ? buildValidationRuleFieldDescriptors({
        objectMetadataId,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        shouldIncludeInactiveFields,
      })
    : undefined;
};
