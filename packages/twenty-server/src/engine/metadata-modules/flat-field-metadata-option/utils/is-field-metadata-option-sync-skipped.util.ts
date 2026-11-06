import { isDefined } from 'twenty-shared/utils';

import { isEnumUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { hasInvalidEnumFlatFieldMetadataOptions } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/has-invalid-enum-flat-field-metadata-options.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Rows are left untouched for invalid options and for legacy ids awaiting the 2.57 backfill.
export const isFieldMetadataOptionSyncSkipped = (
  universalFlatFieldMetadata: UniversalFlatFieldMetadata | undefined,
): boolean =>
  isDefined(universalFlatFieldMetadata) &&
  isEnumUniversalFlatFieldMetadata(universalFlatFieldMetadata) &&
  hasInvalidEnumFlatFieldMetadataOptions(universalFlatFieldMetadata);
