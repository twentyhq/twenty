import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';

@Injectable()
export class CreateViewFieldPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();

    // Try single create with input.viewId
    let viewId =
      typeof args.input?.viewId === 'string' ? args.input.viewId : null;

    // If not found, try bulk create with inputs[0].viewId
    if (!viewId && Array.isArray(args.inputs) && args.inputs.length > 0) {
      viewId =
        typeof args.inputs[0]?.viewId === 'string'
          ? args.inputs[0].viewId
          : null;
    }

    return this.viewAccessService.canUserModifyViewByChildEntity(
      viewId,
      request.userWorkspaceId,
      request.workspace.id,
    );
  }
}
