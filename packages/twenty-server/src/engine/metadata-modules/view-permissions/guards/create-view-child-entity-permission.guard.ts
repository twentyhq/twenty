import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { resolveViewAccessContext } from 'src/engine/metadata-modules/view-permissions/utils/resolve-view-access-context.util';
import { resolveViewChildEntityViewId } from 'src/engine/metadata-modules/view-permissions/utils/resolve-view-child-entity-view-id.util';

@Injectable()
export class CreateViewChildEntityPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();

    const viewId = resolveViewChildEntityViewId({ args, body: request.body });

    return this.viewAccessService.canUserModifyViewByChildEntity(
      viewId,
      resolveViewAccessContext(request),
    );
  }
}
