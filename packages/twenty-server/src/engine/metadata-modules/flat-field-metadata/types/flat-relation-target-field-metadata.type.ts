import { FieldMetadataType } from 'twenty-shared/types';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type FlatRelationTargetFieldMetadata = FlatFieldMetadata<
  FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
>['flatRelationTargetFieldMetadata'];
