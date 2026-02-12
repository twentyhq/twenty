import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type ObjectFieldManifest } from '@/application/objectFieldManifest.type';

export type ObjectManifest = SyncableEntityOptions & {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
  fields: ObjectFieldManifest[];
};
