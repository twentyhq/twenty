import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';
import {
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessageKey,
  generateViewExceptionMessage,
  generateViewUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';

@Injectable()
export class ViewPermissionGuard implements CanActivate {
  constructor(
    private readonly viewService: ViewService,
    private readonly viewFieldService: ViewFieldService,
    private readonly viewFilterService: ViewFilterService,
    private readonly viewFilterGroupService: ViewFilterGroupService,
    private readonly viewGroupService: ViewGroupService,
    private readonly viewSortService: ViewSortService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();

    const viewId = await this.extractViewId(args, request.workspace.id);
    const view = await this.viewService.findById(viewId, request.workspace.id);

    if (!view) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          viewId,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    return this.canUserAccessView(
      view,
      request.userWorkspaceId,
      request.workspace.id,
    );
  }

  private async extractViewId(
    args: Record<string, unknown>,
    workspaceId: string,
  ): Promise<string> {
    // Direct view operations (updateCoreView, deleteCoreView, etc.)
    if (typeof args.id === 'string') {
      return args.id;
    }

    // Create operations with viewId in input (createCoreViewField, etc.)
    const input = args.input as Record<string, unknown> | undefined;

    if (input && typeof input.viewId === 'string') {
      return input.viewId;
    }

    // Bulk create operations (createManyCoreViewFields, etc.)
    const inputs = args.inputs as Array<Record<string, unknown>> | undefined;

    if (inputs && inputs[0] && typeof inputs[0].viewId === 'string') {
      return inputs[0].viewId;
    }

    // Update/delete operations on child entities - need to fetch entity to get viewId
    if (input && typeof input.id === 'string') {
      const entity = await this.fetchChildEntityById(input.id, workspaceId);

      return entity.viewId;
    }

    // Bulk delete operations on child entities
    const ids = args.ids as string[] | undefined;

    if (ids && ids[0]) {
      const entity = await this.fetchChildEntityById(ids[0], workspaceId);

      return entity.viewId;
    }

    throw new Error('Could not extract viewId from arguments');
  }

  private async fetchChildEntityById(
    entityId: string,
    workspaceId: string,
  ): Promise<{ viewId: string }> {
    const viewField = await this.viewFieldService.findById(
      entityId,
      workspaceId,
    );

    if (viewField) return viewField;

    const viewFilter = await this.viewFilterService.findById(
      entityId,
      workspaceId,
    );

    if (viewFilter) return viewFilter;

    const viewFilterGroup = await this.viewFilterGroupService.findById(
      entityId,
      workspaceId,
    );

    if (viewFilterGroup) return viewFilterGroup;

    const viewGroup = await this.viewGroupService.findById(
      entityId,
      workspaceId,
    );

    if (viewGroup) return viewGroup;

    const viewSort = await this.viewSortService.findById(entityId, workspaceId);

    if (viewSort) return viewSort;

    throw new Error(`Could not find entity with id ${entityId}`);
  }

  private async canUserAccessView(
    view: ViewEntity,
    userWorkspaceId: string | undefined,
    workspaceId: string,
  ): Promise<boolean> {
    const permissions = isDefined(userWorkspaceId)
      ? await this.permissionsService.getUserWorkspacePermissions({
          userWorkspaceId,
          workspaceId,
        })
      : null;

    const hasViewsPermission =
      permissions?.permissionFlags[PermissionFlagType.VIEWS] ?? false;

    // Users with VIEWS permission can manipulate all views
    if (hasViewsPermission) {
      return true;
    }

    // Users without VIEWS permission can only manipulate their own unlisted views
    const canAccess =
      view.visibility === ViewVisibility.UNLISTED &&
      view.createdByUserWorkspaceId === userWorkspaceId;

    if (!canAccess) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_UPDATE_PERMISSION_DENIED,
        ),
        ViewExceptionCode.VIEW_UPDATE_PERMISSION_DENIED,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.VIEW_UPDATE_PERMISSION_DENIED,
          ),
        },
      );
    }

    return true;
  }
}
