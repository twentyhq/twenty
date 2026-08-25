import { type EntityTarget } from 'typeorm';

import {
  type EntityFetchRequirement,
  type WorkspaceScopedRow,
} from 'src/engine/workspace-cache/types/entity-fetch-requirement.type';

// Builder kept generic so declared columns are checked against the entity.
export const entityFetchRequirement = <TEntity extends WorkspaceScopedRow>(
  entityTarget: EntityTarget<TEntity>,
  columns?: readonly (keyof TEntity & string)[],
): EntityFetchRequirement => ({
  entityTarget: entityTarget as EntityTarget<WorkspaceScopedRow>,
  columns,
});
