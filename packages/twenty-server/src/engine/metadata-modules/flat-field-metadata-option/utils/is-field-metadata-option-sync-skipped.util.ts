import { isDefined } from 'twenty-shared/utils';

import { isEnumUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { validateFieldMetadataInputOptions } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-field-metadata-input-options.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Malformed options always fail the field's own validation, which reports them once.
export const isFieldMetadataOptionSyncSkipped = (
  universalFlatFieldMetadata: UniversalFlatFieldMetadata | undefined,
): boolean =>
  isDefined(universalFlatFieldMetadata) &&
  isEnumUniversalFlatFieldMetadata(universalFlatFieldMetadata) &&
  validateFieldMetadataInputOptions(universalFlatFieldMetadata).length > 0;
