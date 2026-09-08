import { Injectable, Logger } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { RoutingAvailabilityAuditService } from 'src/modules/enso/routing-availability/services/routing-availability-audit.service';

type WorkspaceMemberRow = { id: string; isAvailableForRouting?: boolean | null };

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
    // Audit first, while the previous value is still on the row — the service
    // reads it to decide whether this is a real transition.
    // recordTransition only reads workspace.id off the context and resolves the
    // manager's identity from the row itself, so a system context is enough.
    await this.routingAvailabilityAuditService.recordTransition(
      buildSystemAuthContext(workspaceId),
      workspaceMemberId,
      isAvailableForRouting,
    );

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository =
        await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberRow>(
          workspaceId,
          'workspaceMember',
          { shouldBypassPermissionChecks: true },
        );

      await repository.update(workspaceMemberId, { isAvailableForRouting });
    });

    this.logger.log(
      `routing availability set to ${isAvailableForRouting} by member ${workspaceMemberId}`,
    );

    return isAvailableForRouting;
  }
}
