import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { PersonProjectConsentNameService } from 'src/modules/enso/person-project-consent/services/person-project-consent-name.service';

@Injectable()
@WorkspaceQueryHook(`personProjectConsent.createMany`)
export class PersonProjectConsentCreateManyPreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly personProjectConsentNameService: PersonProjectConsentNameService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs<Record<string, unknown>>,
  ): Promise<CreateManyResolverArgs<Record<string, unknown>>> {
    if (!isDefined(payload.data)) {
      return payload;
    }

    const data = await Promise.all(
      payload.data.map(async (record) => {
        const name = await this.personProjectConsentNameService.computeName(
          authContext,
          record,
        );

        return isDefined(name) ? { ...record, name } : record;
      }),
    );

    return { ...payload, data };
  }
}
