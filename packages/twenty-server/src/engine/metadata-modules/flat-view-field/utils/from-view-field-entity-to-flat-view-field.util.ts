import { removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';

export const fromViewFieldEntityToFlatViewField = ({
  viewFieldEntity,
  applicationIdToUniversalIdentifierMap,
  fieldMetadataIdToUniversalIdentifierMap,
  viewIdToUniversalIdentifierMap,
}: {
  viewFieldEntity: ViewFieldEntity;
  applicationIdToUniversalIdentifierMap: Map<string, string>;
  fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
  viewIdToUniversalIdentifierMap: Map<string, string>;
}): FlatViewField => {
  const viewFieldEntityWithoutRelations = removePropertiesFromRecord(
    viewFieldEntity,
    getMetadataEntityRelationProperties('viewField'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(viewFieldEntity.applicationId);

  if (!applicationUniversalIdentifier) {
    throw new FlatEntityMapsException(
      `Application with id ${viewFieldEntity.applicationId} not found for viewField ${viewFieldEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const fieldMetadataUniversalIdentifier =
    fieldMetadataIdToUniversalIdentifierMap.get(
      viewFieldEntity.fieldMetadataId,
    );

  if (!fieldMetadataUniversalIdentifier) {
    throw new FlatEntityMapsException(
      `FieldMetadata with id ${viewFieldEntity.fieldMetadataId} not found for viewField ${viewFieldEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const viewUniversalIdentifier = viewIdToUniversalIdentifierMap.get(
    viewFieldEntity.viewId,
  );

  if (!viewUniversalIdentifier) {
    throw new FlatEntityMapsException(
      `View with id ${viewFieldEntity.viewId} not found for viewField ${viewFieldEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...viewFieldEntityWithoutRelations,
    createdAt: viewFieldEntity.createdAt.toISOString(),
    updatedAt: viewFieldEntity.updatedAt.toISOString(),
    deletedAt: viewFieldEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: viewFieldEntityWithoutRelations.universalIdentifier,
    __universal: {
      universalIdentifier: viewFieldEntity.universalIdentifier,
      applicationUniversalIdentifier,
      fieldMetadataUniversalIdentifier,
      viewUniversalIdentifier,
    },
  };
};
