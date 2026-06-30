import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import {
  authorizeViewIdsByChildEntity,
  extractViewIdsFromArgsAndRequest,
  getViewPermissionGuardRequestAndArgs,
} from 'src/engine/metadata-modules/view-permissions/guards/utils/view-permission-guard.util';

@Injectable()
export class CreateViewFieldGroupPermissionGuard implements CanActivate {
  constructor(private readonly viewAccessService: ViewAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { args, request } = getViewPermissionGuardRequestAndArgs(context);
    const viewIds = extractViewIdsFromArgsAndRequest({ args, request });

    return authorizeViewIdsByChildEntity({
      viewAccessService: this.viewAccessService,
      viewIds,
      request,
    });
  }
}
