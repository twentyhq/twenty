import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  CompanyDomainUniquenessValidator,
  type CompanyDomainPayload,
} from 'src/modules/company/services/company-domain-uniqueness.validator';

@WorkspaceQueryHook(`company.createMany`)
export class CompanyCreateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly validator: CompanyDomainUniquenessValidator,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs<CompanyDomainPayload>,
  ): Promise<CreateManyResolverArgs<CompanyDomainPayload>> {
    await this.validator.validateForCreate({
      workspaceId: authContext.workspace.id,
      payloads: payload.data,
      upsert: payload.upsert ?? false,
    });

    return payload;
  }
}
