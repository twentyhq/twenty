import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromViewFieldGroupEntityToFlatViewFieldGroup = ({
  entity: viewFieldGroupEntity,
  applicationIdToUniversalIdentifierMap,
  viewIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'viewFieldGroup'>): FlatViewFieldGroup => {
  const viewFieldGroupEntityWithoutRelations = removePropertiesFromRecord(
    viewFieldGroupEntity,
    getMetadataEntityRelationProperties('viewFieldGroup'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      viewFieldGroupEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${viewFieldGroupEntity.applicationId} not found for viewFieldGroup ${viewFieldGroupEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const viewUniversalIdentifier = viewIdToUniversalIdentifierMap.get(
    viewFieldGroupEntity.viewId,
  );

  if (!isDefined(viewUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `View with id ${viewFieldGroupEntity.viewId} not found for viewFieldGroup ${viewFieldGroupEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...viewFieldGroupEntityWithoutRelations,
    createdAt: viewFieldGroupEntity.createdAt.toISOString(),
    updatedAt: viewFieldGroupEntity.updatedAt.toISOString(),
    deletedAt: viewFieldGroupEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      viewFieldGroupEntityWithoutRelations.universalIdentifier,
    applicationUniversalIdentifier,
    viewUniversalIdentifier,
    viewFieldIds:
      viewFieldGroupEntity.viewFields?.map((viewField) => viewField.id) ?? [],
    viewFieldUniversalIdentifiers:
      viewFieldGroupEntity.viewFields?.map(
        (viewField) => viewField.universalIdentifier,
      ) ?? [],
  };
};
