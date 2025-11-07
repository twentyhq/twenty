import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';

@Injectable()
export class UpdateViewFilterGroupPermissionGuard implements CanActivate {
  constructor(
    private readonly viewAccessService: ViewAccessService,
    private readonly viewEntityLookupService: ViewEntityLookupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();

    const entityId = typeof args.id === 'string' ? args.id : '';
    const viewId = entityId
      ? await this.viewEntityLookupService.findViewIdByEntityIdAndKind(
          'viewFilterGroup',
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
