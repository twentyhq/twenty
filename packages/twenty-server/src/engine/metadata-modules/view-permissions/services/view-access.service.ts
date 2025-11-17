import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
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
export class ViewAccessService {
  constructor(
    private readonly viewService: ViewService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canUserModifyView(
    viewId: string | null,
    userWorkspaceId: string | undefined,
    workspaceId: string,
  ): Promise<boolean> {
    // If viewId is null, the entity doesn't exist - allow the operation
    // so the service can handle the NOT_FOUND error properly
    if (!viewId) {
      return true;
    }

    const view = await this.viewService.findByIdIncludingDeleted(
      viewId,
      workspaceId,
    );

    // If view doesn't exist, allow through to service for proper error message
    if (!view) {
      return true;
    }

    return this.checkViewAccess(view, userWorkspaceId, workspaceId);
  }

  async canUserModifyViewByChildEntity(
    viewId: string | null,
    userWorkspaceId: string | undefined,
    workspaceId: string,
  ): Promise<boolean> {
    // If viewId is null, the child entity doesn't exist
    // Allow through so the service can throw the proper entity-specific error
    // (e.g., "View field not found" instead of generic "View not found")
    if (!viewId) {
      return true;
    }

    const view = await this.viewService.findByIdIncludingDeleted(
      viewId,
      workspaceId,
    );

    // If view doesn't exist, allow through to service for proper error message
    if (!view) {
      return true;
    }

    return this.checkViewAccess(view, userWorkspaceId, workspaceId);
  }

  async canUserCreateView(
    visibility: ViewVisibility,
    userWorkspaceId: string | undefined,
    workspaceId: string,
  ): Promise<boolean> {
    // For WORKSPACE visibility views, user must have VIEWS permission
    if (visibility === ViewVisibility.WORKSPACE && isDefined(userWorkspaceId)) {
      const permissions =
        await this.permissionsService.getUserWorkspacePermissions({
          userWorkspaceId,
          workspaceId,
        });

      const hasViewsPermission =
        permissions.permissionFlags[PermissionFlagType.VIEWS] ?? false;

      if (!hasViewsPermission) {
        throw new ViewException(
          generateViewExceptionMessage(
            ViewExceptionMessageKey.VIEW_CREATE_PERMISSION_DENIED,
          ),
          ViewExceptionCode.VIEW_CREATE_PERMISSION_DENIED,
          {
            userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
              ViewExceptionMessageKey.VIEW_CREATE_PERMISSION_DENIED,
            ),
          },
        );
      }
    }

    // For UNLISTED views or users without userWorkspaceId, allow creation
    return true;
  }

  private async checkViewAccess(
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
          ViewExceptionMessageKey.VIEW_MODIFY_PERMISSION_DENIED,
        ),
        ViewExceptionCode.VIEW_MODIFY_PERMISSION_DENIED,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.VIEW_MODIFY_PERMISSION_DENIED,
          ),
        },
      );
    }

    return true;
  }
}
