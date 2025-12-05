import { type FieldManifest } from '@/application';

export type ObjectManifest = {
  universalIdentifier: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
  fields?: FieldManifest[];
};
