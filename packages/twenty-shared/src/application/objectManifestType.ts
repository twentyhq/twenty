import { type ObjectFieldManifest } from '@/application/objectFieldManifest.type';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type MetadataReadability } from '@/types/MetadataReadability';
import { type MetadataWritability } from '@/types/MetadataWritability';
import { type ObjectOpenRecordIn } from '@/types/ObjectOpenRecordIn';
import { type ObjectSharingReach } from '@/types/ObjectSharingReach';

export type ObjectManifest = SyncableEntityOptions & {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
  color?: string | null;
  isLabelSyncedWithName?: boolean;
  isSearchable?: boolean;
  isUICreatable?: boolean;
  isUIEditable?: boolean;
  writability?: MetadataWritability | `${MetadataWritability}`;
  readability?: MetadataReadability | `${MetadataReadability}`;
  readabilityParentFieldUniversalIdentifiers?: string[] | null;
  sharingReach?: ObjectSharingReach | `${ObjectSharingReach}`;
  openRecordIn?: ObjectOpenRecordIn | `${ObjectOpenRecordIn}`;
  fields: ObjectFieldManifest[];
  labelIdentifierFieldMetadataUniversalIdentifier: string;
  imageIdentifierFieldMetadataUniversalIdentifier?: string | null;
};
