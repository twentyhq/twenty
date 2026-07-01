import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataSideEffectOperation } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operation.type';

// Emitted by the side-effect engine when a system-generated (isSystemSideEffect) entity's
// deterministic universal identifier collides with an entity already present in the matrix that
// was declared by the application. The application is not allowed to reference these reserved
// identifiers (taking over a system-managed entity will go through a dedicated override API), so
// the collision must be surfaced as a validation error instead of being silently adopted.
export type SystemSideEffectUniversalIdentifierCollision = {
  metadataName: AllMetadataName;
  operation: MetadataSideEffectOperation;
  universalIdentifier: string;
  name?: string;
};
