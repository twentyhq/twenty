import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { buildFlatPageLayoutWidgetCommonProperties } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/build-flat-page-layout-widget-common-properties.util';
import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { validateWidgetConfigurationInput } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-input.util';

export type FromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreateArgs =
  {
    createPageLayoutWidgetInput: CreatePageLayoutWidgetInput;
    workspaceId: string;
    flatApplication: FlatApplication;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatPageLayoutTabMaps'
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatFrontComponentMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatViewMaps'
  >;

export const fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate = ({
  createPageLayoutWidgetInput: rawCreatePageLayoutWidgetInput,
  workspaceId,
  flatApplication,
  flatPageLayoutTabMaps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatFrontComponentMaps,
  flatViewFieldGroupMaps,
  flatViewMaps,
}: FromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreateArgs): FlatPageLayoutWidget => {
  const { pageLayoutTabId, ...createPageLayoutWidgetInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreatePageLayoutWidgetInput,
      ['pageLayoutTabId'],
    );

  validateWidgetConfigurationInput({
    configuration: createPageLayoutWidgetInput.configuration,
  });

  const createdAt = new Date().toISOString();
  const pageLayoutWidgetId = v4();

  const commonProperties = buildFlatPageLayoutWidgetCommonProperties({
    widgetInput: {
      pageLayoutTabId,
      title: createPageLayoutWidgetInput.title,
      type: createPageLayoutWidgetInput.type,
      objectMetadataId: createPageLayoutWidgetInput.objectMetadataId,
      gridPosition: createPageLayoutWidgetInput.gridPosition,
      position: createPageLayoutWidgetInput.position,
    },
    flatPageLayoutTabMaps,
    flatObjectMetadataMaps,
  });

  return {
    id: pageLayoutWidgetId,
    ...commonProperties,
    workspaceId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: pageLayoutWidgetId,
    configuration: createPageLayoutWidgetInput.configuration,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    conditionalDisplay: null,
    universalConfiguration:
      fromPageLayoutWidgetConfigurationToUniversalConfiguration({
        configuration: createPageLayoutWidgetInput.configuration,
        fieldMetadataUniversalIdentifierById:
          flatFieldMetadataMaps.universalIdentifierById,
        frontComponentUniversalIdentifierById:
          flatFrontComponentMaps.universalIdentifierById,
        viewFieldGroupUniversalIdentifierById:
          flatViewFieldGroupMaps.universalIdentifierById,
        viewUniversalIdentifierById: flatViewMaps.universalIdentifierById,
        shouldThrowOnMissingIdentifier: true,
      }),
  };
};
