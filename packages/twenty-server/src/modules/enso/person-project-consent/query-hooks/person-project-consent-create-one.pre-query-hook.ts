import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { PersonProjectConsentAuditService } from 'src/modules/enso/person-project-consent/services/person-project-consent-audit.service';
import { PersonProjectConsentNameService } from 'src/modules/enso/person-project-consent/services/person-project-consent-name.service';

@Injectable()
@WorkspaceQueryHook(`personProjectConsent.createOne`)
export class PersonProjectConsentCreateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly personProjectConsentNameService: PersonProjectConsentNameService,
    private readonly personProjectConsentAuditService: PersonProjectConsentAuditService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<Record<string, unknown>>,
  ): Promise<CreateOneResolverArgs<Record<string, unknown>>> {
    if (!isDefined(payload.data)) {
      return payload;
    }

    let data = payload.data;

    const name = await this.personProjectConsentNameService.computeName(
      authContext,
      data,
    );

    if (isDefined(name)) {
      data = { ...data, name };
    }

    // A human-created consent row with a channel on → stamp the grant
    // (VERBAL default + consentedAt). No existing row, so any true channel is a
    // fresh grant.
    const auditStamps =
      await this.personProjectConsentAuditService.computeAuditStamps(
        authContext,
        data,
      );

    data = { ...data, ...auditStamps };

    return { ...payload, data };
  }
}
