import { type FieldManifest } from '@/application';
import { type RelationFieldManifest } from '@/application/relationFieldManifestType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type ObjectManifest = SyncableEntityOptions & {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
  fields: (FieldManifest | RelationFieldManifest)[];
};
