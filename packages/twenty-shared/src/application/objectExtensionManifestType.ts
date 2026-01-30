import { type FieldManifest } from '@/application/fieldManifestType';
import { type RelationFieldManifest } from '@/application/relationFieldManifestType';

type TargetObjectByNameSingular = {
  nameSingular: string;
  universalIdentifier?: never;
};

type TargetObjectByUniversalIdentifier = {
  nameSingular?: never;
  universalIdentifier: string;
};

export type ObjectExtensionManifest = {
  targetObject: TargetObjectByNameSingular | TargetObjectByUniversalIdentifier;
  fields: (FieldManifest | RelationFieldManifest)[];
};
