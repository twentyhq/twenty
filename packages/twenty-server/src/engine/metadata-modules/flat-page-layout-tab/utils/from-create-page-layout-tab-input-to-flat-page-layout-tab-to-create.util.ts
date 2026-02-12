import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
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

  const { pageLayoutUniversalIdentifier } =
    resolveEntityRelationUniversalIdentifiers({
      flatEntityMaps: {
        flatPageLayoutMaps,
      },
      foreignKeyValues: {
        pageLayoutId: createPageLayoutTabInput.pageLayoutId,
      },
      metadataName: 'pageLayoutTab',
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
