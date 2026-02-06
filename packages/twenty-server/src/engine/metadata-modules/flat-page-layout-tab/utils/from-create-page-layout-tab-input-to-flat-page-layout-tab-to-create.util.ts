import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveUniversalIdentifierFromFlatEntityIdOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/resolve-universal-identifier-from-flat-entity-id-or-throw.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type CreatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/create-page-layout-tab.input';

export type FromCreatePageLayoutTabInputToFlatPageLayoutTabToCreateArgs = {
  createPageLayoutTabInput: CreatePageLayoutTabInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatPageLayoutMaps'>;

export const fromCreatePageLayoutTabInputToFlatPageLayoutTabToCreate = ({
  createPageLayoutTabInput: rawCreatePageLayoutTabInput,
  workspaceId,
  flatApplication,
  flatPageLayoutMaps,
}: FromCreatePageLayoutTabInputToFlatPageLayoutTabToCreateArgs): FlatPageLayoutTab => {
  const createPageLayoutTabInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreatePageLayoutTabInput,
      ['title'],
    );

  const createdAt = new Date().toISOString();
  const pageLayoutTabId = v4();

  const pageLayoutUniversalIdentifier =
    resolveUniversalIdentifierFromFlatEntityIdOrThrow({
      flatEntityMaps: flatPageLayoutMaps,
      flatEntityId: createPageLayoutTabInput.pageLayoutId,
      metadataName: 'pageLayout',
    });

  return {
    id: pageLayoutTabId,
    title: createPageLayoutTabInput.title,
    position: createPageLayoutTabInput.position ?? 0,
    pageLayoutId: createPageLayoutTabInput.pageLayoutId,
    pageLayoutUniversalIdentifier,
    workspaceId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: pageLayoutTabId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    widgetIds: [],
    widgetUniversalIdentifiers: [],
    icon: null,
    layoutMode: PageLayoutTabLayoutMode.GRID,
  };
};
