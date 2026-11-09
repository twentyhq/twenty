import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { isViewAvailableToUser } from 'src/engine/metadata-modules/view/utils/is-view-available-to-user.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';

type MetadataReadContext = {
  workspaceId: string;
  authContext: WorkspaceAuthContext | undefined;
};

@Injectable()
export class MetadataReadPermissionsService {
  constructor(
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
  ) {}

  async getViewReadPredicate(context: MetadataReadContext) {
    const access = await this.resolveReadAccess(context);

    return (view: FlatView): boolean =>
      access.canReachMetadata(view) &&
      (access.isSystem
        ? view.deletedAt === null
        : isViewAvailableToUser({
            flatView: {
              deletedAt: view.deletedAt,
              createdByUserWorkspaceId: view.createdByUserWorkspaceId,
              visibility: resolveEffectiveFlatEntityProperty({
                metadataName: 'view',
                flatEntity: view,
                property: 'visibility',
              }),
            },
            userWorkspaceId: access.userWorkspaceId,
          }));
  }

  async getNavigationMenuItemReadPredicate(context: MetadataReadContext) {
    const access = await this.resolveReadAccess(context);

    return (item: FlatNavigationMenuItem): boolean =>
      access.canReachMetadata(item) &&
      (access.isSystem ||
        !isDefined(item.userWorkspaceId) ||
        item.userWorkspaceId === access.userWorkspaceId);
  }

  private async resolveReadAccess({
    workspaceId,
    authContext,
  }: MetadataReadContext) {
    if (!isDefined(authContext)) {
      throw new AuthException(
        'No authentication context found',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    if (authContext.workspace.id !== workspaceId) {
      throw new PermissionsException(
        'Workspace does not match authentication context',
        PermissionsExceptionCode.WORKSPACE_ID_ROLE_USER_WORKSPACE_MISMATCH,
      );
    }

    if (authContext.type === 'system') {
      return {
        isSystem: true,
        userWorkspaceId: undefined,
        canReachMetadata: (metadata: { workspaceId: string }): boolean =>
          metadata.workspaceId === workspaceId,
      };
    }

    const principals =
      await this.principalPermissionsReadService.resolvePermissionsPrincipalsOrThrow(
        {
          authContext,
        },
      );

    return {
      isSystem: false,
      userWorkspaceId:
        authContext.type === 'user' &&
        principals.mainPrincipal.type === 'workspaceMember'
          ? authContext.userWorkspaceId
          : undefined,
      canReachMetadata: (metadata: {
        workspaceId: string;
        applicationId: string;
      }): boolean =>
        metadata.workspaceId === workspaceId &&
        canCallerReachApplication({
          applicationId: metadata.applicationId,
          callingApplication:
            'application' in authContext ? authContext.application : undefined,
          operation: 'read',
          workspaceCustomApplicationId:
            authContext.workspace.workspaceCustomApplicationId,
        }),
    };
  }
}
