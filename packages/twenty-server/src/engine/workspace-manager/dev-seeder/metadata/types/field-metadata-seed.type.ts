import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

export type FieldMetadataSeed = Omit<
  CreateFieldInput,
  'objectMetadataId' | 'workspaceId'
>;
