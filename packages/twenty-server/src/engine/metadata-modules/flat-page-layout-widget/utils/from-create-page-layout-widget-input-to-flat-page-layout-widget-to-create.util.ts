import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
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
    'flatPageLayoutTabMaps' | 'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
  >;

export const fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate = ({
  createPageLayoutWidgetInput: rawCreatePageLayoutWidgetInput,
  workspaceId,
  flatApplication,
  flatPageLayoutTabMaps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
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

  const {
    pageLayoutTabUniversalIdentifier,
    objectMetadataUniversalIdentifier,
  } = resolveEntityRelationUniversalIdentifiers({
    metadataName: 'pageLayoutWidget',
    foreignKeyValues: {
      pageLayoutTabId,
      objectMetadataId: createPageLayoutWidgetInput.objectMetadataId,
    },
    flatEntityMaps: { flatPageLayoutTabMaps, flatObjectMetadataMaps },
  });

  return {
    id: pageLayoutWidgetId,
    pageLayoutTabId,
    pageLayoutTabUniversalIdentifier,
    workspaceId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: pageLayoutWidgetId,
    title: createPageLayoutWidgetInput.title,
    type: createPageLayoutWidgetInput.type,
    objectMetadataId: createPageLayoutWidgetInput.objectMetadataId ?? null,
    objectMetadataUniversalIdentifier,
    gridPosition: createPageLayoutWidgetInput.gridPosition,
    position: createPageLayoutWidgetInput.position ?? null,
    configuration: createPageLayoutWidgetInput.configuration,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    conditionalDisplay: null,
    universalConfiguration:
      fromPageLayoutWidgetConfigurationToUniversalConfiguration({
        configuration: createPageLayoutWidgetInput.configuration,
        fieldMetadataUniversalIdentifierById:
          flatFieldMetadataMaps.universalIdentifierById,
        shouldThrowOnMissingIdentifier: true,
      }),
  };
};
