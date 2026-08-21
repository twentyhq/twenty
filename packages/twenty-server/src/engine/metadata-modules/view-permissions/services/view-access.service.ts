import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { ViewVisibility } from 'twenty-shared/types';

import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type ViewAccessContext } from 'src/engine/metadata-modules/view-permissions/types/view-permissions.types';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
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
    accessContext: ViewAccessContext,
  ): Promise<boolean> {
    // If viewId is null, the entity doesn't exist - allow the operation
    // so the service can handle the NOT_FOUND error properly
    if (!viewId) {
      return true;
    }

    const view = await this.viewService.findByIdIncludingDeleted(
      viewId,
      accessContext.workspaceId,
    );

    // If view doesn't exist, allow through to service for proper error message
    if (!view) {
      return true;
    }

    return this.checkViewAccess(view, accessContext);
  }

  async canUserModifyViewByChildEntity(
    viewId: string | null,
    accessContext: ViewAccessContext,
  ): Promise<boolean> {
    // If viewId is null, the child entity doesn't exist
    // Allow through so the service can throw the proper entity-specific error
    // (e.g., "View field not found" instead of generic "View not found")
    if (!viewId) {
      return true;
    }

    const view = await this.viewService.findByIdIncludingDeleted(
      viewId,
      accessContext.workspaceId,
    );

    // If view doesn't exist, allow through to service for proper error message
    if (!view) {
      return true;
    }

    return this.checkViewAccess(view, accessContext);
  }

  async canUserCreateView(
    visibility: ViewVisibility,
    accessContext: ViewAccessContext,
  ): Promise<boolean> {
    // UNLISTED views can only be created by users (not API keys or applications)
    if (visibility === ViewVisibility.UNLISTED) {
      if (!isDefined(accessContext.userWorkspaceId)) {
        this.throwCreatePermissionDenied();
      }

      return true;
    }

    const hasPermission = await this.hasViewsPermission(accessContext);

    if (!hasPermission) {
      this.throwCreatePermissionDenied();
    }

    return true;
  }

  private async checkViewAccess(
    view: ViewEntity,
    accessContext: ViewAccessContext,
  ): Promise<boolean> {
    const hasPermission = await this.hasViewsPermission(accessContext);

    if (hasPermission) {
      return true;
    }

    // Users without VIEWS permission can only manipulate their own unlisted views
    const isOwnUnlistedView =
      view.visibility === ViewVisibility.UNLISTED &&
      view.createdByUserWorkspaceId === accessContext.userWorkspaceId;

    if (isOwnUnlistedView) {
      return true;
    }

    this.throwModifyPermissionDenied();
  }

  private async hasViewsPermission({
    workspaceId,
    userWorkspaceId,
    apiKeyId,
    applicationId,
  }: ViewAccessContext): Promise<boolean> {
    // Without a principal the caller must raise its own view-specific denial,
    // not the generic one userHasWorkspaceSettingPermission would throw
    if (![userWorkspaceId, apiKeyId, applicationId].some(isDefined)) {
      return false;
    }

    return this.permissionsService.userHasWorkspaceSettingPermission({
      workspaceId,
      userWorkspaceId,
      apiKeyId,
      applicationId,
      setting: PermissionFlagType.VIEWS,
    });
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
