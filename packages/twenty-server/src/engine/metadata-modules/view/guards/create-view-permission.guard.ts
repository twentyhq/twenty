import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewAccessService } from 'src/engine/permissions/metadata-permissions/services/view-access.service';
import { resolveViewAccessContext } from 'src/engine/metadata-modules/view/utils/resolve-view-access-context.util';
import { resolveViewIsPrivateFromInput } from 'src/engine/metadata-modules/view/utils/resolve-view-is-private-from-input.util';

@Injectable()
export class CreateViewPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    const args = gqlContext.getArgs();
    const input = args?.input ?? request.body;

    const isPrivate =
      resolveViewIsPrivateFromInput({
        isPrivate: input?.isPrivate,
        visibility: input?.visibility,
      }) ?? false;

    return this.viewAccessService.canUserCreateView({
      isPrivate,
      accessContext: resolveViewAccessContext(request),
    });
  }
}
