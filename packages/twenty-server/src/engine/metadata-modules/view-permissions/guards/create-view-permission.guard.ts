import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewVisibility } from 'twenty-shared/types';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';

@Injectable()
export class CreateViewPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    let visibility: ViewVisibility = ViewVisibility.WORKSPACE;
    let isLocked = false;

    // For GraphQL: extract from args.input
    const args = gqlContext.getArgs();

    if (args?.input?.visibility) {
      visibility = args.input.visibility as ViewVisibility;
    }

    if (typeof args?.input?.isLocked === 'boolean') {
      isLocked = args.input.isLocked;
    }

    // For REST: extract from request body
    if (!args?.input && request.body?.visibility) {
      visibility = request.body.visibility as ViewVisibility;
    }

    if (!args?.input && typeof request.body?.isLocked === 'boolean') {
      isLocked = request.body.isLocked;
    }

    return this.viewAccessService.canUserCreateView(
      visibility,
      isLocked,
      request.userWorkspaceId,
      request.workspace.id,
      request.apiKey?.id,
    );
  }
}
