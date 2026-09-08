import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { RoutingAvailabilityAuditService } from 'src/modules/enso/routing-availability/services/routing-availability-audit.service';
import {
  RoutingAvailabilityException,
  RoutingAvailabilityExceptionCode,
} from 'src/modules/enso/routing-availability/routing-availability.exception';

type WorkspaceMemberRow = {
  id: string;
  isAvailableForRouting?: boolean | null;
};

// Lets a member flip their OWN lead-routing presence.
//
// The generic workspaceMember update cannot serve this: Twenty gates update on
// that object behind the WORKSPACE_MEMBERS settings flag, and granting it to
// sales managers would also let them edit and delete their colleagues. So this
// exists to be exactly one row wide — the member is taken from the auth
// context and never from the client, so nobody can toggle anyone else.
//
// The write bypasses permission checks by necessity, which also skips the
// workspaceMember.updateOne pre-hook, so the audit is invoked here explicitly.
@Injectable()
export class RoutingAvailabilitySelfService {
  private readonly logger = new Logger(RoutingAvailabilitySelfService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly routingAvailabilityAuditService: RoutingAvailabilityAuditService,
  ) {}

  async setOwnAvailability({
    workspaceId,
    workspaceMemberId,
    isAvailableForRouting,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    isAvailableForRouting: boolean;
  }): Promise<boolean> {
    // Read, write, then audit — in that order, and only audit what actually
    // landed. Auditing an intended change before it is applied is how the old
    // pre-hook logged transitions for writes that permissions then rejected.
    const previousValue =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const repository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberRow>(
              workspaceId,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          const member = await repository.findOne({
            where: { id: workspaceMemberId },
          });

          if (!isDefined(member)) {
            return null;
          }

          await repository.update(workspaceMemberId, { isAvailableForRouting });

          return member.isAvailableForRouting === true;
        },
      );

    if (!isDefined(previousValue)) {
      throw new RoutingAvailabilityException(
        'Your workspace member record could not be found.',
        RoutingAvailabilityExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    // recordTransition only reads workspace.id off the context, so a system
    // context is enough; identity comes from the member row.
    await this.routingAvailabilityAuditService.recordTransition(
      buildSystemAuthContext(workspaceId),
      workspaceMemberId,
      isAvailableForRouting,
      previousValue,
    );

    this.logger.log(
      `routing availability set to ${isAvailableForRouting} by member ${workspaceMemberId}`,
    );

    return isAvailableForRouting;
  }
}
