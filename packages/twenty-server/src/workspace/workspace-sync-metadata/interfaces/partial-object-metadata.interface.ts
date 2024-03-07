import {
  ComputedPartialFieldMetadata,
  PartialComputedFieldMetadata,
  PartialFieldMetadata,
} from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { ReflectObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-object-metadata.interface';

export type PartialObjectMetadata = ReflectObjectMetadata & {
  id?: string;
  workspaceId: string;
  dataSourceId: string;
  fields: (PartialFieldMetadata | PartialComputedFieldMetadata)[];
};

export type ComputedPartialObjectMetadata = Omit<
  PartialObjectMetadata,
  'fields'
> & {
  fields: ComputedPartialFieldMetadata[];
};
