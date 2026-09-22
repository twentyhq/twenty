import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewVisibility } from 'twenty-shared/types';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { resolveViewAccessContext } from 'src/engine/metadata-modules/view-permissions/utils/resolve-view-access-context.util';

@Injectable()
export class CreateViewPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    let visibility: ViewVisibility = ViewVisibility.WORKSPACE;

    const args = gqlContext.getArgs();

    if (args?.input?.visibility) {
      visibility = args.input.visibility as ViewVisibility;
    }

    if (!args?.input && request.body?.visibility) {
      visibility = request.body.visibility as ViewVisibility;
    }

    return this.viewAccessService.canUserCreateView(
      visibility,
      resolveViewAccessContext(request),
    );
  }
}
