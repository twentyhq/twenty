import { type AllMetadataName } from 'twenty-shared/metadata';

export type BaseDeleteWorkspaceMigrationAction<T extends AllMetadataName> = {
  universalIdentifier: string;
  type: 'delete';
  metadataName: T;
};
