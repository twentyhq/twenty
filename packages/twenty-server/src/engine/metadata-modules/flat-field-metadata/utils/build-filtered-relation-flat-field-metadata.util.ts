import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isComputedField, isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// A filtered relation targets the same object as the relation it derives from and has no inverse field of its own:
// an inverse field belongs to one relation. Undefined when it derives from no stored one-to-many relation.
export const buildFilteredRelationFlatFieldMetadata = ({
  commonFlatFieldMetadata,
  relationFieldName,
  parentFlatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  commonFlatFieldMetadata: ReturnType<typeof getDefaultFlatFieldMetadata>;
  relationFieldName: string;
  parentFlatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): UniversalFlatFieldMetadata | undefined => {
  const sourceRelationFlatFieldMetadata = getFlatFieldsFromFlatObjectMetadata(
    parentFlatObjectMetadata,
    flatFieldMetadataMaps,
  ).find((flatFieldMetadata) => flatFieldMetadata.name === relationFieldName);

  if (
    !isDefined(sourceRelationFlatFieldMetadata) ||
    !isFlatFieldMetadataOfType(
      sourceRelationFlatFieldMetadata,
      FieldMetadataType.RELATION,
    ) ||
    sourceRelationFlatFieldMetadata.settings.relationType !==
      RelationType.ONE_TO_MANY ||
    isComputedField(sourceRelationFlatFieldMetadata)
  ) {
    return undefined;
  }

  return {
    ...commonFlatFieldMetadata,
    type: FieldMetadataType.RELATION,
    defaultValue: null,
    options: null,
    universalSettings: { relationType: RelationType.ONE_TO_MANY },
    relationTargetObjectMetadataUniversalIdentifier:
      sourceRelationFlatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier: null,
  };
};
