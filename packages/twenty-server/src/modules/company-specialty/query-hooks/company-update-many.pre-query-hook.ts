import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CompanyTaxonomyFields } from 'src/modules/company-specialty/types/company-taxonomy-fields.type';
import { resolveCompanyTaxonomyFields } from 'src/modules/company-specialty/utils/resolve-company-taxonomy-fields.util';

@WorkspaceQueryHook('company.updateMany')
export class CompanyUpdateManyPreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateManyResolverArgs<CompanyTaxonomyFields>,
  ): Promise<UpdateManyResolverArgs<CompanyTaxonomyFields>> {
    return {
      ...payload,
      data: resolveCompanyTaxonomyFields({ data: payload.data }),
    };
  }
}
