import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

const resolveTargetApplicationUniversalIdentifier = ({
  entity: roleTargetEntity,
  applicationIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'roleTarget'>): string | null => {
  const { targetApplicationId } = roleTargetEntity;

  if (!isDefined(targetApplicationId)) {
    return null;
  }

  const targetApplicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(targetApplicationId);

  if (!isDefined(targetApplicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${targetApplicationId} not found for roleTarget ${roleTargetEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return targetApplicationUniversalIdentifier;
};

export const fromRoleTargetEntityToFlatRoleTarget = (
  args: FromEntityToFlatEntityArgs<'roleTarget'>,
): FlatRoleTarget => {
  const { entity: roleTargetEntity } = args;

  const roleTargetScalarEntity = fromEntityToScalarEntity({
    metadataName: 'roleTarget',
    entity: roleTargetEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'roleTarget',
      ...args,
    });

  return {
    ...roleTargetScalarEntity,
    ...relationUniversalIdentifiers,
    targetApplicationUniversalIdentifier:
      resolveTargetApplicationUniversalIdentifier(args),
  };
};
