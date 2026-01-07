import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';

@Injectable()
export class CreateViewPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    let visibility: ViewVisibility = ViewVisibility.WORKSPACE;

    // For GraphQL: extract from args.input
    const args = gqlContext.getArgs();

    if (args?.input?.visibility) {
      visibility = args.input.visibility as ViewVisibility;
    }

    // For REST: extract from request body
    if (!args?.input && request.body?.visibility) {
      visibility = request.body.visibility as ViewVisibility;
    }

    return this.viewAccessService.canUserCreateView(
      visibility,
      request.userWorkspaceId,
      request.workspace.id,
      request.apiKey?.id,
    );
  }
}
