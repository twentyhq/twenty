import { type ObjectFieldManifest } from '@/application/objectFieldManifest.type';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
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
  // How records of this object open: pinned to the side panel or a full page,
  // or USER_CHOICE (the default) to follow each member's own preference.
  openRecordIn?: ObjectOpenRecordIn;
  fields: ObjectFieldManifest[];
  labelIdentifierFieldMetadataUniversalIdentifier: string;
};
