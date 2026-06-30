import { type ObjectPermissions } from './ObjectPermissions';

type ObjectMetadataId = string;

export type ObjectsPermissions = Record<ObjectMetadataId, ObjectPermissions>;
