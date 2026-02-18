import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-widget/constants/flat-page-layout-widget-editable-properties.constant';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { type UpdatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget.input';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validateWidgetConfigurationInput } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-input.util';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export type UpdatePageLayoutWidgetInputWithId = {
  id: string;
  update: UpdatePageLayoutWidgetInput;
};

export const fromUpdatePageLayoutWidgetInputToFlatPageLayoutWidgetToUpdateOrThrow =
  ({
    updatePageLayoutWidgetInput: rawUpdatePageLayoutWidgetInput,
    flatPageLayoutWidgetMaps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatViewFieldGroupMaps,
  }: {
    updatePageLayoutWidgetInput: UpdatePageLayoutWidgetInputWithId;
    flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatViewFieldGroupMaps'
  >): FlatPageLayoutWidget => {
    const { id: pageLayoutWidgetToUpdateId } =
      extractAndSanitizeObjectStringFields(rawUpdatePageLayoutWidgetInput, [
        'id',
      ]);

    const existingFlatPageLayoutWidgetToUpdate =
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: pageLayoutWidgetToUpdateId,
        flatEntityMaps: flatPageLayoutWidgetMaps,
      });

    if (!isDefined(existingFlatPageLayoutWidgetToUpdate)) {
      throw new PageLayoutWidgetException(
        t`Page layout widget to update not found`,
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
      rawUpdatePageLayoutWidgetInput.update,
      FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES,
    );

    if (
      Object.prototype.hasOwnProperty.call(
        updatedEditableFieldProperties,
        'configuration',
      )
    ) {
      validateWidgetConfigurationInput({
        configuration: updatedEditableFieldProperties.configuration,
      });
    }

    const flatPageLayoutWidgetToUpdate = mergeUpdateInExistingRecord({
      existing: existingFlatPageLayoutWidgetToUpdate,
      properties: FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES,
      update: updatedEditableFieldProperties,
    });

    if (updatedEditableFieldProperties.objectMetadataId !== undefined) {
      const { objectMetadataUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'pageLayoutWidget',
          foreignKeyValues: {
            objectMetadataId: flatPageLayoutWidgetToUpdate.objectMetadataId,
          },
          flatEntityMaps: { flatObjectMetadataMaps },
        });

      flatPageLayoutWidgetToUpdate.objectMetadataUniversalIdentifier =
        objectMetadataUniversalIdentifier;
    }

    if (isDefined(updatedEditableFieldProperties.configuration)) {
      flatPageLayoutWidgetToUpdate.universalConfiguration =
        fromPageLayoutWidgetConfigurationToUniversalConfiguration({
          configuration: flatPageLayoutWidgetToUpdate.configuration,
          fieldMetadataUniversalIdentifierById:
            flatFieldMetadataMaps.universalIdentifierById,
          viewFieldGroupUniversalIdentifierById:
            flatViewFieldGroupMaps.universalIdentifierById,
        });
    }

    return flatPageLayoutWidgetToUpdate;
  };
