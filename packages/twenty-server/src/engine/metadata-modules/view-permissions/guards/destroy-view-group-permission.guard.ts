import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';

@Injectable()
export class DestroyViewGroupPermissionGuard implements CanActivate {
  constructor(
    private readonly viewAccessService: ViewAccessService,
    private readonly viewEntityLookupService: ViewEntityLookupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();

    const entityId = typeof args.input?.id === 'string' ? args.input.id : '';
    const viewId = entityId
      ? await this.viewEntityLookupService.findViewIdByEntityIdAndKind(
          'viewGroup',
          entityId,
          request.workspace.id,
        )
      : null;

    return this.viewAccessService.canUserModifyViewByChildEntity(
      viewId,
      request.userWorkspaceId,
      request.workspace.id,
    );
  }
}
