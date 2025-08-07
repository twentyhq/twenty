import { ObjectPermissions } from '@/types/ObjectPermissions';

type ObjectMetadataId = string;

export type ObjectsPermissions = Record<ObjectMetadataId, ObjectPermissions>;
