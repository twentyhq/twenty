import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { PermissionsService } from 'src/engine/permissions/permissions.service';
import { ViewEntityLookupService } from 'src/engine/permissions/view/services/view-entity-lookup.service';
import { type ViewChildEntityKind } from 'src/engine/permissions/view/types/view-permissions.type';

// Like ViewAccessService, VIEWS is needed except on the caller's own unlisted views, but holding
// VIEWS does not let an agent change another member's unlisted view or publish one
@Injectable()
export class ViewToolAccessService {
  constructor(
    private readonly viewService: ViewService,
    private readonly viewEntityLookupService: ViewEntityLookupService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async assertCanCreateViewOrThrow({
    visibility,
    userWorkspaceId,
    authContext,
  }: {
    visibility: ViewVisibility;
    userWorkspaceId?: string;
    authContext?: WorkspaceAuthContext;
  }): Promise<void> {
    if (visibility === ViewVisibility.UNLISTED) {
      if (!isDefined(userWorkspaceId)) {
        throw new ViewException(
          'Only a workspace member can own an unlisted view',
          ViewExceptionCode.VIEW_CREATE_PERMISSION_DENIED,
        );
      }

      return;
    }

    if (!(await this.hasViewsPermission(authContext))) {
      throw new ViewException(
        'You need the Views permission to create a workspace view',
        ViewExceptionCode.VIEW_CREATE_PERMISSION_DENIED,
      );
    }
  }

  async findViewEditableByUserOrThrow({
    viewId,
    workspaceId,
    userWorkspaceId,
    authContext,
    operation,
    nextVisibility,
  }: {
    viewId: string;
    workspaceId: string;
    userWorkspaceId?: string;
    authContext?: WorkspaceAuthContext;
    operation: 'update' | 'delete';
    nextVisibility?: ViewVisibility;
  }): Promise<ViewDTO> {
    const view = await this.viewService.findById(viewId, workspaceId);

    if (!isDefined(view)) {
      throw new ViewException(
        `View with id ${viewId} not found`,
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    if (view.visibility === ViewVisibility.UNLISTED) {
      if (
        !isDefined(userWorkspaceId) ||
        view.createdByUserWorkspaceId !== userWorkspaceId
      ) {
        throw new ViewException(
          `You can only ${operation} your own unlisted views`,
          ViewExceptionCode.VIEW_MODIFY_PERMISSION_DENIED,
        );
      }

      if (
        !isDefined(nextVisibility) ||
        nextVisibility === ViewVisibility.UNLISTED
      ) {
        return view;
      }
    }

    if (!(await this.hasViewsPermission(authContext))) {
      throw new ViewException(
        `You need the Views permission to ${operation} a workspace view`,
        ViewExceptionCode.VIEW_MODIFY_PERMISSION_DENIED,
      );
    }

    return view;
  }

  async findParentViewEditableByUserOrThrow({
    kind,
    entityId,
    workspaceId,
    userWorkspaceId,
    authContext,
  }: {
    kind: ViewChildEntityKind;
    entityId: string;
    workspaceId: string;
    userWorkspaceId?: string;
    authContext?: WorkspaceAuthContext;
  }): Promise<ViewDTO | null> {
    const viewId =
      await this.viewEntityLookupService.findViewIdByEntityIdAndKind(
        kind,
        entityId,
        workspaceId,
      );

    if (!isDefined(viewId)) {
      return null;
    }

    return this.findViewEditableByUserOrThrow({
      viewId,
      workspaceId,
      userWorkspaceId,
      authContext,
      operation: 'update',
    });
  }

  private hasViewsPermission(
    authContext: WorkspaceAuthContext | undefined,
  ): Promise<boolean> {
    return this.permissionsService.hasPermissionFlag({
      authContext,
      setting: PermissionFlagType.VIEWS,
    });
  }
}
