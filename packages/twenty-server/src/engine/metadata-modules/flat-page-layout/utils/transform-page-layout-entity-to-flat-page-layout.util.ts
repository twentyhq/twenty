import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const transformPageLayoutEntityToFlatPageLayout = ({
  entity: pageLayoutEntity,
  applicationIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
  pageLayoutTabIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'pageLayout'>): FlatPageLayout => {
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

  let defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: string | null =
    null;

  if (isDefined(pageLayoutEntity.defaultTabToFocusOnMobileAndSidePanelId)) {
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier =
      pageLayoutTabIdToUniversalIdentifierMap.get(
        pageLayoutEntity.defaultTabToFocusOnMobileAndSidePanelId,
      ) ?? null;

    if (!isDefined(defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `PageLayoutTab with id ${pageLayoutEntity.defaultTabToFocusOnMobileAndSidePanelId} not found for pageLayout ${pageLayoutEntity.id}`,
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
    defaultTabToFocusOnMobileAndSidePanelId:
      pageLayoutEntity.defaultTabToFocusOnMobileAndSidePanelId,
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    tabUniversalIdentifiers: pageLayoutEntity.tabs.map(
      (tab) => tab.universalIdentifier,
    ),
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
  };
};
