import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { isViewAvailableToUser } from 'src/engine/metadata-modules/view/utils/is-view-available-to-user.util';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';

@Injectable()
export class MetadataReadPermissionsService {
  constructor(
    private readonly principalPermissionsService: PrincipalPermissionsService,
  ) {}

  async getViewReadPredicate(workspaceId: string) {
    const access = await this.resolveReadAccess(workspaceId);

    return (view: FlatView): boolean =>
      isDefined(access) &&
      access.canReachMetadata(view) &&
      isViewAvailableToUser({
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
      });
  }

  async getNavigationMenuItemReadPredicate(workspaceId: string) {
    const access = await this.resolveReadAccess(workspaceId);

    return (item: FlatNavigationMenuItem): boolean =>
      isDefined(access) &&
      access.canReachMetadata(item) &&
      (!isDefined(item.userWorkspaceId) ||
        item.userWorkspaceId === access.userWorkspaceId);
  }

  private async resolveReadAccess(workspaceId: string) {
    const authContext = workspaceAuthContextStorage.getStore();

    if (!isDefined(authContext) || authContext.workspace.id !== workspaceId) {
      return undefined;
    }

    const principals =
      await this.principalPermissionsService.resolvePermissionsPrincipals({
        authContext,
      });

    if (!isDefined(principals)) {
      return undefined;
    }

    return {
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
