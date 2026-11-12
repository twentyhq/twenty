import { Injectable } from '@nestjs/common';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { ViewVisibility } from 'twenty-shared/types';

import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { ViewEntityLookupService } from 'src/engine/metadata-modules/view/services/view-entity-lookup.service';
import {
  type ViewAccessContext,
  type ViewChildEntityKind,
} from 'src/engine/metadata-modules/view/types/view-permissions.type';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
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
    private readonly viewEntityLookupService: ViewEntityLookupService,
    private readonly settingPermissionsService: SettingPermissionsService,
  ) {}

  async canUserModifyView({
    viewId,
    accessContext,
    nextVisibility,
  }: {
    viewId: string | null;
    accessContext: ViewAccessContext;
    nextVisibility?: ViewVisibility;
  }): Promise<boolean> {
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

    await this.assertCanModifyViewOrThrow({
      view,
      accessContext,
      nextVisibility,
    });

    return true;
  }

  async canUserCreateView({
    visibility,
    accessContext,
  }: {
    visibility: ViewVisibility;
    accessContext: ViewAccessContext;
  }): Promise<boolean> {
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

  async findModifiableViewOrThrow({
    viewId,
    accessContext,
  }: {
    viewId: string;
    accessContext: ViewAccessContext;
  }): Promise<ViewDTO> {
    const view = await this.viewService.findById(
      viewId,
      accessContext.workspaceId,
    );

    if (!isDefined(view)) {
      throw new ViewException(
        `View with id ${viewId} not found`,
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    await this.assertCanModifyViewOrThrow({ view, accessContext });

    return view;
  }

  async findModifiableParentViewOrThrow({
    kind,
    entityId,
    accessContext,
  }: {
    kind: ViewChildEntityKind;
    entityId: string;
    accessContext: ViewAccessContext;
  }): Promise<ViewDTO | null> {
    const viewId =
      await this.viewEntityLookupService.findViewIdByEntityIdAndKind(
        kind,
        entityId,
        accessContext.workspaceId,
      );

    if (!isDefined(viewId)) {
      return null;
    }

    return this.findModifiableViewOrThrow({ viewId, accessContext });
  }

  private async assertCanModifyViewOrThrow({
    view,
    accessContext,
    nextVisibility,
  }: {
    view: Pick<ViewDTO, 'visibility' | 'createdByUserWorkspaceId'>;
    accessContext: ViewAccessContext;
    nextVisibility?: ViewVisibility;
  }): Promise<void> {
    const isOwnUnlistedView =
      view.visibility === ViewVisibility.UNLISTED &&
      isDefined(accessContext.userWorkspaceId) &&
      view.createdByUserWorkspaceId === accessContext.userWorkspaceId;

    // Publishing an unlisted view creates a workspace view, so it needs VIEWS
    const isStayingUnlisted =
      !isDefined(nextVisibility) || nextVisibility === ViewVisibility.UNLISTED;

    if (isOwnUnlistedView && isStayingUnlisted) {
      return;
    }

    if (!(await this.hasViewsPermission(accessContext))) {
      this.throwModifyPermissionDenied();
    }
  }

  private async hasViewsPermission({
    authContext,
  }: ViewAccessContext): Promise<boolean> {
    return this.settingPermissionsService.hasPermissionFlag({
      authContext: authContext ?? workspaceAuthContextStorage.getStore(),
      permissionFlag: PermissionFlagType.VIEWS,
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
