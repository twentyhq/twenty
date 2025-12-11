import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';
import {
  type CreateStandardMorphOrRelationFieldContext,
  createStandardRelationFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';

export type CreateStandardMorphRelationFieldContext<
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
> = CreateStandardMorphOrRelationFieldContext<
  O,
  T,
  FieldMetadataType.MORPH_RELATION
>;

export type CreateStandardMorphRelationFieldArgs<
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
> = StandardBuilderArgs<'fieldMetadata'> & {
  objectName: O;
  context: CreateStandardMorphRelationFieldContext<O, T>;
};

export const createStandardMorphRelationFieldFlatMetadata = <
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
>(
  args: CreateStandardMorphRelationFieldArgs<O, T>,
): FlatFieldMetadata => {
  const simpleRelationFlatFieldMetadata =
    createStandardRelationFieldFlatMetadata(args);

  return {
    ...simpleRelationFlatFieldMetadata,
    type: FieldMetadataType.MORPH_RELATION,
  };
};
