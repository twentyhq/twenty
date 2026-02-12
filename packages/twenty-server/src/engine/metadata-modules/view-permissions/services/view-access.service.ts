import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

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
    apiKeyId?: string,
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

    return this.checkViewAccess(view, userWorkspaceId, workspaceId, apiKeyId);
  }

  async canUserModifyViewByChildEntity(
    viewId: string | null,
    userWorkspaceId: string | undefined,
    workspaceId: string,
    apiKeyId?: string,
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

    return this.checkViewAccess(view, userWorkspaceId, workspaceId, apiKeyId);
  }

  async canUserCreateView(
    visibility: ViewVisibility,
    userWorkspaceId: string | undefined,
    workspaceId: string,
    apiKeyId?: string,
  ): Promise<boolean> {
    // UNLISTED views can only be created by users (not API keys)
    if (visibility === ViewVisibility.UNLISTED) {
      if (!isDefined(userWorkspaceId)) {
        this.throwCreatePermissionDenied();
      }

      return true;
    }

    // WORKSPACE visibility views require VIEWS permission
    const hasPermission = await this.hasViewsPermission(
      userWorkspaceId,
      workspaceId,
      apiKeyId,
    );

    if (!hasPermission) {
      this.throwCreatePermissionDenied();
    }

    return true;
  }

  private async checkViewAccess(
    view: ViewEntity,
    userWorkspaceId: string | undefined,
    workspaceId: string,
    apiKeyId?: string,
  ): Promise<boolean> {
    const hasPermission = await this.hasViewsPermission(
      userWorkspaceId,
      workspaceId,
      apiKeyId,
    );

    if (hasPermission) {
      return true;
    }

    // Users without VIEWS permission can only manipulate their own unlisted views
    const isOwnUnlistedView =
      view.visibility === ViewVisibility.UNLISTED &&
      view.createdByUserWorkspaceId === userWorkspaceId;

    if (isOwnUnlistedView) {
      return true;
    }

    this.throwModifyPermissionDenied();
  }

  private async hasViewsPermission(
    userWorkspaceId: string | undefined,
    workspaceId: string,
    apiKeyId?: string,
  ): Promise<boolean> {
    if (isDefined(userWorkspaceId)) {
      const permissions =
        await this.permissionsService.getUserWorkspacePermissions({
          userWorkspaceId,
          workspaceId,
        });

      return permissions.permissionFlags[PermissionFlagType.VIEWS] ?? false;
    }

    if (isDefined(apiKeyId)) {
      return this.permissionsService.userHasWorkspaceSettingPermission({
        workspaceId,
        apiKeyId,
        setting: PermissionFlagType.VIEWS,
      });
    }

    return false;
  }

  private throwCreatePermissionDenied(): never {
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

  private throwModifyPermissionDenied(): never {
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
}
