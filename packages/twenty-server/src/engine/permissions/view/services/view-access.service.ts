import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { ViewVisibility } from 'twenty-shared/types';

import { PermissionsService } from 'src/engine/permissions/permissions.service';
import { type ViewAccessContext } from 'src/engine/permissions/view/types/view-permissions.type';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import {
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessageKey,
  generateViewExceptionMessage,
  generateViewUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';

// The view endpoints' guards and the view tools both check access here
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
    // A missing view or child entity is let through so the service throws
    // its entity-specific NOT_FOUND error instead of a generic one
    if (!viewId) {
      return true;
    }

    const view = await this.viewService.findByIdIncludingDeleted(
      viewId,
      accessContext.workspaceId,
    );

    if (!view) {
      return true;
    }

    await this.assertCanModifyView({ view, accessContext });

    return true;
  }

  async canUserCreateView(
    visibility: ViewVisibility,
    accessContext: ViewAccessContext,
  ): Promise<boolean> {
    // An UNLISTED view belongs to the user who created it, so a principal that
    // is not a user - an API key or an application - has no owner to record
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

  async assertCanModifyView({
    view,
    accessContext,
    nextVisibility,
    unlistedViewsOwnerOnly = false,
  }: {
    view: Pick<ViewDTO, 'visibility' | 'createdByUserWorkspaceId'>;
    accessContext: ViewAccessContext;
    nextVisibility?: ViewVisibility;
    unlistedViewsOwnerOnly?: boolean;
  }): Promise<void> {
    const isUnlistedView = view.visibility === ViewVisibility.UNLISTED;
    const isOwnView =
      isDefined(accessContext.userWorkspaceId) &&
      view.createdByUserWorkspaceId === accessContext.userWorkspaceId;

    if (isUnlistedView && !isOwnView && unlistedViewsOwnerOnly) {
      this.throwModifyPermissionDenied();
    }

    // Publishing an unlisted view creates a workspace view, so it needs VIEWS
    const staysUnlisted =
      !isDefined(nextVisibility) || nextVisibility === ViewVisibility.UNLISTED;

    if (isUnlistedView && isOwnView && staysUnlisted) {
      return;
    }

    if (!(await this.hasViewsPermission(accessContext))) {
      this.throwModifyPermissionDenied();
    }
  }

  private async hasViewsPermission({
    workspaceId,
    userWorkspaceId,
    apiKeyId,
    applicationId,
    agentId,
    authContext,
  }: ViewAccessContext): Promise<boolean> {
    // A tool call's auth context also carries the AI run scope, which can narrow VIEWS
    if (isDefined(authContext)) {
      return this.permissionsService.hasPermissionFlag({
        authContext,
        setting: PermissionFlagType.VIEWS,
      });
    }

    // An unauthenticated request must surface the view-specific denial below
    // rather than the generic one userHasWorkspaceSettingPermission throws
    if (![userWorkspaceId, apiKeyId, applicationId].some(isDefined)) {
      return false;
    }

    return this.permissionsService.userHasWorkspaceSettingPermission({
      workspaceId,
      userWorkspaceId,
      apiKeyId,
      applicationId,
      agentId,
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
