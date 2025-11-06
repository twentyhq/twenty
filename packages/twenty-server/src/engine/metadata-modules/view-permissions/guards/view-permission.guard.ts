import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';
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
    private readonly viewEntityLookupService: ViewEntityLookupService,
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
      return await this.viewEntityLookupService.findViewIdByEntityId(
        input.id,
        workspaceId,
      );
    }

    // Bulk delete operations on child entities
    const ids = args.ids as string[] | undefined;

    if (ids && ids[0]) {
      return await this.viewEntityLookupService.findViewIdByEntityId(
        ids[0],
        workspaceId,
      );
    }

    throw new Error('Could not extract viewId from arguments');
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
