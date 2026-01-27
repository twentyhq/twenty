import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';

export const fromViewGroupEntityToFlatViewGroup = ({
  viewGroupEntity,
  applicationIdToUniversalIdentifierMap,
  viewIdToUniversalIdentifierMap,
}: {
  viewGroupEntity: ViewGroupEntity;
  applicationIdToUniversalIdentifierMap: Map<string, string>;
  viewIdToUniversalIdentifierMap: Map<string, string>;
}): FlatViewGroup => {
  const viewGroupEntityWithoutRelations = removePropertiesFromRecord(
    viewGroupEntity,
    getMetadataEntityRelationProperties('viewGroup'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(viewGroupEntity.applicationId);

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${viewGroupEntity.applicationId} not found for viewGroup ${viewGroupEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const viewUniversalIdentifier = viewIdToUniversalIdentifierMap.get(
    viewGroupEntity.viewId,
  );

  if (!isDefined(viewUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `View with id ${viewGroupEntity.viewId} not found for viewGroup ${viewGroupEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...viewGroupEntityWithoutRelations,
    createdAt: viewGroupEntity.createdAt.toISOString(),
    updatedAt: viewGroupEntity.updatedAt.toISOString(),
    deletedAt: viewGroupEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: viewGroupEntityWithoutRelations.universalIdentifier,
    __universal: {
      universalIdentifier: viewGroupEntity.universalIdentifier,
      applicationUniversalIdentifier,
      viewUniversalIdentifier,
    },
  };
};
