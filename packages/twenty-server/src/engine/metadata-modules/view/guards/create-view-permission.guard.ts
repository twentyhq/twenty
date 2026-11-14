import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewVisibility } from 'twenty-shared/types';

import { ViewAccessService } from 'src/engine/permissions/metadata-permissions/services/view-access.service';
import { resolveViewAccessContext } from 'src/engine/metadata-modules/view/utils/resolve-view-access-context.util';

@Injectable()
export class CreateViewPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    let visibility: ViewVisibility = ViewVisibility.WORKSPACE;

    const args = gqlContext.getArgs();

    // Only the REST body is the view input; a GraphQL body also carries query and variables
    const input = args?.input ?? request.body;

    if (input?.visibility) {
      visibility = input.visibility as ViewVisibility;
    }

    return this.viewAccessService.canUserCreateView({
      visibility,
      ownerViewFieldId: input?.ownerViewFieldId,
      accessContext: resolveViewAccessContext(request),
    });
  }
}
