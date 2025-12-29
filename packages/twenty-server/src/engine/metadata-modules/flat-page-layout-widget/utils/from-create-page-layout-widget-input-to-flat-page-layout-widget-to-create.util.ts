import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout-widget.input';
import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';
import { validateAndTransformWidgetConfiguration } from 'src/engine/metadata-modules/page-layout/utils/validate-and-transform-widget-configuration.util';

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

  const configuration = await validateAndTransformWidgetConfiguration({
    type: createPageLayoutWidgetInput.type,
    configuration: createPageLayoutWidgetInput.configuration,
    isDashboardV2Enabled: false,
  });

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
