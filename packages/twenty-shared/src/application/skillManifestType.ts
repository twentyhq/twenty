import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type SkillManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  icon?: string;
  description?: string;
  content: string;
};
