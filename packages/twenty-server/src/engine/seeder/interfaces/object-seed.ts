import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

export type ObjectMetadataSeed = Omit<
  CreateObjectInput,
  'workspaceId' | 'dataSourceId'
> & { fields: Omit<CreateFieldInput, 'objectMetadataId' | 'workspaceId'>[] };
