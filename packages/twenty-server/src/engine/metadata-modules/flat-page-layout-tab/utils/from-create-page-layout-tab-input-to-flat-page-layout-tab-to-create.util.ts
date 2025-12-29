import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type CreatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/create-page-layout-tab.input';

export type FromCreatePageLayoutTabInputToFlatPageLayoutTabToCreateArgs = {
  createPageLayoutTabInput: CreatePageLayoutTabInput;
  workspaceId: string;
  workspaceCustomApplicationId: string;
};

export const fromCreatePageLayoutTabInputToFlatPageLayoutTabToCreate = ({
  createPageLayoutTabInput: rawCreatePageLayoutTabInput,
  workspaceId,
  workspaceCustomApplicationId,
}: FromCreatePageLayoutTabInputToFlatPageLayoutTabToCreateArgs): FlatPageLayoutTab => {
  const createPageLayoutTabInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreatePageLayoutTabInput,
      ['title'],
    );

  const createdAt = new Date().toISOString();
  const pageLayoutTabId = v4();

  return {
    id: pageLayoutTabId,
    title: createPageLayoutTabInput.title,
    position: createPageLayoutTabInput.position ?? 0,
    pageLayoutId: createPageLayoutTabInput.pageLayoutId,
    workspaceId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: pageLayoutTabId,
    applicationId: workspaceCustomApplicationId,
    widgetIds: [],
  };
};
