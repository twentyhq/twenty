import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { pickMorphRelationRepresentative } from 'src/engine/metadata-modules/flat-field-metadata/utils/pick-morph-relation-representative.util';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-field/utils/from-update-view-field-input-to-flat-view-field-to-update-or-throw.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

type MorphRelationField = FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

export type MorphRelationHeadSwitchOperations = {
  morphIdsWithoutHead: string[];
  viewFieldsToCreate: FlatViewField[];
  viewFieldsToUpdate: UniversalFlatViewField[];
  viewFieldsToDelete: FlatViewField[];
  viewFiltersToUpdate: FlatViewFilter[];
  viewSortsToUpdate: FlatViewSort[];
  fieldPermissionsToUpdate: FlatFieldPermission[];
  pageLayoutWidgetsToUpdate: FlatPageLayoutWidget[];
};

const findLegacyMorphRelationRepresentative = (
  targets: MorphRelationField[],
): MorphRelationField | undefined => {
  const representative = pickMorphRelationRepresentative({
    morphFlatFieldMetadatas: targets.map((target) =>
      resolveEffectiveFlatEntity({
        metadataName: 'fieldMetadata',
        flatEntity: target,
      }),
    ),
    isMorphRelationHeadEnabled: false,
  });

  return targets.find((target) => target.id === representative?.id);
};

