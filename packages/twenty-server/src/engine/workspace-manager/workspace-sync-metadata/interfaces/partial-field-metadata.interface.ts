import { ReflectDynamicRelationFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-computed-relation-field-metadata.interface';
import { ReflectFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-field-metadata.interface';

export type PartialFieldMetadata = Omit<
  ReflectFieldMetadata[string],
  'joinColumn'
> & {
  workspaceId: string;
  objectMetadataId?: string;
};

export type PartialComputedFieldMetadata =
  ReflectDynamicRelationFieldMetadata & {
    workspaceId: string;
    objectMetadataId?: string;
  };

export type ComputedPartialFieldMetadata = {
  [K in keyof PartialFieldMetadata]: ExcludeFunctions<PartialFieldMetadata[K]>;
};
