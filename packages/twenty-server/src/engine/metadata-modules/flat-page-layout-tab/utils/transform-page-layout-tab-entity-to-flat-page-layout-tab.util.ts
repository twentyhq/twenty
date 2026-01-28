import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

type TransformPageLayoutTabEntityToFlatPageLayoutTabArgs = {
  pageLayoutTabEntity: EntityWithRegroupedOneToManyRelations<PageLayoutTabEntity>;
  applicationIdToUniversalIdentifierMap: Map<string, string>;
  pageLayoutIdToUniversalIdentifierMap: Map<string, string>;
};

export const transformPageLayoutTabEntityToFlatPageLayoutTab = ({
  pageLayoutTabEntity,
  applicationIdToUniversalIdentifierMap,
  pageLayoutIdToUniversalIdentifierMap,
}: TransformPageLayoutTabEntityToFlatPageLayoutTabArgs): FlatPageLayoutTab => {
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
    __universal: {
      universalIdentifier: pageLayoutTabEntity.universalIdentifier,
      applicationUniversalIdentifier,
      pageLayoutUniversalIdentifier,
      widgetUniversalIdentifiers: pageLayoutTabEntity.widgets.map(
        (widget) => widget.universalIdentifier,
      ),
    },
  };
};
