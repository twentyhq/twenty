import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';

// Resolves the object's single system TS_VECTOR field (the 'searchVector' field) that
// every searchFieldMetadata row contributes to.
// Could be refactored once https://github.com/twentyhq/twenty/pull/21949 has been merged.
export const findTsVectorFlatFieldMetadataForObject = <
  TFlatFieldMetadata extends Pick<FlatFieldMetadata, 'type' | 'name'>,
>({
  fieldUniversalIdentifiers,
  flatFieldMetadataMaps,
}: {
  fieldUniversalIdentifiers: string[];
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<Record<string, TFlatFieldMetadata>>;
  };
}): TFlatFieldMetadata | undefined =>
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
