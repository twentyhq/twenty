import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';

// Creation names the target view directly, so no lookup is needed. The bulk
// argument is only populated by the entities that expose a bulk mutation; for
// the rest it is absent and the branch does nothing.
@Injectable()
export class CreateViewChildEntityPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();

    const viewId =
      (typeof args?.input?.viewId === 'string'
        ? args.input.viewId
        : undefined) ??
      (Array.isArray(args?.inputs) && typeof args.inputs[0]?.viewId === 'string'
        ? args.inputs[0].viewId
        : undefined) ??
      (typeof request.body?.viewId === 'string' ? request.body.viewId : null);

    return this.viewAccessService.canUserModifyViewByChildEntity(
      viewId,
      request.userWorkspaceId,
      request.workspace.id,
      request.apiKey?.id,
    );
  }
}