export const buildMorphRelationHeadSwitchOperations = ({
  isMorphRelationHeadEnabled,
  workspaceCustomApplicationUniversalIdentifier,
  flatFieldMetadataMaps,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
  flatViewFilterMaps,
  flatViewSortMaps,
  flatFieldPermissionMaps,
  flatPageLayoutWidgetMaps,
}: {
  isMorphRelationHeadEnabled: boolean;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatViewFieldMaps: FlatEntityMaps<FlatViewField>;
  flatViewFieldGroupMaps: FlatEntityMaps<FlatViewFieldGroup>;
  flatViewFilterMaps: FlatEntityMaps<FlatViewFilter>;
  flatViewSortMaps: FlatEntityMaps<FlatViewSort>;
  flatFieldPermissionMaps: FlatEntityMaps<FlatFieldPermission>;
  flatPageLayoutWidgetMaps: FlatEntityMaps<FlatPageLayoutWidget>;
}): MorphRelationHeadSwitchOperations => {
  const morphRelationFieldsByMorphId = new Map<string, MorphRelationField[]>();

  for (const field of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (
      isDefined(field) &&
      isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)
    ) {
      morphRelationFieldsByMorphId.set(field.morphId, [
        ...(morphRelationFieldsByMorphId.get(field.morphId) ?? []),
        field,
      ]);
    }
  }

  const destinationFieldByOriginFieldId = new Map<string, MorphRelationField>();
  const morphIdsWithoutHead: string[] = [];

  for (const morphRelationFields of morphRelationFieldsByMorphId.values()) {
    const head: MorphRelationField | undefined =
      morphRelationFields.find(isMorphRelationHead);
    const representative = findLegacyMorphRelationRepresentative(
      morphRelationFields.filter((field) => !isMorphRelationHead(field)),
    );

    if (!isDefined(representative)) {
      continue;
    }

    if (!isDefined(head)) {
      morphIdsWithoutHead.push(representative.morphId);
      continue;
    }

    if (isMorphRelationHeadEnabled) {
      destinationFieldByOriginFieldId.set(representative.id, head);
    } else {
      destinationFieldByOriginFieldId.set(head.id, representative);
    }
  }

  const findDestination = (fieldMetadataId: string | null | undefined) =>
    isDefined(fieldMetadataId)
      ? destinationFieldByOriginFieldId.get(fieldMetadataId)
      : undefined;

  const viewFields = Object.values(flatViewFieldMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((viewField) => !isDefined(viewField.deletedAt));
  const viewFieldByViewAndFieldId = new Map(
    viewFields.map((viewField) => [
      `${viewField.viewId}:${viewField.fieldMetadataId}`,
      viewField,
    ]),
  );

  const viewFieldsToCreate: FlatViewField[] = [];
  const viewFieldsToUpdate: UniversalFlatViewField[] = [];
  const viewFieldsToDelete: FlatViewField[] = [];

  for (const viewField of viewFields) {
    const destination = findDestination(viewField.fieldMetadataId);

    if (!isDefined(destination)) {
      continue;
    }

    if (!isMorphRelationHeadEnabled) {
      viewFieldsToDelete.push(viewField);
    }

    const destinationKey = `${viewField.viewId}:${destination.id}`;
    const destinationViewField = viewFieldByViewAndFieldId.get(destinationKey);
    const { isVisible, size, position, aggregateOperation, viewFieldGroupId } =
      resolveEffectiveFlatEntity({
        metadataName: 'viewField',
        flatEntity: viewField,
      });
    const presentation = {
      isVisible,
      size,
      position,
      aggregateOperation,
      viewFieldGroupId,
    };

    if (isDefined(destinationViewField)) {
      viewFieldsToUpdate.push(
        fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow({
          updateViewFieldInput: {
            id: destinationViewField.id,
            update: {
              ...presentation,
              aggregateOperation: aggregateOperation ?? undefined,
            },
          },
          flatViewFieldMaps,
          flatViewFieldGroupMaps,
          callerApplicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
        }),
      );
      continue;
    }

    const createdViewField = {
      ...viewField,
      ...presentation,
      viewFieldGroupUniversalIdentifier: isDefined(
        presentation.viewFieldGroupId,
      )
        ? (flatViewFieldGroupMaps.universalIdentifierById[
            presentation.viewFieldGroupId
          ] ?? null)
        : null,
      overrides: null,
      universalOverrides: null,
      id: v4(),
      universalIdentifier: v4(),
      fieldMetadataId: destination.id,
      fieldMetadataUniversalIdentifier: destination.universalIdentifier,
      applicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
    };

    viewFieldByViewAndFieldId.set(destinationKey, createdViewField);
    viewFieldsToCreate.push(createdViewField);
  }

  const viewFiltersToUpdate = Object.values(
    flatViewFilterMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .flatMap((viewFilter) => {
      const fieldDestination = findDestination(viewFilter.fieldMetadataId);
      const relationTargetDestination = findDestination(
        viewFilter.relationTargetFieldMetadataId,
      );

      if (
        !isDefined(fieldDestination) &&
        !isDefined(relationTargetDestination)
      ) {
        return [];
      }

      return [
        {
          ...viewFilter,
          ...(isDefined(fieldDestination) && {
            fieldMetadataId: fieldDestination.id,
            fieldMetadataUniversalIdentifier:
              fieldDestination.universalIdentifier,
          }),
          ...(isDefined(relationTargetDestination) && {
            relationTargetFieldMetadataId: relationTargetDestination.id,
            relationTargetFieldMetadataUniversalIdentifier:
              relationTargetDestination.universalIdentifier,
          }),
        },
      ];
    });

  const viewSortsToUpdate = Object.values(
    flatViewSortMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .flatMap((viewSort) => {
      const destination = findDestination(viewSort.fieldMetadataId);

      return isDefined(destination)
        ? [
            {
              ...viewSort,
              fieldMetadataId: destination.id,
              fieldMetadataUniversalIdentifier: destination.universalIdentifier,
            },
          ]
        : [];
    });

  const fieldPermissions = Object.values(
    flatFieldPermissionMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const fieldPermissionKeys = new Set(
    fieldPermissions.map(
      (fieldPermission) =>
        `${fieldPermission.roleId}:${fieldPermission.fieldMetadataId}`,
    ),
  );

  const fieldPermissionsToUpdate = fieldPermissions.flatMap(
    (fieldPermission) => {
      const destination = findDestination(fieldPermission.fieldMetadataId);
      const destinationKey = `${fieldPermission.roleId}:${destination?.id}`;

      if (!isDefined(destination) || fieldPermissionKeys.has(destinationKey)) {
        return [];
      }

      fieldPermissionKeys.add(destinationKey);

      return [
        {
          ...fieldPermission,
          fieldMetadataId: destination.id,
          fieldMetadataUniversalIdentifier: destination.universalIdentifier,
        },
      ];
    },
  );

  const pageLayoutWidgetsToUpdate = Object.values(
    flatPageLayoutWidgetMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .flatMap((pageLayoutWidget) => {
      const { configuration, universalConfiguration } = pageLayoutWidget;

      if (
        (configuration.configurationType !== WidgetConfigurationType.FIELD &&
          configuration.configurationType !==
            WidgetConfigurationType.FORM_FIELD) ||
        (universalConfiguration.configurationType !==
          WidgetConfigurationType.FIELD &&
          universalConfiguration.configurationType !==
            WidgetConfigurationType.FORM_FIELD)
      ) {
        return [];
      }

      const destination = findDestination(configuration.fieldMetadataId);

      if (!isDefined(destination)) {
        return [];
      }

      return [
        {
          ...pageLayoutWidget,
          configuration: {
            ...configuration,
            fieldMetadataId: destination.id,
          },
          universalConfiguration: {
            ...universalConfiguration,
            fieldMetadataId: destination.universalIdentifier,
          },
        },
      ];
    });

  return {
    morphIdsWithoutHead,
    viewFieldsToCreate,
    viewFieldsToUpdate,
    viewFieldsToDelete,
    viewFiltersToUpdate,
    viewSortsToUpdate,
    fieldPermissionsToUpdate,
    pageLayoutWidgetsToUpdate,
  };
};
