import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  type Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type ViewChildEntityKind } from 'src/engine/metadata-modules/view-permissions/types/view-permissions.types';
import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';

// Update, delete and destroy all name their target the same way: the entity id
// arrives in the mutation input or the REST path, and the view it belongs to
// has to be looked up before access can be decided.
export const ViewChildEntityPermissionGuard = (
  kind: ViewChildEntityKind,
): Type<CanActivate> => {
  @Injectable()
  class ViewChildEntityPermissionGuardMixin implements CanActivate {
    constructor(
      private readonly viewAccessService: ViewAccessService,
      private readonly viewEntityLookupService: ViewEntityLookupService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const gqlContext = GqlExecutionContext.create(context);
      const request = gqlContext.getContext().req;
      const args = gqlContext.getArgs();

      const entityId =
        (typeof args?.input?.id === 'string' ? args.input.id : undefined) ??
        (typeof request.params?.id === 'string' ? request.params.id : '');

      const viewId = entityId
        ? await this.viewEntityLookupService.findViewIdByEntityIdAndKind(
            kind,
            entityId,
            request.workspace.id,
          )
        : null;

      return this.viewAccessService.canUserModifyViewByChildEntity(
        viewId,
        request.userWorkspaceId,
        request.workspace.id,
        request.apiKey?.id,
      );
    }
  }

  return ViewChildEntityPermissionGuardMixin;
};
