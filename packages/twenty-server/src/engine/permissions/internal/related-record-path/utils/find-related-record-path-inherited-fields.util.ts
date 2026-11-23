/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export type RelatedRecordPathInheritedFieldDefinition = {
  fieldUniversalIdentifier: string;
  sourceFieldUniversalIdentifier: string;
};

export type RelatedRecordPathInheritedField = {
  fieldMetadataId: string;
  sourceObjectMetadataId: string;
  sourceFieldMetadataId: string;
};

export const findRelatedRecordPathInheritedFields = ({
  inheritedFieldDefinitions,
  objectMetadataId,
  flatFieldMetadataMaps,
}: {
  inheritedFieldDefinitions: RelatedRecordPathInheritedFieldDefinition[];
  objectMetadataId: string;
  flatFieldMetadataMaps: Pick<
    FlatEntityMaps<OrmFlatFieldMetadata>,
    'byUniversalIdentifier'
  >;
}): RelatedRecordPathInheritedField[] =>
  inheritedFieldDefinitions.flatMap(
    ({ fieldUniversalIdentifier, sourceFieldUniversalIdentifier }) => {
      const flatFieldMetadata =
        flatFieldMetadataMaps.byUniversalIdentifier[fieldUniversalIdentifier];
      const sourceFlatFieldMetadata =
        flatFieldMetadataMaps.byUniversalIdentifier[
          sourceFieldUniversalIdentifier
        ];

      if (
        !isDefined(flatFieldMetadata) ||
        !isDefined(sourceFlatFieldMetadata) ||
        flatFieldMetadata.objectMetadataId !== objectMetadataId
      ) {
        return [];
      }

      return [
        {
          fieldMetadataId: flatFieldMetadata.id,
          sourceObjectMetadataId: sourceFlatFieldMetadata.objectMetadataId,
          sourceFieldMetadataId: sourceFlatFieldMetadata.id,
        },
      ];
    },
  );
