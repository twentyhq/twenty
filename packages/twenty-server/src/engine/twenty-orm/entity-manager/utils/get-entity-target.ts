import { isDefined } from 'twenty-shared/utils';
import {
  type EntityTarget,
  InstanceChecker,
  type ObjectLiteral,
  type SaveOptions,
} from 'typeorm';

import { type DeepPartialWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/deep-partial-entity-with-nested-relation-fields.type';

export const getEntityTarget = <
  Entity extends ObjectLiteral,
  T extends DeepPartialWithNestedRelationFields<Entity>,
>(
  targetOrEntity: EntityTarget<Entity> | Entity | Entity[],
  entityOrMaybeOptions:
    | T
    | T[]
    | SaveOptions
    | (SaveOptions & { reload: false }),
) => {
  const isEntityTarget =
    (typeof targetOrEntity === 'function' ||
      InstanceChecker.isEntitySchema(targetOrEntity) ||
      typeof targetOrEntity === 'string') &&
    isDefined(targetOrEntity);

  const entityTarget = isEntityTarget ? targetOrEntity : null;

  if (entityTarget) return entityTarget;

  const entityData = isEntityTarget ? entityOrMaybeOptions : targetOrEntity;
  const isEntityArray = Array.isArray(entityData);

  return isEntityArray ? entityData[0]?.constructor : entityData.constructor;
};
