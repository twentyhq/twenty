import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromFrontComponentEntityToFlatFrontComponent = ({
  entity: frontComponentEntity,
  applicationIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'frontComponent'>): FlatFrontComponent => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      frontComponentEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${frontComponentEntity.applicationId} not found for frontComponent ${frontComponentEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    id: frontComponentEntity.id,
    name: frontComponentEntity.name,
    description: frontComponentEntity.description,
    sourceComponentPath: frontComponentEntity.sourceComponentPath,
    builtComponentPath: frontComponentEntity.builtComponentPath,
    componentName: frontComponentEntity.componentName,
    builtComponentChecksum: frontComponentEntity.builtComponentChecksum,
    workspaceId: frontComponentEntity.workspaceId,
    universalIdentifier: frontComponentEntity.universalIdentifier,
    applicationId: frontComponentEntity.applicationId,
    createdAt: frontComponentEntity.createdAt.toISOString(),
    updatedAt: frontComponentEntity.updatedAt.toISOString(),
    applicationUniversalIdentifier,
  };
};
