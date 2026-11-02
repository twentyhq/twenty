import { type ObjectPermissionAction } from '@/application/objectPermissionActionType';
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
  color?: string | null;
  isLabelSyncedWithName?: boolean;
  isSearchable?: boolean;
  isUICreatable?: boolean;
  isUIEditable?: boolean;
  disabledObjectPermissionActions?: ObjectPermissionAction[];
  openRecordIn?: ObjectOpenRecordIn;
  fields: ObjectFieldManifest[];
  labelIdentifierFieldMetadataUniversalIdentifier: string;
  imageIdentifierFieldMetadataUniversalIdentifier?: string | null;
};
