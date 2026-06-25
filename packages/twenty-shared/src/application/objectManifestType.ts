import { type ObjectFieldManifest } from '@/application/objectFieldManifest.type';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

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
  fields: ObjectFieldManifest[];
  labelIdentifierFieldMetadataUniversalIdentifier: string;
};
