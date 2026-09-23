import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { resolveViewAccessContext } from 'src/engine/metadata-modules/view-permissions/utils/resolve-view-access-context.util';
import { resolveViewChildEntityViewIds } from 'src/engine/metadata-modules/view-permissions/utils/resolve-view-child-entity-view-id.util';

@Injectable()
export class CreateViewChildEntityPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const args = gqlContext.getArgs();

    const viewIds = resolveViewChildEntityViewIds({
      args,
      body: request.body,
    });
    const accessContext = resolveViewAccessContext(request);

    if (viewIds.length === 0) {
      return this.viewAccessService.canUserModifyViewByChildEntity(
        null,
        accessContext,
      );
    }

    for (const viewId of viewIds) {
      const canModify =
        await this.viewAccessService.canUserModifyViewByChildEntity(
          viewId,
          accessContext,
        );

      if (!canModify) {
        return false;
      }
    }

    return true;
  }
}
