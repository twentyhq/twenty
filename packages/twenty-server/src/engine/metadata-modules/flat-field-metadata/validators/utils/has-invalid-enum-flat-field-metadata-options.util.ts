import { type EnumFieldMetadataType } from 'twenty-shared/types';

import { validateFieldMetadataInputOptions } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-field-metadata-input-options.util';
import { validateOptionIdsAreUniversalIdentifiers } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-option-ids-are-universal-identifiers.util';
import { validateSelectOptionColors } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-select-option-colors.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const hasInvalidEnumFlatFieldMetadataOptions = (
  universalFlatFieldMetadata: UniversalFlatFieldMetadata<EnumFieldMetadataType>,
): boolean =>
  validateFieldMetadataInputOptions(universalFlatFieldMetadata).length > 0 ||
  validateSelectOptionColors(universalFlatFieldMetadata).length > 0 ||
  validateOptionIdsAreUniversalIdentifiers(universalFlatFieldMetadata).length >
    0;
