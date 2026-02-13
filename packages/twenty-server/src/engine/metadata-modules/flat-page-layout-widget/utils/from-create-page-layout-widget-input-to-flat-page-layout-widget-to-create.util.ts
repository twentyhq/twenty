import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { validateWidgetConfigurationInput } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-input.util';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export type FromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreateArgs =
  {
    createPageLayoutWidgetInput: CreatePageLayoutWidgetInput;
    flatApplication: FlatApplication;
  } & Pick<
    AllFlatEntityMaps,
    'flatPageLayoutTabMaps' | 'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
  >;

export const fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate = ({
  createPageLayoutWidgetInput: rawCreatePageLayoutWidgetInput,
  flatApplication,
  flatPageLayoutTabMaps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: FromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreateArgs): UniversalFlatPageLayoutWidget => {
  const { pageLayoutTabId, ...createPageLayoutWidgetInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreatePageLayoutWidgetInput,
      ['pageLayoutTabId'],
    );

  validateWidgetConfigurationInput({
    configuration: createPageLayoutWidgetInput.configuration,
  });

  const createdAt = new Date().toISOString();

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
    pageLayoutTabUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: v4(),
    title: createPageLayoutWidgetInput.title,
    type: createPageLayoutWidgetInput.type,
    objectMetadataUniversalIdentifier,
    gridPosition: createPageLayoutWidgetInput.gridPosition,
    position: createPageLayoutWidgetInput.position ?? null,
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
