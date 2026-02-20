import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { isFlatPageLayoutWidgetConfigurationOfType } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-flat-page-layout-widget-configuration-of-type.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { UpsertFieldsWidgetGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/upsert-fields-widget-group.input';
import { UpsertFieldsWidgetInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/upsert-fields-widget.input';
import { ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';
import {
  ViewFieldGroupException,
  ViewFieldGroupExceptionCode,
} from 'src/engine/metadata-modules/view-field-group/exceptions/view-field-group.exception';
import { fromFlatViewFieldGroupToViewFieldGroupDto } from 'src/engine/metadata-modules/view-field-group/utils/from-flat-view-field-group-to-view-field-group-dto.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class FieldsWidgetUpsertService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async upsertFieldsWidget({
    input,
    workspaceId,
  }: {
    input: UpsertFieldsWidgetInput;
    workspaceId: string;
  }): Promise<ViewFieldGroupDTO[]> {
    const { widgetId, groups: inputGroups } = input;

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

    const now = new Date().toISOString();
    const inputGroupIds = new Set(inputGroups.map((g) => g.id));

    const groupsToCreate: FlatViewFieldGroup[] = [];
    const groupsToUpdate: FlatViewFieldGroup[] = [];

    for (const inputGroup of inputGroups) {
      const existingGroup = existingGroups.find((g) => g.id === inputGroup.id);

      if (!isDefined(existingGroup)) {
        groupsToCreate.push(
          this.buildGroupToCreate({
            inputGroup,
            viewId,
            workspaceId,
            applicationId: workspaceCustomFlatApplication.id,
            applicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
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
        groupsToUpdate.push({
          ...existingGroup,
          deletedAt: now,
          updatedAt: now,
        });
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
              flatEntityToDelete: [],
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
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while upserting fields widget',
      );
    }

    const { flatViewFieldGroupMaps: recomputedFlatViewFieldGroupMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldGroupMaps'],
        },
      );

    return findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: inputGroups.map((g) => g.id),
      flatEntityMaps: recomputedFlatViewFieldGroupMaps,
    }).map(fromFlatViewFieldGroupToViewFieldGroupDto);
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
