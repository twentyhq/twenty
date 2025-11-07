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
    const args = gqlContext.getArgs();

    const viewId = typeof args.id === 'string' ? args.id : null;

    return this.viewAccessService.canUserModifyView(
      viewId,
      request.userWorkspaceId,
      request.workspace.id,
    );
  }
}
