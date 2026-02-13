import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type CreatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/create-page-layout-tab.input';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';

export type FromCreatePageLayoutTabInputToFlatPageLayoutTabToCreateArgs = {
  createPageLayoutTabInput: CreatePageLayoutTabInput;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatPageLayoutMaps'>;

export const fromCreatePageLayoutTabInputToFlatPageLayoutTabToCreate = ({
  createPageLayoutTabInput: rawCreatePageLayoutTabInput,
  flatApplication,
  flatPageLayoutMaps,
}: FromCreatePageLayoutTabInputToFlatPageLayoutTabToCreateArgs): UniversalFlatPageLayoutTab => {
  const createPageLayoutTabInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreatePageLayoutTabInput,
      ['title'],
    );

  const createdAt = new Date().toISOString();

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
    title: createPageLayoutTabInput.title,
    position: createPageLayoutTabInput.position ?? 0,
    pageLayoutUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: v4(),
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    widgetUniversalIdentifiers: [],
    icon: null,
    layoutMode: PageLayoutTabLayoutMode.GRID,
  };
};
