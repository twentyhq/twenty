import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const isFlatFieldMetadataRequiredOnCreate = (
  flatFieldMetadata: Pick<FlatFieldMetadata, 'isNullable' | 'defaultValue'>,
): boolean =>
  isDefined(flatFieldMetadata.isNullable) &&
  !flatFieldMetadata.isNullable &&
  !isDefined(flatFieldMetadata.defaultValue);
