import {
  Injectable,
  mixin,
  type CanActivate,
  type ExecutionContext,
  type Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';
import { type ViewChildEntityKind } from 'src/engine/metadata-modules/view-permissions/types/view-permissions.types';
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

export const ViewPermissionGuard = (
  childEntityKind?: ViewChildEntityKind,
): Type<CanActivate> => {
  @Injectable()
  class ViewPermissionGuardMixin implements CanActivate {
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

      // If viewId is null, the entity doesn't exist - allow the operation
      // so the service can handle the NOT_FOUND error properly
      if (!viewId) {
        return true;
      }

      const view = await this.viewService.findByIdIncludingDeleted(
        viewId,
        request.workspace.id,
      );

      // If view doesn't exist:
      // - For direct view operations: allow through to service for proper error message
      // - For child entity operations: throw NOT_FOUND (parent view must exist)
      if (!view) {
        if (!childEntityKind) {
          // Direct view operations - let service handle NOT_FOUND
          return true;
        }
        // Child entity operations - view must exist for child to be valid
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
    ): Promise<string | null> {
      // Direct view operations (updateCoreView, deleteCoreView, etc.)
      if (!childEntityKind && typeof args.id === 'string') {
        return args.id;
      }

      const input = args.input as Record<string, unknown> | undefined;
      const inputs = args.inputs as Array<Record<string, unknown>> | undefined;

      // Create operations with viewId in input (createCoreViewField, etc.)
      if (input && typeof input.viewId === 'string') {
        return input.viewId;
      }

      // Bulk create operations (createManyCoreViewFields, etc.)
      if (inputs) {
        if (inputs.length === 0) {
          return null;
        }
        if (inputs[0] && typeof inputs[0].viewId === 'string') {
          return inputs[0].viewId;
        }
      }

      // Update/delete operations on child entities with top-level id arg
      if (childEntityKind && typeof args.id === 'string') {
        return await this.viewEntityLookupService.findViewIdByEntityIdAndKind(
          childEntityKind,
          args.id,
          workspaceId,
        );
      }

      // Update/delete operations on child entities with id in input
      if (input && typeof input.id === 'string') {
        if (!childEntityKind) {
          throw new Error(
            'childEntityKind is required for update/delete operations on view child entities',
          );
        }

        return await this.viewEntityLookupService.findViewIdByEntityIdAndKind(
          childEntityKind,
          input.id,
          workspaceId,
        );
      }

      // Bulk delete operations on child entities
      const ids = args.ids as string[] | undefined;

      if (ids && ids[0]) {
        if (!childEntityKind) {
          throw new Error(
            'childEntityKind is required for bulk delete operations on view child entities',
          );
        }

        return await this.viewEntityLookupService.findViewIdByEntityIdAndKind(
          childEntityKind,
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

  return mixin(ViewPermissionGuardMixin);
};
