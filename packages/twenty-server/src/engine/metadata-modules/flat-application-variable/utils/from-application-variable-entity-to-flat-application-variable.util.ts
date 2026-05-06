import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromApplicationVariableEntityToFlatApplicationVariable = ({
  entity: applicationVariableEntity,
  applicationIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'applicationVariable'>): FlatApplicationVariable => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      applicationVariableEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${applicationVariableEntity.applicationId} not found for applicationVariable ${applicationVariableEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    id: applicationVariableEntity.id,
    key: applicationVariableEntity.key,
    value: applicationVariableEntity.value,
    description: applicationVariableEntity.description,
    isSecret: applicationVariableEntity.isSecret,
    workspaceId: applicationVariableEntity.workspaceId,
    universalIdentifier: applicationVariableEntity.universalIdentifier,
    applicationId: applicationVariableEntity.applicationId,
    createdAt: applicationVariableEntity.createdAt.toISOString(),
    updatedAt: applicationVariableEntity.updatedAt.toISOString(),
    applicationUniversalIdentifier,
  };
};
