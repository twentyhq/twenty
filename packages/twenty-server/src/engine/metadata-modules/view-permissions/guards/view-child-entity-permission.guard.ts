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

      // The top-level id is the authoritative one where a mutation takes it:
      // its input extends a partial create input that also carries an
      // optional id, and only the argument routes the mutation.
      const entityId =
        (typeof args?.id === 'string' ? args.id : undefined) ??
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
