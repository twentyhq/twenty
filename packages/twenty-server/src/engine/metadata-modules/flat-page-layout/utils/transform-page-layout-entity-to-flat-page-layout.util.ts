import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

type TransformPageLayoutEntityToFlatPageLayoutArgs = {
  pageLayoutEntity: EntityWithRegroupedOneToManyRelations<PageLayoutEntity>;
  applicationIdToUniversalIdentifierMap: Map<string, string>;
  objectMetadataIdToUniversalIdentifierMap: Map<string, string>;
};

export const transformPageLayoutEntityToFlatPageLayout = ({
  pageLayoutEntity,
  applicationIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
}: TransformPageLayoutEntityToFlatPageLayoutArgs): FlatPageLayout => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(pageLayoutEntity.applicationId);

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${pageLayoutEntity.applicationId} not found for pageLayout ${pageLayoutEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  let objectMetadataUniversalIdentifier: string | null = null;

  if (isDefined(pageLayoutEntity.objectMetadataId)) {
    objectMetadataUniversalIdentifier =
      objectMetadataIdToUniversalIdentifierMap.get(
        pageLayoutEntity.objectMetadataId,
      ) ?? null;

    if (!isDefined(objectMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `ObjectMetadata with id ${pageLayoutEntity.objectMetadataId} not found for pageLayout ${pageLayoutEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  return {
    createdAt: pageLayoutEntity.createdAt.toISOString(),
    deletedAt: pageLayoutEntity.deletedAt?.toISOString() ?? null,
    updatedAt: pageLayoutEntity.updatedAt.toISOString(),
    id: pageLayoutEntity.id,
    name: pageLayoutEntity.name,
    type: pageLayoutEntity.type,
    objectMetadataId: pageLayoutEntity.objectMetadataId,
    workspaceId: pageLayoutEntity.workspaceId,
    universalIdentifier: pageLayoutEntity.universalIdentifier,
    applicationId: pageLayoutEntity.applicationId,
    tabIds: pageLayoutEntity.tabs.map((tab) => tab.id),
    __universal: {
      universalIdentifier: pageLayoutEntity.universalIdentifier,
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      tabUniversalIdentifiers: pageLayoutEntity.tabs.map(
        (tab) => tab.universalIdentifier,
      ),
    },
  };
};
