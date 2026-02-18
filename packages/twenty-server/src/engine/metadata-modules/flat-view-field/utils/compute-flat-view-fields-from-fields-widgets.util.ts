import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { type FieldsConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/fields-configuration.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

type FieldToCreateInfo = {
  objectMetadataUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
};

const isFieldsWidgetConfiguration = (
  configuration: AllPageLayoutWidgetConfiguration,
): configuration is FieldsConfigurationDTO => {
  return (
    isDefined(configuration) &&
    configuration.configurationType === WidgetConfigurationType.FIELDS
  );
};

const getMatchingFieldsWidgets = ({
  objectMetadataUniversalIdentifier,
  flatPageLayoutWidgetMaps,
}: {
  objectMetadataUniversalIdentifier: string;
  flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
}): FlatPageLayoutWidget[] =>
  Object.values(flatPageLayoutWidgetMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (widget) =>
        !isDefined(widget.deletedAt) &&
        widget.type === WidgetType.FIELDS &&
        widget.objectMetadataUniversalIdentifier ===
          objectMetadataUniversalIdentifier &&
        isFieldsWidgetConfiguration(widget.configuration) &&
        isDefined(widget.configuration.viewId) &&
        isDefined(widget.configuration.newFieldDefaultConfiguration),
    );

const computeNextPosition = ({
  viewId,
  viewFieldGroupId,
  flatViewFieldMaps,
}: {
  viewId: string;
  viewFieldGroupId: string | null;
  flatViewFieldMaps: FlatViewFieldMaps;
}): number => {
  const existingViewFields = Object.values(
    flatViewFieldMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (viewField: FlatViewField) =>
        !isDefined(viewField.deletedAt) && viewField.viewId === viewId,
    )
    .filter(
      (viewField: FlatViewField) =>
        viewField.viewFieldGroupId === viewFieldGroupId,
    );

  if (existingViewFields.length === 0) {
    return 0;
  }

  const maxPosition = Math.max(
    ...existingViewFields.map((viewField) => viewField.position),
  );

  return maxPosition + 1;
};

export const computeFlatViewFieldsFromFieldsWidgets = ({
  fieldsToCreate,
  flatPageLayoutWidgetMaps,
  flatViewFieldMaps,
  flatViewMaps,
  flatViewFieldGroupMaps,
  applicationUniversalIdentifier,
}: {
  fieldsToCreate: FieldToCreateInfo[];
  flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
  flatViewFieldMaps: FlatViewFieldMaps;
  flatViewMaps: FlatViewMaps;
  flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
  applicationUniversalIdentifier: string;
}): UniversalFlatViewField[] => {
  const flatViewFieldsToCreate: UniversalFlatViewField[] = [];
  const now = new Date().toISOString();

  const objectMetadataUniversalIdentifiers = [
    ...new Set(
      fieldsToCreate.map((field) => field.objectMetadataUniversalIdentifier),
    ),
  ];

  const nextPositionByKey = new Map<string, number>();

  for (const objectMetadataUniversalIdentifier of objectMetadataUniversalIdentifiers) {
    const matchingWidgets = getMatchingFieldsWidgets({
      objectMetadataUniversalIdentifier,
      flatPageLayoutWidgetMaps,
    });

    const fieldsForObject = fieldsToCreate.filter(
      (field) =>
        field.objectMetadataUniversalIdentifier ===
        objectMetadataUniversalIdentifier,
    );

    for (const widget of matchingWidgets) {
      if (!isFieldsWidgetConfiguration(widget.configuration)) {
        continue;
      }

      const configuration = widget.configuration;

      const viewId = configuration.viewId!;
      const { isVisible, viewFieldGroupId } =
        configuration.newFieldDefaultConfiguration!;

      const viewUniversalIdentifier =
        flatViewMaps.universalIdentifierById[viewId] ?? null;

      if (!isDefined(viewUniversalIdentifier)) {
        continue;
      }

      const viewFieldGroupUniversalIdentifier = isDefined(viewFieldGroupId)
        ? (flatViewFieldGroupMaps.universalIdentifierById[viewFieldGroupId] ??
          null)
        : null;

      const positionKey = `${viewId}:${viewFieldGroupId ?? 'null'}`;

      if (!nextPositionByKey.has(positionKey)) {
        nextPositionByKey.set(
          positionKey,
          computeNextPosition({
            viewId,
            viewFieldGroupId,
            flatViewFieldMaps,
          }),
        );
      }

      for (const field of fieldsForObject) {
        const position = nextPositionByKey.get(positionKey)!;

        nextPositionByKey.set(positionKey, position + 1);

        flatViewFieldsToCreate.push({
          universalIdentifier: v4(),
          applicationUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            field.fieldMetadataUniversalIdentifier,
          viewUniversalIdentifier,
          viewFieldGroupUniversalIdentifier,
          isVisible,
          size: DEFAULT_VIEW_FIELD_SIZE,
          position,
          aggregateOperation: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        });
      }
    }
  }

  return flatViewFieldsToCreate;
};
