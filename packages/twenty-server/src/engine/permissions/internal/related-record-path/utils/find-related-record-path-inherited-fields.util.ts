/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { RELATED_RECORD_PATH_INHERITED_FIELDS } from 'src/engine/permissions/internal/related-record-path/constants/related-record-path-inherited-fields.constant';

export type RelatedRecordPathInheritedField = {
  fieldMetadataId: string;
  sourceObjectMetadataId: string;
  sourceFieldMetadataId: string;
};

export const findRelatedRecordPathInheritedFields = ({
  objectMetadataId,
  flatFieldMetadataMaps,
}: {
  objectMetadataId: string;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): RelatedRecordPathInheritedField[] =>
  RELATED_RECORD_PATH_INHERITED_FIELDS.flatMap(
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
