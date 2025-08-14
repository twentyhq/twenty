import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const isStandardMetadata = (
  metadata:
    | Pick<FlatObjectMetadata, 'standardId' | 'isCustom'>
    | Pick<FlatFieldMetadata, 'standardId' | 'isCustom'>,
) => !metadata.isCustom && isDefined(metadata.standardId);
