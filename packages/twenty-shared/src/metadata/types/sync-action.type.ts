import { type AllMetadataName } from '@/metadata/types/all-metadata-name.type';

type SyncActionFlatEntity = {
  name?: string | null;
  nameSingular?: string | null;
  universalIdentifier?: string | null;
  [key: string]: unknown;
};

type SyncCreateAction = {
  type: 'create';
  metadataName: AllMetadataName;
  flatEntity?: SyncActionFlatEntity;
};

type SyncUpdateAction = {
  type: 'update';
  metadataName: AllMetadataName;
  universalIdentifier: string;
  flatEntity?: SyncActionFlatEntity;
  diff?: Record<string, { before: unknown; after: unknown }>;
};

type SyncDeleteAction = {
  type: 'delete';
  metadataName: AllMetadataName;
  universalIdentifier: string;
  flatEntity?: SyncActionFlatEntity;
};

export type SyncAction = SyncCreateAction | SyncUpdateAction | SyncDeleteAction;
