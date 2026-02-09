import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const transformPageLayoutTabEntityToFlatPageLayoutTab = ({
  entity: pageLayoutTabEntity,
  applicationIdToUniversalIdentifierMap,
  pageLayoutIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'pageLayoutTab'>): FlatPageLayoutTab => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      pageLayoutTabEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${pageLayoutTabEntity.applicationId} not found for pageLayoutTab ${pageLayoutTabEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const pageLayoutUniversalIdentifier =
    pageLayoutIdToUniversalIdentifierMap.get(pageLayoutTabEntity.pageLayoutId);

  if (!isDefined(pageLayoutUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `PageLayout with id ${pageLayoutTabEntity.pageLayoutId} not found for pageLayoutTab ${pageLayoutTabEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    createdAt: pageLayoutTabEntity.createdAt.toISOString(),
    deletedAt: pageLayoutTabEntity.deletedAt?.toISOString() ?? null,
    updatedAt: pageLayoutTabEntity.updatedAt.toISOString(),
    id: pageLayoutTabEntity.id,
    title: pageLayoutTabEntity.title,
    position: pageLayoutTabEntity.position,
    pageLayoutId: pageLayoutTabEntity.pageLayoutId,
    workspaceId: pageLayoutTabEntity.workspaceId,
    universalIdentifier: pageLayoutTabEntity.universalIdentifier,
    applicationId: pageLayoutTabEntity.applicationId,
    widgetIds: pageLayoutTabEntity.widgets.map((widget) => widget.id),
    icon: pageLayoutTabEntity.icon,
    layoutMode: pageLayoutTabEntity.layoutMode,
    applicationUniversalIdentifier,
    pageLayoutUniversalIdentifier,
    widgetUniversalIdentifiers: pageLayoutTabEntity.widgets.map(
      (widget) => widget.universalIdentifier,
    ),
  };
};
