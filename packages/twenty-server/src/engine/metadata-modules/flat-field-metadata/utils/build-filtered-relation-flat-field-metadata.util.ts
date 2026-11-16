import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// A filtered relation points to the same related object and inverse field as the relation it derives from,
// so it loads like any one-to-many relation. An unknown source is left for the validator to report.
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
}): UniversalFlatFieldMetadata<FieldMetadataType.RELATION> => {
  const sourceRelationFlatFieldMetadata = getFlatFieldsFromFlatObjectMetadata(
    parentFlatObjectMetadata,
    flatFieldMetadataMaps,
  ).find((flatFieldMetadata) => flatFieldMetadata.name === relationFieldName);

  return {
    ...commonFlatFieldMetadata,
    type: FieldMetadataType.RELATION,
    defaultValue: null,
    options: null,
    universalSettings: { relationType: RelationType.ONE_TO_MANY },
    relationTargetObjectMetadataUniversalIdentifier:
      sourceRelationFlatFieldMetadata?.relationTargetObjectMetadataUniversalIdentifier ??
      null,
    relationTargetFieldMetadataUniversalIdentifier:
      sourceRelationFlatFieldMetadata?.relationTargetFieldMetadataUniversalIdentifier ??
      null,
  };
};
