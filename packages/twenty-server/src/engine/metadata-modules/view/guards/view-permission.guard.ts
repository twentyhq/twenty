import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isBoolean, isNonEmptyString } from '@sniptt/guards';

import { ViewAccessService } from 'src/engine/permissions/metadata-permissions/services/view-access.service';
import { resolveViewAccessContext } from 'src/engine/metadata-modules/view/utils/resolve-view-access-context.util';

@Injectable()
export class ViewPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();

    const viewId =
      [args?.id, request.params?.id].find(isNonEmptyString) ?? null;

    const input = args?.input ?? request.body;

    const nextIsPrivate = isBoolean(input?.isPrivate)
      ? input.isPrivate
      : undefined;

    return this.viewAccessService.canUserModifyView({
      viewId,
      accessContext: resolveViewAccessContext(request),
      nextIsPrivate,
    });
  }
}
