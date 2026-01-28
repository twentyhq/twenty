import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { EntityManyToOneIdByUniversalIdentifierMaps } from 'src/engine/workspace-cache/types/entity-many-to-one-id-by-universal-identifier-maps.type';
import {
  type EntityWithRegroupedOneToManyRelations,
} from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

type FromPageLayoutWidgetEntityToFlatPageLayoutWidgetArgs = {
  pageLayoutWidgetEntity: EntityWithRegroupedOneToManyRelations<PageLayoutWidgetEntity>;
  fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
} & EntityManyToOneIdByUniversalIdentifierMaps<'pageLayoutWidget'>;

export const fromPageLayoutWidgetEntityToFlatPageLayoutWidget = ({
  pageLayoutWidgetEntity,
  applicationIdToUniversalIdentifierMap,
  pageLayoutTabIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
  fieldMetadataIdToUniversalIdentifierMap,
}: FromPageLayoutWidgetEntityToFlatPageLayoutWidgetArgs): FlatPageLayoutWidget => {
  const pageLayoutWidgetEntityWithoutRelations = removePropertiesFromRecord(
    pageLayoutWidgetEntity,
    getMetadataEntityRelationProperties('pageLayoutWidget'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      pageLayoutWidgetEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${pageLayoutWidgetEntity.applicationId} not found for pageLayoutWidget ${pageLayoutWidgetEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const pageLayoutTabUniversalIdentifier =
    pageLayoutTabIdToUniversalIdentifierMap.get(
      pageLayoutWidgetEntity.pageLayoutTabId,
    );

  if (!isDefined(pageLayoutTabUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `PageLayoutTab with id ${pageLayoutWidgetEntity.pageLayoutTabId} not found for pageLayoutWidget ${pageLayoutWidgetEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  let objectMetadataUniversalIdentifier: string | null = null;

  if (isDefined(pageLayoutWidgetEntity.objectMetadataId)) {
    objectMetadataUniversalIdentifier =
      objectMetadataIdToUniversalIdentifierMap.get(
        pageLayoutWidgetEntity.objectMetadataId,
      ) ?? null;

    if (!isDefined(objectMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `ObjectMetadata with id ${pageLayoutWidgetEntity.objectMetadataId} not found for pageLayoutWidget ${pageLayoutWidgetEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  const configurationWithUniversalIdentifiers =
    fromPageLayoutWidgetConfigurationToUniversalConfiguration({
      configuration: pageLayoutWidgetEntityWithoutRelations.configuration,
      fieldMetadataIdToUniversalIdentifierMap,
      pageLayoutWidgetId: pageLayoutWidgetEntity.id,
    });

  return {
    ...pageLayoutWidgetEntityWithoutRelations,
    createdAt: pageLayoutWidgetEntity.createdAt.toISOString(),
    updatedAt: pageLayoutWidgetEntity.updatedAt.toISOString(),
    deletedAt: pageLayoutWidgetEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      pageLayoutWidgetEntityWithoutRelations.universalIdentifier,
    applicationId: pageLayoutWidgetEntityWithoutRelations.applicationId,
    __universal: {
      universalIdentifier: pageLayoutWidgetEntity.universalIdentifier,
      applicationUniversalIdentifier,
      pageLayoutTabUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      gridPosition: pageLayoutWidgetEntityWithoutRelations.gridPosition,
      configuration: configurationWithUniversalIdentifiers,
    },
  };
};
