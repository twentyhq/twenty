import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { readPersonPhoneE164 } from 'src/modules/enso/shared/utils/person-phone.util';

// Opportunity.name is a plain scalar TEXT field, but for inbound-created deals we
// want a meaningful label rather than "Untitled": "Deal | <phone or name> | <project>"
// e.g. "Deal | +37379628432 | ARTIMA Business & Lifestyle". (The channel/source
// lives in the Opportunity's Source field, so it isn't repeated in the name.)
const OPPORTUNITY_NAME_PREFIX = 'Deal';

type OpportunityNameInput = {
  personId?: string | null;
  projectId?: string | null;
  // Accepted for backwards compatibility with callers; no longer part of the name.
  source?: string | null;
};

@Injectable()
export class OpportunityNameService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async computeName(
    authContext: WorkspaceAuthContext,
    input: OpportunityNameInput,
  ): Promise<string | undefined> {
    const workspaceId = authContext.workspace?.id;

    if (!workspaceId) {
      return undefined;
    }

    // Reference data (person, project) is read with a system context that
    // bypasses permission checks — same rationale as the junction name services.
    const systemAuthContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        let who = '';

        if (input.personId) {
          const personRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'person',
              { shouldBypassPermissionChecks: true },
            );

          const person = await personRepository.findOne({
            where: { id: input.personId },
          });

          // Phone OR name. readPersonPhoneE164 returns undefined for
          // phone-less people (e.g. social contacts) — primaryPhoneNumber
          // defaults to '' rather than null there — so fall back to the name.
          const phone = readPersonPhoneE164(person);

          who = isNonEmptyString(phone)
            ? phone
            : `${person?.name?.firstName ?? ''} ${person?.name?.lastName ?? ''}`.trim();
        }

        let projectName = '';

        if (input.projectId) {
          const projectRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'project',
              { shouldBypassPermissionChecks: true },
            );

          const project = await projectRepository.findOne({
            where: { id: input.projectId },
          });

          projectName = project?.name ?? '';
        }

        const parts = [OPPORTUNITY_NAME_PREFIX, who, projectName].filter(
          Boolean,
        );

        return parts.length > 0 ? parts.join(' | ') : undefined;
      },
      systemAuthContext,
    );
  }
}
