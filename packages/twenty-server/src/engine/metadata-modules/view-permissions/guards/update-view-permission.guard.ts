import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';

@Injectable()
export class UpdateViewPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    let viewId: string | null = null;
    let isLockUpdateRequested = false;

    // For GraphQL: extract from args
    const args = gqlContext.getArgs();

    if (typeof args?.id === 'string') {
      viewId = args.id;
    }

    if (typeof args?.input?.isLocked === 'boolean') {
      isLockUpdateRequested = true;
    }

    // For REST: extract from URL params
    if (!viewId && typeof request.params?.id === 'string') {
      viewId = request.params.id;
    }

    if (typeof request.body?.isLocked === 'boolean') {
      isLockUpdateRequested = true;
    }

    return this.viewAccessService.canUserModifyView(
      viewId,
      request.userWorkspaceId,
      request.workspace.id,
      request.apiKey?.id,
      { isLockUpdateRequested },
    );
  }
}
