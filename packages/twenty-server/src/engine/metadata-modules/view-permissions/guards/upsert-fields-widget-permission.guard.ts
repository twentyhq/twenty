import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isFlatPageLayoutWidgetConfigurationOfType } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-flat-page-layout-widget-configuration-of-type.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';

@Injectable()
export class UpsertFieldsWidgetPermissionGuard implements CanActivate {
  constructor(
    private readonly viewAccessService: ViewAccessService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    let widgetId: string | null = null;

    const args = gqlContext.getArgs();

    if (typeof args?.input?.widgetId === 'string') {
      widgetId = args.input.widgetId;
    }

    if (!widgetId && typeof request.body?.widgetId === 'string') {
      widgetId = request.body.widgetId;
    }

    if (!widgetId) {
      return this.viewAccessService.canUserModifyViewByChildEntity(
        null,
        request.userWorkspaceId,
        request.workspace.id,
        request.apiKey?.id,
      );
    }

    const { flatPageLayoutWidgetMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: request.workspace.id,
          flatMapsKeys: ['flatPageLayoutWidgetMaps'],
        },
      );

    const widget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: widgetId,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });

    const viewId =
      widget &&
      isFlatPageLayoutWidgetConfigurationOfType(
        widget,
        WidgetConfigurationType.FIELDS,
      )
        ? widget.configuration.viewId
        : null;

    return this.viewAccessService.canUserModifyViewByChildEntity(
      viewId,
      request.userWorkspaceId,
      request.workspace.id,
      request.apiKey?.id,
    );
  }
}
