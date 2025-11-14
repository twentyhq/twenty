import { type CreateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

export type ObjectMetadataSeed = Omit<
  CreateOneObjectInput,
  'workspaceId' | 'dataSourceId' | 'fields'
>;
