import { type AllMetadataName } from '@/metadata/types/all-metadata-name.type';

type SyncCreateAction = {
  type: 'create';
  metadataName: AllMetadataName;
  flatEntity?: {
    name?: string | null;
    nameSingular?: string | null;
    universalIdentifier?: string | null;
    [key: string]: unknown;
  };
};

type SyncUpdateAction = {
  type: 'update';
  metadataName: AllMetadataName;
  universalIdentifier: string;
  flatEntity?: {
    name?: string | null;
    nameSingular?: string | null;
    universalIdentifier?: string | null;
    [key: string]: unknown;
  };
  diff?: Record<string, { before: unknown; after: unknown }>;
};

type SyncDeleteAction = {
  type: 'delete';
  metadataName: AllMetadataName;
  universalIdentifier: string;
  flatEntity?: {
    name?: string | null;
    nameSingular?: string | null;
    universalIdentifier?: string | null;
    [key: string]: unknown;
  };
};

export type SyncAction = SyncCreateAction | SyncUpdateAction | SyncDeleteAction;
