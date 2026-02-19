import { type CommandMenuItemManifest } from './commandMenuItemManifestType';

export type FrontComponentCommandManifest = Omit<
  CommandMenuItemManifest,
  'frontComponentUniversalIdentifier'
>;

export type FrontComponentManifest = {
  universalIdentifier: string;
  name?: string;
  description?: string;
  sourceComponentPath: string;
  builtComponentPath: string;
  builtComponentChecksum: string;
  componentName: string;
  command?: FrontComponentCommandManifest;
};
