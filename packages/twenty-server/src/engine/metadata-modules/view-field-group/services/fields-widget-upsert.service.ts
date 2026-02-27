import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { isFlatPageLayoutWidgetConfigurationOfType } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-flat-page-layout-widget-configuration-of-type.util';
import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
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
        groupsToUpdate.push({
          ...existingGroup,
          name: inputGroup.name,
          position: inputGroup.position,
          isVisible: inputGroup.isVisible,
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

      const hasChanged =
        existingField.isVisible !== inputField.isVisible ||
        existingField.position !== inputField.position ||
        existingField.viewFieldGroupId !== newViewFieldGroupId;

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

      return [
        {
          ...existingField,
          isVisible: inputField.isVisible,
          position: inputField.position,
          viewFieldGroupId: newViewFieldGroupId,
          viewFieldGroupUniversalIdentifier,
          updatedAt: now,
        },
      ];
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
              flatEntityToUpdate: viewFieldsToUpdate,
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

      const hasChanged =
        existingField.isVisible !== inputField.isVisible ||
        existingField.position !== inputField.position ||
        existingField.viewFieldGroupId !== null;

      if (!hasChanged) {
        return [];
      }

      return [
        {
          ...existingField,
          isVisible: inputField.isVisible,
          position: inputField.position,
          viewFieldGroupId: null,
          viewFieldGroupUniversalIdentifier: null,
          updatedAt: now,
        },
      ];
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
              flatEntityToUpdate: viewFieldsToUpdate,
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
    return (
      existing.name !== input.name ||
      existing.position !== input.position ||
      existing.isVisible !== input.isVisible
    );
  }
}
