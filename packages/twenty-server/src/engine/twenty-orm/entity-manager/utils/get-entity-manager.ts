import {
    EntityTarget,
    InstanceChecker,
    ObjectLiteral,
    SaveOptions,
} from 'typeorm';

import { DeepPartialWithNestedRelationFields } from 'src/engine/twenty-orm/entity-manager/types/deep-partial-entity-with-nested-relation-fields.type';

export const getEntityManager = <
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
  const target =
    typeof targetOrEntity === 'function' ||
    InstanceChecker.isEntitySchema(targetOrEntity) ||
    typeof targetOrEntity === 'string'
      ? targetOrEntity
      : undefined;

  const entity = target ? entityOrMaybeOptions : targetOrEntity;

  const isEntityArray = Array.isArray(entity);

  return (
    target ?? (isEntityArray ? entity[0]?.constructor : entity.constructor)
  );
};
