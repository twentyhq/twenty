import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isDefined } from 'twenty-shared/utils';

export const isStandardMetadata = (
  metadata:
    | Pick<FlatObjectMetadata, 'standardId' | 'isCustom'>
    | Pick<FlatFieldMetadata, 'standardId' | 'isCustom'>,
) => !metadata.isCustom && isDefined(metadata.standardId);
