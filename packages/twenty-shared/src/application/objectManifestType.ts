import { type ObjectFieldManifest } from '@/application/objectFieldManifest.type';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type MetadataWritability } from '@/types/MetadataWritability';
import { type ObjectOpenRecordIn } from '@/types/ObjectOpenRecordIn';

export type ObjectManifest = SyncableEntityOptions & {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
  isSearchable?: boolean;
  // When false, the generic UI shows no affordance to create records of this object
  isUICreatable?: boolean;
  // When false, records of this object are not editable through the generic UI
  isUIEditable?: boolean;
  // Who may write records of this object at all: OPEN (roles decide, default),
  // APPLICATION (only the owning app acting as itself), SYSTEM (nobody
  // through the API). Enforced in the permission layer, not a UI affordance.
  writability?: MetadataWritability;
  openRecordIn?: ObjectOpenRecordIn;
  fields: ObjectFieldManifest[];
  labelIdentifierFieldMetadataUniversalIdentifier: string;
};
