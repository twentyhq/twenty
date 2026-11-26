import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isBoolean } from '@sniptt/guards';

import { ViewAccessService } from 'src/engine/permissions/metadata-permissions/services/view-access.service';
import { resolveViewAccessContext } from 'src/engine/metadata-modules/view/utils/resolve-view-access-context.util';

@Injectable()
export class CreateViewPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    const args = gqlContext.getArgs();
    const input = args?.input ?? request.body;

    const isPrivate = isBoolean(input?.isPrivate) ? input.isPrivate : false;

    return this.viewAccessService.canUserCreateView({
      isPrivate,
      accessContext: resolveViewAccessContext(request),
    });
  }
}
