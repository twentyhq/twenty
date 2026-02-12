import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';

@Injectable()
export class CreateViewFilterGroupPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    let viewId: string | null = null;

    // For GraphQL: extract from args.input
    const args = gqlContext.getArgs();

    if (typeof args?.input?.viewId === 'string') {
      viewId = args.input.viewId;
    }

    // For REST: extract from request body
    if (!viewId && typeof request.body?.viewId === 'string') {
      viewId = request.body.viewId;
    }

    return this.viewAccessService.canUserModifyViewByChildEntity(
      viewId,
      request.userWorkspaceId,
      request.workspace.id,
      request.apiKey?.id,
    );
  }
}
