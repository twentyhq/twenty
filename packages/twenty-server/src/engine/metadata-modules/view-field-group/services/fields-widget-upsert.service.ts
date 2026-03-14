import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { isFlatPageLayoutWidgetConfigurationOfType } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-flat-page-layout-widget-configuration-of-type.util';
import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { fromViewFieldOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-overrides-to-universal-overrides.util';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/utils/sanitize-overridable-entity-input.util';
import { type UpsertFieldsWidgetFieldInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/upsert-fields-widget-field.input';
import { UpsertFieldsWidgetGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/upsert-fields-widget-group.input';
import { UpsertFieldsWidgetInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/upsert-fields-widget.input';
import {
  ViewFieldGroupException,
  ViewFieldGroupExceptionCode,
} from 'src/engine/metadata-modules/view-field-group/exceptions/view-field-group.exception';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class FieldsWidgetUpsertService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
  ) {}

  async upsertFieldsWidget({
    input,
    workspaceId,
  }: {
    input: UpsertFieldsWidgetInput;
    workspaceId: string;
  }): Promise<ViewEntity> {
    const hasGroups = isDefined(input.groups);
    const hasFields = isDefined(input.fields);

    if (hasGroups === hasFields) {
      throw new ViewFieldGroupException(
        t`Exactly one of "groups" or "fields" must be provided`,
        ViewFieldGroupExceptionCode.INVALID_VIEW_FIELD_GROUP_DATA,
      );
    }

    const { widgetId } = input;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatPageLayoutWidgetMaps,
      flatViewFieldGroupMaps,
      flatViewFieldMaps,
      flatViewMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatPageLayoutWidgetMaps',
            'flatViewFieldGroupMaps',
            'flatViewFieldMaps',
            'flatViewMaps',
          ],
        },
      );

    const widget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: widgetId,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });

    if (
      !isDefined(widget) ||
      !isFlatPageLayoutWidgetConfigurationOfType(
        widget,
        WidgetConfigurationType.FIELDS,
      )
    ) {
      throw new ViewFieldGroupException(
        t`Fields widget not found`,
        ViewFieldGroupExceptionCode.FIELDS_WIDGET_NOT_FOUND,
      );
    }

    const viewId = widget.configuration.viewId;

    if (!isDefined(viewId)) {
      throw new ViewFieldGroupException(
        t`Fields widget has no associated view`,
        ViewFieldGroupExceptionCode.VIEW_NOT_FOUND,
      );
    }

    const existingGroups = Object.values(
      flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (group) => !isDefined(group.deletedAt) && group.viewId === viewId,
      );

    const existingViewFields = Object.values(
      flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (field) => !isDefined(field.deletedAt) && field.viewId === viewId,
      );

    if (hasGroups) {
      await this.upsertFieldsWidgetWithGroups({
        inputGroups: input.groups!,
        existingGroups,
        existingViewFields,
        viewId,
        workspaceId,
        applicationId: workspaceCustomFlatApplication.id,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatViewMaps,
        flatViewFieldGroupMaps,
      });
    } else {
      await this.upsertFieldsWidgetWithFields({
        inputFields: input.fields!,
        existingGroups,
        existingViewFields,
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      });
    }

    const view = await this.viewRepository.findOne({
      where: { id: viewId, workspaceId, deletedAt: IsNull() },
    });

    if (!isDefined(view)) {
      throw new ViewFieldGroupException(
        t`View not found after upsert`,
        ViewFieldGroupExceptionCode.VIEW_NOT_FOUND,
      );
    }

    return view;
  }

  private async upsertFieldsWidgetWithGroups({
    inputGroups,
    existingGroups,
    existingViewFields,
    viewId,
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    flatViewMaps,
    flatViewFieldGroupMaps,
  }: {
    inputGroups: UpsertFieldsWidgetGroupInput[];
    existingGroups: FlatViewFieldGroup[];
    existingViewFields: FlatViewField[];
    viewId: string;
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    flatViewMaps: FlatViewMaps;
    flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
  }): Promise<void> {
    const now = new Date().toISOString();
    const inputGroupIds = new Set(inputGroups.map((g) => g.id));

    const groupsToCreate: FlatViewFieldGroup[] = [];
    const groupsToUpdate: FlatViewFieldGroup[] = [];
    const groupsToDelete: FlatViewFieldGroup[] = [];

    for (const inputGroup of inputGroups) {
      const existingGroup = existingGroups.find((g) => g.id === inputGroup.id);

      if (!isDefined(existingGroup)) {
        groupsToCreate.push(
          this.buildGroupToCreate({
            inputGroup,
            viewId,
            workspaceId,
            applicationId,
            applicationUniversalIdentifier,
            now,
            flatViewMaps,
          }),
        );
      } else if (this.hasGroupChanged(existingGroup, inputGroup)) {
        const shouldOverride = isCallerOverridingEntity({
          callerApplicationUniversalIdentifier: applicationUniversalIdentifier,
          entityApplicationUniversalIdentifier:
            existingGroup.applicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier:
            applicationUniversalIdentifier,
        });

        const { overrides, updatedEditableProperties: sanitizedGroupProps } =
          sanitizeOverridableEntityInput({
            metadataName: 'viewFieldGroup',
            existingFlatEntity: existingGroup,
            updatedEditableProperties: {
              name: inputGroup.name,
              position: inputGroup.position,
              isVisible: inputGroup.isVisible,
            },
            shouldOverride,
          });

        groupsToUpdate.push({
          ...existingGroup,
          ...sanitizedGroupProps,
          overrides,
          updatedAt: now,
        });
      }
    }

    for (const existingGroup of existingGroups) {
      if (!inputGroupIds.has(existingGroup.id)) {
        groupsToDelete.push(existingGroup);
      }
    }

    // Build optimistic maps so that newly created groups can be resolved when
    // computing viewFieldGroupUniversalIdentifier for view field updates.
    const optimisticFlatViewFieldGroupMaps: FlatViewFieldGroupMaps =
      groupsToCreate.reduce(
        (maps, group) =>
          addFlatEntityToFlatEntityMapsOrThrow({
            flatEntity: group,
            flatEntityMaps: maps,
          }),
        flatViewFieldGroupMaps,
      );

    const viewFieldsToUpdate = existingViewFields.flatMap((existingField) => {
      const inputGroup = inputGroups.find((g) =>
        g.fields.some((f) => f.viewFieldId === existingField.id),
      );

      if (!isDefined(inputGroup)) {
        return [];
      }

      const inputField = inputGroup.fields.find(
        (f) => f.viewFieldId === existingField.id,
      );

      if (!isDefined(inputField)) {
        return [];
      }

      const newViewFieldGroupId = inputGroup.id;

      const resolvedIsVisible = isDefined(existingField.overrides?.isVisible)
        ? existingField.overrides.isVisible
        : existingField.isVisible;
      const resolvedPosition = isDefined(existingField.overrides?.position)
        ? existingField.overrides.position
        : existingField.position;
      // null is a valid override value (meaning "ungrouped"), so use !== undefined
      const resolvedViewFieldGroupId =
        existingField.overrides?.viewFieldGroupId !== undefined
          ? existingField.overrides.viewFieldGroupId
          : existingField.viewFieldGroupId;

      const hasChanged =
        resolvedIsVisible !== inputField.isVisible ||
        resolvedPosition !== inputField.position ||
        resolvedViewFieldGroupId !== newViewFieldGroupId;

      if (!hasChanged) {
        return [];
      }

      const { viewFieldGroupUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'viewField',
          foreignKeyValues: {
            viewFieldGroupId: newViewFieldGroupId,
          },
          flatEntityMaps: {
            flatViewFieldGroupMaps: optimisticFlatViewFieldGroupMaps,
          },
        });

      const shouldOverride = isCallerOverridingEntity({
        callerApplicationUniversalIdentifier: applicationUniversalIdentifier,
        entityApplicationUniversalIdentifier:
          existingField.applicationUniversalIdentifier,
        workspaceCustomApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
      });

      const { overrides, updatedEditableProperties: sanitizedFieldProps } =
        sanitizeOverridableEntityInput({
          metadataName: 'viewField',
          existingFlatEntity: existingField,
          updatedEditableProperties: {
            isVisible: inputField.isVisible,
            position: inputField.position,
            viewFieldGroupId: newViewFieldGroupId,
          },
          shouldOverride,
        });

      const updatedField: FlatViewField = {
        ...existingField,
        ...sanitizedFieldProps,
        overrides,
        updatedAt: now,
      };

      if (sanitizedFieldProps.viewFieldGroupId !== undefined) {
        const resolved = resolveEntityRelationUniversalIdentifiers({
          metadataName: 'viewField',
          foreignKeyValues: {
            viewFieldGroupId: updatedField.viewFieldGroupId,
          },
          flatEntityMaps: {
            flatViewFieldGroupMaps: optimisticFlatViewFieldGroupMaps,
          },
        });

        updatedField.viewFieldGroupUniversalIdentifier =
          resolved.viewFieldGroupUniversalIdentifier;
      }

      if (isDefined(overrides)) {
        updatedField.universalOverrides =
          fromViewFieldOverridesToUniversalOverrides({
            overrides,
            viewFieldGroupUniversalIdentifierById:
              optimisticFlatViewFieldGroupMaps.universalIdentifierById,
          });
      } else {
        updatedField.universalOverrides = null;
      }

      return [updatedField];
    });

    const fieldsWithStaleGroupOverrides =
      this.buildFieldUpdatesForStaleGroupOverrides({
        existingViewFields,
        groupsToDelete,
        alreadyUpdatedFieldIds: new Set(
          viewFieldsToUpdate.map((field) => field.id),
        ),
        now,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFieldGroup: {
              flatEntityToCreate: groupsToCreate,
              flatEntityToDelete: groupsToDelete,
              flatEntityToUpdate: groupsToUpdate,
            },
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                ...viewFieldsToUpdate,
                ...fieldsWithStaleGroupOverrides,
              ],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while upserting fields widget',
      );
    }
  }

  private async upsertFieldsWidgetWithFields({
    inputFields,
    existingGroups,
    existingViewFields,
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    inputFields: UpsertFieldsWidgetFieldInput[];
    existingGroups: FlatViewFieldGroup[];
    existingViewFields: FlatViewField[];
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const now = new Date().toISOString();

    const groupsToDelete: FlatViewFieldGroup[] = [...existingGroups];

    const viewFieldsToUpdate = existingViewFields.flatMap((existingField) => {
      const inputField = inputFields.find(
        (f) => f.viewFieldId === existingField.id,
      );

      if (!isDefined(inputField)) {
        return [];
      }

      const resolvedIsVisible = isDefined(existingField.overrides?.isVisible)
        ? existingField.overrides.isVisible
        : existingField.isVisible;
      const resolvedPosition = isDefined(existingField.overrides?.position)
        ? existingField.overrides.position
        : existingField.position;
      const resolvedViewFieldGroupId =
        existingField.overrides?.viewFieldGroupId !== undefined
          ? existingField.overrides.viewFieldGroupId
          : existingField.viewFieldGroupId;

      const hasChanged =
        resolvedIsVisible !== inputField.isVisible ||
        resolvedPosition !== inputField.position ||
        resolvedViewFieldGroupId !== null;

      if (!hasChanged) {
        return [];
      }

      const shouldOverride = isCallerOverridingEntity({
        callerApplicationUniversalIdentifier: applicationUniversalIdentifier,
        entityApplicationUniversalIdentifier:
          existingField.applicationUniversalIdentifier,
        workspaceCustomApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
      });

      const { overrides, updatedEditableProperties: sanitizedFieldProps } =
        sanitizeOverridableEntityInput({
          metadataName: 'viewField',
          existingFlatEntity: existingField,
          updatedEditableProperties: {
            isVisible: inputField.isVisible,
            position: inputField.position,
            viewFieldGroupId: null as string | null,
          },
          shouldOverride,
        });

      const updatedField: FlatViewField = {
        ...existingField,
        ...sanitizedFieldProps,
        overrides,
        updatedAt: now,
      };

      if (sanitizedFieldProps.viewFieldGroupId !== undefined) {
        updatedField.viewFieldGroupUniversalIdentifier = null;
      }

      if (isDefined(overrides)) {
        updatedField.universalOverrides =
          fromViewFieldOverridesToUniversalOverrides({
            overrides,
            viewFieldGroupUniversalIdentifierById: {},
          });
      } else {
        updatedField.universalOverrides = null;
      }

      return [updatedField];
    });

    const fieldsWithStaleGroupOverrides =
      this.buildFieldUpdatesForStaleGroupOverrides({
        existingViewFields,
        groupsToDelete,
        alreadyUpdatedFieldIds: new Set(
          viewFieldsToUpdate.map((field) => field.id),
        ),
        now: new Date().toISOString(),
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: groupsToDelete,
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                ...viewFieldsToUpdate,
                ...fieldsWithStaleGroupOverrides,
              ],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while upserting fields widget',
      );
    }
  }

  private buildFieldUpdatesForStaleGroupOverrides({
    existingViewFields,
    groupsToDelete,
    alreadyUpdatedFieldIds,
    now,
  }: {
    existingViewFields: FlatViewField[];
    groupsToDelete: FlatViewFieldGroup[];
    alreadyUpdatedFieldIds: Set<string>;
    now: string;
  }): FlatViewField[] {
    if (groupsToDelete.length === 0) {
      return [];
    }

    const deletedGroupIds = new Set(groupsToDelete.map((group) => group.id));

    return existingViewFields
      .filter((field) => {
        if (alreadyUpdatedFieldIds.has(field.id)) {
          return false;
        }

        const overriddenGroupId = field.overrides?.viewFieldGroupId;

        const hasStaleOverride =
          isDefined(overriddenGroupId) &&
          typeof overriddenGroupId === 'string' &&
          deletedGroupIds.has(overriddenGroupId);

        const hasStaleBase =
          overriddenGroupId === undefined &&
          isDefined(field.viewFieldGroupId) &&
          deletedGroupIds.has(field.viewFieldGroupId);

        const hasStaleBaseHiddenByNullOverride =
          overriddenGroupId === null &&
          isDefined(field.viewFieldGroupId) &&
          deletedGroupIds.has(field.viewFieldGroupId);

        return (
          hasStaleOverride || hasStaleBase || hasStaleBaseHiddenByNullOverride
        );
      })
      .map((field) => {
        const overriddenGroupId = field.overrides?.viewFieldGroupId;
        const hasStaleOverride =
          isDefined(overriddenGroupId) &&
          typeof overriddenGroupId === 'string' &&
          deletedGroupIds.has(overriddenGroupId);

        if (hasStaleOverride) {
          const { viewFieldGroupId: _, ...remainingOverrides } =
            field.overrides!;

          const cleanedOverrides =
            Object.keys(remainingOverrides).length > 0
              ? (remainingOverrides as typeof field.overrides)
              : null;

          const baseGroupIsAlsoStale =
            isDefined(field.viewFieldGroupId) &&
            deletedGroupIds.has(field.viewFieldGroupId);

          return {
            ...field,
            ...(baseGroupIsAlsoStale
              ? {
                  viewFieldGroupId: null,
                  viewFieldGroupUniversalIdentifier: null,
                }
              : {}),
            overrides: cleanedOverrides,
            universalOverrides: isDefined(cleanedOverrides)
              ? fromViewFieldOverridesToUniversalOverrides({
                  overrides: cleanedOverrides,
                  viewFieldGroupUniversalIdentifierById: {},
                })
              : null,
            updatedAt: now,
          };
        }

        if (
          overriddenGroupId === null &&
          isDefined(field.viewFieldGroupId) &&
          deletedGroupIds.has(field.viewFieldGroupId)
        ) {
          return {
            ...field,
            viewFieldGroupId: null,
            viewFieldGroupUniversalIdentifier: null,
            updatedAt: now,
          };
        }

        return {
          ...field,
          viewFieldGroupId: null,
          viewFieldGroupUniversalIdentifier: null,
          updatedAt: now,
        };
      });
  }

  private buildGroupToCreate({
    inputGroup,
    viewId,
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    now,
    flatViewMaps,
  }: {
    inputGroup: UpsertFieldsWidgetGroupInput;
    viewId: string;
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    now: string;
    flatViewMaps: FlatViewMaps;
  }): FlatViewFieldGroup {
    const { viewUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'viewFieldGroup',
        foreignKeyValues: { viewId },
        flatEntityMaps: { flatViewMaps },
      });

    return {
      id: inputGroup.id,
      workspaceId,
      applicationId,
      universalIdentifier: inputGroup.id,
      applicationUniversalIdentifier,
      name: inputGroup.name,
      position: inputGroup.position,
      isVisible: inputGroup.isVisible,
      viewId,
      viewUniversalIdentifier,
      overrides: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      viewFieldIds: [],
      viewFieldUniversalIdentifiers: [],
    };
  }

  private hasGroupChanged(
    existing: FlatViewFieldGroup,
    input: UpsertFieldsWidgetGroupInput,
  ): boolean {
    const resolvedName = isDefined(existing.overrides?.name)
      ? existing.overrides.name
      : existing.name;
    const resolvedPosition = isDefined(existing.overrides?.position)
      ? existing.overrides.position
      : existing.position;
    const resolvedIsVisible = isDefined(existing.overrides?.isVisible)
      ? existing.overrides.isVisible
      : existing.isVisible;

    return (
      resolvedName !== input.name ||
      resolvedPosition !== input.position ||
      resolvedIsVisible !== input.isVisible
    );
  }
}
