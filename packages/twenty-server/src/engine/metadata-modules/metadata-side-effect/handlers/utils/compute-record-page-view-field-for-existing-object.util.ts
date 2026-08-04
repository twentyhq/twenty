import { getSystemViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

// Widget-driven view-field builder for the engine-owned record-page view of a
// pre-existing object. Returns undefined (noop) when the engine view is absent,
// when no active FIELDS widget targets it, or when the widget does not opt into
// default visibility for new fields (newFieldDefaultVisibility null or absent).
export const computeRecordPageViewFieldForExistingObject = ({
  sourceFlatFieldMetadata,
  recordPageViewUniversalIdentifier,
  flatViewMaps,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
  flatPageLayoutWidgetMaps,
}: {
  sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
  recordPageViewUniversalIdentifier: string;
} & Pick<
  AllFlatEntityMaps,
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
  | 'flatViewFieldGroupMaps'
  | 'flatPageLayoutWidgetMaps'
>): UniversalFlatViewField | undefined => {
  const recordPageFlatView =
    flatViewMaps.byUniversalIdentifier[recordPageViewUniversalIdentifier];

  if (
    !isDefined(recordPageFlatView) ||
    recordPageFlatView.isSystemSideEffect !== true ||
    isDefined(recordPageFlatView.deletedAt)
  ) {
    return undefined;
  }

  const fieldsWidget = Object.values(
    flatPageLayoutWidgetMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .find(
      (widget) =>
        widget.isActive &&
        !isDefined(widget.deletedAt) &&
        widget.universalConfiguration?.configurationType ===
          WidgetConfigurationType.FIELDS &&
        widget.universalConfiguration.viewUniversalIdentifier ===
          recordPageViewUniversalIdentifier,
    );

  if (
    !isDefined(fieldsWidget) ||
    fieldsWidget.universalConfiguration.configurationType !==
      WidgetConfigurationType.FIELDS
  ) {
    return undefined;
  }

  const { newFieldDefaultVisibility } = fieldsWidget.universalConfiguration;

  if (!isDefined(newFieldDefaultVisibility)) {
    return undefined;
  }

  // New fields append into the last active group; custom objects are created
  // with zero view field groups, so this degrades to no group.
  const activeFlatViewFieldGroups =
    recordPageFlatView.viewFieldGroupUniversalIdentifiers
      .map(
        (viewFieldGroupUniversalIdentifier) =>
          flatViewFieldGroupMaps.byUniversalIdentifier[
            viewFieldGroupUniversalIdentifier
          ],
      )
      .filter(isDefined)
      .filter((group) => group.isActive && !isDefined(group.deletedAt));

  const lastFlatViewFieldGroup =
    activeFlatViewFieldGroups.length > 0
      ? activeFlatViewFieldGroups.reduce((maxGroup, group) =>
          group.position > maxGroup.position ? group : maxGroup,
        )
      : undefined;

  const targetViewFieldGroupUniversalIdentifier =
    lastFlatViewFieldGroup?.universalIdentifier ?? null;

  const existingActivePositions =
    recordPageFlatView.viewFieldUniversalIdentifiers
      .map(
        (viewFieldUniversalIdentifier) =>
          flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier],
      )
      .filter(isDefined)
      .filter(
        (flatViewField) =>
          flatViewField.isActive &&
          !isDefined(flatViewField.deletedAt) &&
          flatViewField.viewFieldGroupUniversalIdentifier ===
            targetViewFieldGroupUniversalIdentifier,
      )
      .map((flatViewField) => flatViewField.position);

  const position =
    existingActivePositions.reduce(
      (maxPosition, existingPosition) =>
        Math.max(maxPosition, existingPosition),
      -1,
    ) + 1;

  const createdAt = new Date().toISOString();
  const { applicationUniversalIdentifier } = sourceFlatFieldMetadata;

  return {
    universalIdentifier: getSystemViewFieldUniversalIdentifier({
      fieldMetadataApplicationUniversalIdentifier:
        applicationUniversalIdentifier,
      viewUniversalIdentifier: recordPageViewUniversalIdentifier,
      fieldMetadataUniversalIdentifier:
        sourceFlatFieldMetadata.universalIdentifier,
    }),
    applicationUniversalIdentifier,
    fieldMetadataUniversalIdentifier:
      sourceFlatFieldMetadata.universalIdentifier,
    viewUniversalIdentifier: recordPageViewUniversalIdentifier,
    viewFieldGroupUniversalIdentifier: targetViewFieldGroupUniversalIdentifier,
    isVisible: newFieldDefaultVisibility,
    size: DEFAULT_VIEW_FIELD_SIZE,
    position,
    aggregateOperation: null,
    isActive: true,
    isSystemSideEffect: true,
    universalOverrides: null,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
  };
};
