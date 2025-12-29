import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

export type FromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreateArgs =
  {
    createPageLayoutWidgetInput: CreatePageLayoutWidgetInput;
    workspaceId: string;
    workspaceCustomApplicationId: string;
  };

export const fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate = ({
  createPageLayoutWidgetInput: rawCreatePageLayoutWidgetInput,
  workspaceId,
  workspaceCustomApplicationId,
}: FromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreateArgs): FlatPageLayoutWidget => {
  const { pageLayoutTabId, ...createPageLayoutWidgetInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreatePageLayoutWidgetInput,
      ['pageLayoutTabId'],
    );

  const createdAt = new Date().toISOString();
  const pageLayoutWidgetId = v4();

  return {
    id: pageLayoutWidgetId,
    pageLayoutTabId,
    workspaceId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: pageLayoutWidgetId,
    title: createPageLayoutWidgetInput.title,
    type: createPageLayoutWidgetInput.type ?? WidgetType.VIEW,
    objectMetadataId: createPageLayoutWidgetInput.objectMetadataId ?? null,
    gridPosition: createPageLayoutWidgetInput.gridPosition,
    configuration: createPageLayoutWidgetInput.configuration,
    applicationId: workspaceCustomApplicationId,
  };
};
