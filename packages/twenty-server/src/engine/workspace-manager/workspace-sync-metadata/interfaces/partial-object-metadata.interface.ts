import {
  ComputedPartialFieldMetadata,
  PartialComputedFieldMetadata,
  PartialFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { ReflectObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-object-metadata.interface';

export type PartialObjectMetadata = ReflectObjectMetadata & {
  id?: string;
  workspaceId: string;
  dataSourceId: string;
  fields: (PartialFieldMetadata | PartialComputedFieldMetadata)[];
};

export type ComputedPartialObjectMetadata = Omit<
  PartialObjectMetadata,
  'standardId' | 'fields'
> & {
  standardId: string | null;
  fields: ComputedPartialFieldMetadata[];
};
