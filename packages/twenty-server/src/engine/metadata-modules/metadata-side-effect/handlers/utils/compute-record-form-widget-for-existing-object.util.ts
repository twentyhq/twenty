import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildSystemFormFieldPageLayoutWidget } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/build-system-form-field-page-layout-widget.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

type RecordFormWidgetFlatFieldMetadata = Pick<
  UniversalFlatFieldMetadata,
  | 'universalIdentifier'
  | 'applicationUniversalIdentifier'
  | 'objectMetadataUniversalIdentifier'
>;

export const computeRecordFormWidgetForExistingObject = ({
  sourceFlatFieldMetadata,
  orderedFormFlatFieldMetadatasInBatch,
  recordFormPageLayoutTabUniversalIdentifier,
  flatPageLayoutTabMaps,
  flatPageLayoutWidgetMaps,
}: {
  sourceFlatFieldMetadata: RecordFormWidgetFlatFieldMetadata;
  orderedFormFlatFieldMetadatasInBatch: Pick<
    UniversalFlatFieldMetadata,
    'universalIdentifier'
  >[];
  recordFormPageLayoutTabUniversalIdentifier: string;
  flatPageLayoutTabMaps: {
    byUniversalIdentifier: Partial<
      Record<
        string,
        Pick<
          UniversalFlatPageLayoutTab,
          'isSystemSideEffect' | 'deletedAt' | 'widgetUniversalIdentifiers'
        >
      >
    >;
  };
  flatPageLayoutWidgetMaps: {
    byUniversalIdentifier: Partial<
      Record<
        string,
        Pick<
          UniversalFlatPageLayoutWidget,
          'deletedAt' | 'universalConfiguration' | 'position'
        >
      >
    >;
  };
}): UniversalFlatPageLayoutWidget | undefined => {
  const recordFormFlatPageLayoutTab =
    flatPageLayoutTabMaps.byUniversalIdentifier[
      recordFormPageLayoutTabUniversalIdentifier
    ];

  if (
    !isDefined(recordFormFlatPageLayoutTab) ||
    !recordFormFlatPageLayoutTab.isSystemSideEffect ||
    isDefined(recordFormFlatPageLayoutTab.deletedAt)
  ) {
    return undefined;
  }

  const tabFormFieldWidgets =
    recordFormFlatPageLayoutTab.widgetUniversalIdentifiers
      .map(
        (widgetUniversalIdentifier) =>
          flatPageLayoutWidgetMaps.byUniversalIdentifier[
            widgetUniversalIdentifier
          ],
      )
      .filter(isDefined)
      .filter(
        (flatPageLayoutWidget) =>
          !isDefined(flatPageLayoutWidget.deletedAt) &&
          flatPageLayoutWidget.universalConfiguration?.configurationType ===
            WidgetConfigurationType.FORM_FIELD,
      );

  const pairAlreadySynced = tabFormFieldWidgets.some(
    (flatPageLayoutWidget) =>
      flatPageLayoutWidget.universalConfiguration.configurationType ===
        WidgetConfigurationType.FORM_FIELD &&
      flatPageLayoutWidget.universalConfiguration.fieldMetadataId ===
        sourceFlatFieldMetadata.universalIdentifier,
  );

  if (pairAlreadySynced) {
    return undefined;
  }

  const lastExistingIndex = tabFormFieldWidgets.reduce(
    (maxIndex, flatPageLayoutWidget) =>
      flatPageLayoutWidget.position?.layoutMode ===
      PageLayoutTabLayoutMode.VERTICAL_LIST
        ? Math.max(maxIndex, flatPageLayoutWidget.position.index)
        : maxIndex,
    -1,
  );

  const rankInBatch = orderedFormFlatFieldMetadatasInBatch.findIndex(
    (flatFieldMetadata) =>
      flatFieldMetadata.universalIdentifier ===
      sourceFlatFieldMetadata.universalIdentifier,
  );

  if (rankInBatch === -1) {
    return undefined;
  }

  return buildSystemFormFieldPageLayoutWidget({
    applicationUniversalIdentifier:
      sourceFlatFieldMetadata.applicationUniversalIdentifier,
    pageLayoutTabUniversalIdentifier:
      recordFormPageLayoutTabUniversalIdentifier,
    objectMetadataUniversalIdentifier:
      sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
    flatFieldMetadata: sourceFlatFieldMetadata,
    index: lastExistingIndex + 1 + rankInBatch,
  });
};
