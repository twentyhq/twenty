import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { validateWidgetConfigurationInput } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-input.util';

export type FromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreateArgs =
  {
    createPageLayoutWidgetInput: CreatePageLayoutWidgetInput;
    workspaceId: string;
    flatApplication: FlatApplication;
  } & Pick<AllFlatEntityMaps, 'flatPageLayoutTabMaps' | 'flatObjectMetadataMaps'>;

export const fromCreatePageLayoutWidgetInputToFlatPageLayoutWidgetToCreate = ({
  createPageLayoutWidgetInput: rawCreatePageLayoutWidgetInput,
  workspaceId,
  flatApplication,
  flatPageLayoutTabMaps,
  flatObjectMetadataMaps,
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

  const flatPageLayoutTab = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatPageLayoutTabMaps,
    flatEntityId: pageLayoutTabId,
  });

  let objectMetadataUniversalIdentifier: string | null = null;

  if (isDefined(createPageLayoutWidgetInput.objectMetadataId)) {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: createPageLayoutWidgetInput.objectMetadataId,
    });

    objectMetadataUniversalIdentifier = flatObjectMetadata.universalIdentifier;
  }

  return {
    id: pageLayoutWidgetId,
    pageLayoutTabId,
    pageLayoutTabUniversalIdentifier: flatPageLayoutTab.universalIdentifier,
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
  };
};
