import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { EnsoPostHogService } from 'src/modules/enso/routing-availability/services/enso-posthog.service';

const ROUTING_AVAILABILITY_EVENT = 'routing_availability_changed';

// Captures a PostHog event whenever a manager's lead-routing presence
// (`workspaceMember.isAvailableForRouting`) actually flips. It loads the prior
// value and only emits on a real transition — no event on no-op writes or updates that leave the flag
// unchanged. The raw on/off stream powers the "how long / when do managers accept
// leads" analytics in PostHog (durations + time-of-day derived there, not stored).
@Injectable()
export class RoutingAvailabilityAuditService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly ensoPostHogService: EnsoPostHogService,
  ) {}

  async recordTransition(
    authContext: WorkspaceAuthContext,
    workspaceMemberId: string,
    incomingValue: boolean,
    // Pass this when the caller already applied the change and knows what the
    // value was beforehand. Without it the previous value is read from the row,
    // which is only correct BEFORE the write lands.
    knownPreviousValue?: boolean,
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId)) {
      return;
    }

    // A missing id would turn the lookup below into an unfiltered findOne and
    // attribute the event to whichever member came back first. That happened:
    // a call with no member context logged a transition against a colleague
    // who had done nothing.
    if (!isDefined(workspaceMemberId)) {
      return;
    }

    const systemAuthContext = buildSystemAuthContext(workspaceId);

    const member =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const repository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          return repository.findOne({ where: { id: workspaceMemberId } });
        },
        systemAuthContext,
      );

    if (!isDefined(member)) {
      return;
    }

    const previousValue = isDefined(knownPreviousValue)
      ? knownPreviousValue
      : member.isAvailableForRouting === true;

    // No real transition → nothing to log (e.g. toggled to the same value, or an
    // update that included the field without changing it).
    if (previousValue === incomingValue) {
      return;
    }

    const firstName = member.name?.firstName ?? '';
    const lastName = member.name?.lastName ?? '';
    const managerName = `${firstName} ${lastName}`.trim() || 'Unknown manager';

    this.ensoPostHogService.capture({
      event: ROUTING_AVAILABILITY_EVENT,
      // Stable per-manager id so PostHog groups all flips under one person.
      distinctId: `workspace_member:${workspaceMemberId}`,
      properties: {
        state: incomingValue ? 'accepting' : 'paused',
        workspace_member_id: workspaceMemberId,
        workspace_id: workspaceId,
        source: 'crm',
        // Carried on the event itself so dashboard queries read manager names
        // directly (no dependency on person-mode resolution timing)...
        manager_name: managerName,
        manager_email: member.userEmail ?? null,
        // ...and also stamped on the PostHog person for cross-event grouping.
        $set: {
          manager_name: managerName,
          manager_email: member.userEmail ?? null,
        },
      },
    });
  }
}
