import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

type FromFrontComponentEntityToFlatFrontComponentArgs = {
  frontComponentEntity: EntityWithRegroupedOneToManyRelations<FrontComponentEntity>;
  applicationIdToUniversalIdentifierMap: Map<string, string>;
};

export const fromFrontComponentEntityToFlatFrontComponent = ({
  frontComponentEntity,
  applicationIdToUniversalIdentifierMap,
}: FromFrontComponentEntityToFlatFrontComponentArgs): FlatFrontComponent => {
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
    workspaceId: frontComponentEntity.workspaceId,
    universalIdentifier: frontComponentEntity.universalIdentifier,
    applicationId: frontComponentEntity.applicationId,
    createdAt: frontComponentEntity.createdAt.toISOString(),
    updatedAt: frontComponentEntity.updatedAt.toISOString(),
    __universal: {
      universalIdentifier: frontComponentEntity.universalIdentifier,
      applicationUniversalIdentifier,
    },
  };
};
