import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RoutingAvailabilityAuditService } from 'src/modules/enso/routing-availability/services/routing-availability-audit.service';

// Pre-hook on the resolver behind the "Accepting leads" toggle
// (updateOneRecord → updateOne). When the update touches
// `isAvailableForRouting`, we record the on/off transition to PostHog. The
// payload is returned untouched — this hook only observes, it never mutates the
// write.
@Injectable()
@WorkspaceQueryHook(`workspaceMember.updateOne`)
export class WorkspaceMemberUpdateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly routingAvailabilityAuditService: RoutingAvailabilityAuditService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<Record<string, unknown>>,
  ): Promise<UpdateOneResolverArgs<Record<string, unknown>>> {
    if (
      isDefined(payload.data) &&
      'isAvailableForRouting' in payload.data &&
      isDefined(payload.id)
    ) {
      await this.routingAvailabilityAuditService.recordTransition(
        authContext,
        payload.id,
        payload.data.isAvailableForRouting === true,
      );
    }

    return payload;
  }
}
