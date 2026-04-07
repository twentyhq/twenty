import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { splitEntitiesByResetStrategy } from 'src/engine/metadata-modules/flat-entity/utils/split-entities-by-reset-strategy.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { isFlatPageLayoutWidgetConfigurationOfType } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-flat-page-layout-widget-configuration-of-type.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';
import { fromFlatPageLayoutWidgetToPageLayoutWidgetDto } from 'src/engine/metadata-modules/page-layout-widget/utils/from-flat-page-layout-widget-to-page-layout-widget-dto.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { DashboardSyncService } from 'src/modules/dashboard-sync/services/dashboard-sync.service';

@Injectable()
export class PageLayoutResetService {
  private readonly logger = new Logger(PageLayoutResetService.name);

  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly dashboardSyncService: DashboardSyncService,
  ) {}

  async resetPageLayoutWidgetToDefault({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<PageLayoutWidgetDTO> {
    const {
      flatPageLayoutWidgetMaps,
      flatViewFieldGroupMaps,
      flatViewFieldMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatPageLayoutWidgetMaps',
            'flatViewFieldGroupMaps',
            'flatViewFieldMaps',
          ],
        },
      );

    const widget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });

    if (!isDefined(widget) || isDefined(widget.deletedAt)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    if (
      !isFlatPageLayoutWidgetConfigurationOfType(
        widget,
        WidgetConfigurationType.FIELDS,
      )
    ) {
      throw new PageLayoutWidgetException(
        `Widget "${id}" is not a FIELDS widget and cannot be reset to default`,
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (
      widget.applicationUniversalIdentifier ===
      workspaceCustomFlatApplication.universalIdentifier
    ) {
      throw new PageLayoutWidgetException(
        `Custom widget "${id}" cannot be reset to default`,
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    const now = new Date().toISOString();

    const widgetToUpdate: FlatPageLayoutWidget = {
      ...widget,
      overrides: null,
      updatedAt: now,
    };

    const viewId = widget.configuration.viewId;

    const {
      viewFieldGroupsToUpdate,
      viewFieldGroupsToDelete,
      viewFieldsToUpdate,
      viewFieldsToDelete,
    } = isDefined(viewId)
      ? this.computeFieldsWidgetChildResetOperations({
          viewId,
          flatViewFieldGroupMaps,
          flatViewFieldMaps,
          workspaceCustomApplicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          now,
        })
      : {
          viewFieldGroupsToUpdate: [],
          viewFieldGroupsToDelete: [],
          viewFieldsToUpdate: [],
          viewFieldsToDelete: [],
        };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [widgetToUpdate],
              flatEntityToDelete: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToUpdate: viewFieldGroupsToUpdate,
              flatEntityToDelete: viewFieldGroupsToDelete,
            },
            viewField: {
              flatEntityToCreate: [],
              flatEntityToUpdate: viewFieldsToUpdate,
              flatEntityToDelete: viewFieldsToDelete,
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
        'Multiple validation errors occurred while resetting page layout widget to default',
      );
    }

    const { flatPageLayoutWidgetMaps: recomputedWidgetMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps'],
        },
      );

    const updatedWidget = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedWidgetMaps,
    });

    await this.dashboardSyncService.updateLinkedDashboardsUpdatedAtByWidgetId({
      widgetId: id,
      workspaceId,
      updatedAt: new Date(updatedWidget.updatedAt),
    });

    return fromFlatPageLayoutWidgetToPageLayoutWidgetDto(updatedWidget);
  }

  private computeFieldsWidgetChildResetOperations({
    viewId,
    flatViewFieldGroupMaps,
    flatViewFieldMaps,
    workspaceCustomApplicationUniversalIdentifier,
    now,
  }: {
    viewId: string;
    flatViewFieldGroupMaps: {
      byUniversalIdentifier: Record<string, FlatViewFieldGroup | undefined>;
    };
    flatViewFieldMaps: {
      byUniversalIdentifier: Record<string, FlatViewField | undefined>;
    };
    workspaceCustomApplicationUniversalIdentifier: string;
    now: string;
  }): {
    viewFieldGroupsToUpdate: FlatViewFieldGroup[];
    viewFieldGroupsToDelete: FlatViewFieldGroup[];
    viewFieldsToUpdate: FlatViewField[];
    viewFieldsToDelete: FlatViewField[];
  } {
    const existingGroups = Object.values(
      flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (group) => group.viewId === viewId && !isDefined(group.deletedAt),
      );

    const existingFields = Object.values(
      flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (field) => field.viewId === viewId && !isDefined(field.deletedAt),
      );

    const { toHardDelete: groupsToDelete, toReset: groupsToReset } =
      splitEntitiesByResetStrategy({
        entities: existingGroups,
        workspaceCustomApplicationUniversalIdentifier,
        now,
      });

    const { toHardDelete: fieldsToDelete, toReset: fieldsToReset } =
      splitEntitiesByResetStrategy({
        entities: existingFields,
        workspaceCustomApplicationUniversalIdentifier,
        now,
      });

    const viewFieldsToReset = fieldsToReset.map((field) => ({
      ...field,
      universalOverrides: null,
    }));

    return {
      viewFieldGroupsToUpdate: groupsToReset,
      viewFieldGroupsToDelete: groupsToDelete,
      viewFieldsToUpdate: viewFieldsToReset,
      viewFieldsToDelete: fieldsToDelete,
    };
  }
}
