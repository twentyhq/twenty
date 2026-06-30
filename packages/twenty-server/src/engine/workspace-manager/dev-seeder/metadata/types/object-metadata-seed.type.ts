import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

export type ObjectMetadataSeed = Omit<
  CreateObjectInput,
  'workspaceId' | 'fields'
> & {
  skipNameField?: boolean;
};
