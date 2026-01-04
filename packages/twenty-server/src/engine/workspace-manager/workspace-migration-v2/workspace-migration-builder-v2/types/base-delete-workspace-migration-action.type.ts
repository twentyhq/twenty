import { type AllMetadataName } from 'twenty-shared/metadata';

export type BaseDeleteWorkspaceMigrationAction<T extends AllMetadataName> = {
  entityId: string;
  type: 'delete';
  metadataName: T;
};
