import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';

import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';
import {
  authorizeEntityIdsByChildEntity,
  extractEntityIdsFromArgsAndRequest,
  getViewPermissionGuardRequestAndArgs,
} from 'src/engine/metadata-modules/view-permissions/guards/utils/view-permission-guard.util';

@Injectable()
export class DeleteViewSortPermissionGuard implements CanActivate {
  constructor(
    private readonly viewAccessService: ViewAccessService,
    private readonly viewEntityLookupService: ViewEntityLookupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { args, request } = getViewPermissionGuardRequestAndArgs(context);
    const entityIds = extractEntityIdsFromArgsAndRequest({ args, request });

    return authorizeEntityIdsByChildEntity({
      viewAccessService: this.viewAccessService,
      viewEntityLookupService: this.viewEntityLookupService,
      kind: 'viewSort',
      entityIds,
      request,
    });
  }
}
