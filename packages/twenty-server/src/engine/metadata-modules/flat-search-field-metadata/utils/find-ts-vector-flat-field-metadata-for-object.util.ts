import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

// Resolves the object's single system TS_VECTOR field (the 'searchVector' field) that
// every searchFieldMetadata row contributes to.
// Could be refactored once https://github.com/twentyhq/twenty/pull/21949 has been merged.
export const findTsVectorFlatFieldMetadataForObject = ({
  fieldUniversalIdentifiers,
  flatFieldMetadataMaps,
}: {
  fieldUniversalIdentifiers: string[];
  flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
}): MetadataUniversalFlatEntity<'fieldMetadata'> | undefined =>
  fieldUniversalIdentifiers
    .map(
      (fieldUniversalIdentifier) =>
        flatFieldMetadataMaps.byUniversalIdentifier[fieldUniversalIdentifier],
    )
    .find(
      (flatFieldMetadata) =>
        isDefined(flatFieldMetadata) &&
        flatFieldMetadata.type === FieldMetadataType.TS_VECTOR &&
        flatFieldMetadata.name === SEARCH_VECTOR_FIELD.name,
    );
