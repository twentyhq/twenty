import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import {
  type CreateStandardRelationFieldArgs,
  createStandardRelationFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';

export const createStandardMorphRelationFieldFlatMetadata = <
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
>(
  args: CreateStandardRelationFieldArgs<O, T>,
): FlatFieldMetadata => {
  const simpleRelationFlatFieldMetadata =
    createStandardRelationFieldFlatMetadata(args);

  return {
    ...simpleRelationFlatFieldMetadata,
    type: FieldMetadataType.MORPH_RELATION,
  };
};
