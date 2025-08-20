import { type ObjectPermissionsDeprecated } from './ObjectPermissionsDeprecated';

type ObjectMetadataId = string;

// TODO: DEPRECATE THIS
export type ObjectsPermissionsDeprecated = Record<
  ObjectMetadataId,
  ObjectPermissionsDeprecated
>;
