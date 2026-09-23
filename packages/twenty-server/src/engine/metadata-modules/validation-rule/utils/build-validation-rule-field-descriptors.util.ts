import {
  FieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type BuildValidationRuleFieldDescriptorsArgs = {
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
};

const findActiveFlatFieldMetadatasOfObject = ({
  objectMetadataId,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: BuildValidationRuleFieldDescriptorsArgs): OrmFlatFieldMetadata[] => {
  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    return [];
  }

  return flatObjectMetadata.fieldIds
    .map((fieldId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
    .filter(isDefined)
    .filter((flatFieldMetadata) => flatFieldMetadata.isActive);
};

const toScalarFieldDescriptor = (
  flatFieldMetadata: OrmFlatFieldMetadata,
): ValidationRuleFieldDescriptor => ({
  name: flatFieldMetadata.name,
  type: flatFieldMetadata.type,
  universalIdentifier: flatFieldMetadata.universalIdentifier,
});

export const buildValidationRuleFieldDescriptors = (
  args: BuildValidationRuleFieldDescriptorsArgs,
): ValidationRuleFieldDescriptor[] =>
  findActiveFlatFieldMetadatasOfObject(args).map((flatFieldMetadata) => {
    if (
      !isFlatFieldMetadataOfType(flatFieldMetadata, FieldMetadataType.RELATION)
    ) {
      return toScalarFieldDescriptor(flatFieldMetadata);
    }

    const relationType = flatFieldMetadata.settings?.relationType;
    const relationTargetObjectMetadataId =
      flatFieldMetadata.relationTargetObjectMetadataId;

    return {
      ...toScalarFieldDescriptor(flatFieldMetadata),
      relationType,
      relationTargetFields:
        relationType === RelationType.MANY_TO_ONE &&
        isDefined(relationTargetObjectMetadataId)
          ? findActiveFlatFieldMetadatasOfObject({
              ...args,
              objectMetadataId: relationTargetObjectMetadataId,
            }).map(toScalarFieldDescriptor)
          : undefined,
    };
  });
