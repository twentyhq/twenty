import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

export type FromCreatePageLayoutInputToFlatPageLayoutToCreateArgs = {
  createPageLayoutInput: CreatePageLayoutInput;
  workspaceId: string;
  workspaceCustomApplicationId: string;
};

export const fromCreatePageLayoutInputToFlatPageLayoutToCreate = ({
  createPageLayoutInput: rawCreatePageLayoutInput,
  workspaceId,
  workspaceCustomApplicationId,
}: FromCreatePageLayoutInputToFlatPageLayoutToCreateArgs): FlatPageLayout => {
  const createPageLayoutInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreatePageLayoutInput,
      ['name'],
    );

  const createdAt = new Date().toISOString();
  const pageLayoutId = v4();

  return {
    id: pageLayoutId,
    name: createPageLayoutInput.name,
    type: createPageLayoutInput.type ?? PageLayoutType.RECORD_PAGE,
    objectMetadataId: createPageLayoutInput.objectMetadataId ?? null,
    workspaceId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: pageLayoutId,
    applicationId: workspaceCustomApplicationId,
    tabIds: [],
  };
};
