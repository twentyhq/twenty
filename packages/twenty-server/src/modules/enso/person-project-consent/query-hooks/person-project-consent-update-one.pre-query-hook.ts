import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { PersonProjectConsentAuditService } from 'src/modules/enso/person-project-consent/services/person-project-consent-audit.service';
import { PersonProjectConsentNameService } from 'src/modules/enso/person-project-consent/services/person-project-consent-name.service';

@Injectable()
@WorkspaceQueryHook(`personProjectConsent.updateOne`)
export class PersonProjectConsentUpdateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly personProjectConsentNameService: PersonProjectConsentNameService,
    private readonly personProjectConsentAuditService: PersonProjectConsentAuditService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<Record<string, unknown>>,
  ): Promise<UpdateOneResolverArgs<Record<string, unknown>>> {
    if (!isDefined(payload.data)) {
      return payload;
    }

    let data = payload.data;

    // Recompute the composite name only when a relation that feeds it changed.
    if ('personId' in data || 'projectId' in data) {
      const name = await this.personProjectConsentNameService.computeName(
        authContext,
        { ...data, id: payload.id },
      );

      if (isDefined(name)) {
        data = { ...data, name };
      }
    }

    // Stamp consent audit fields when a manager toggles a channel (grant →
    // VERBAL + consentedAt; revoke → revokedAt). No-op if no channel changed.
    const auditStamps =
      await this.personProjectConsentAuditService.computeAuditStamps(
        authContext,
        data,
        payload.id,
      );

    data = { ...data, ...auditStamps };

    return { ...payload, data };
  }
}
