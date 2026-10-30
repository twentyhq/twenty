import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type CompanyTaxonomyFields } from 'src/modules/company-specialty/types/company-taxonomy-fields.type';
import { resolveCompanyTaxonomyFields } from 'src/modules/company-specialty/utils/resolve-company-taxonomy-fields.util';

@WorkspaceQueryHook('company.updateOne')
export class CompanyUpdateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<CompanyTaxonomyFields>,
  ): Promise<UpdateOneResolverArgs<CompanyTaxonomyFields>> {
    if (!('specialty' in payload.data) && !('subspecialty' in payload.data)) {
      return payload;
    }

    const existing = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () =>
        this.workspaceOrmManager
          .getRepository<ObjectRecord>('company', {
            shouldBypassPermissionChecks: true,
          })
          .findOne({
            where: { id: payload.id },
            select: ['id', 'specialty', 'subspecialty'],
          }),
      authContext,
    );

    return {
      ...payload,
      data: resolveCompanyTaxonomyFields({
        data: payload.data,
        existing: isDefined(existing)
          ? {
              specialty: existing.specialty,
              subspecialty: existing.subspecialty,
            }
          : undefined,
      }),
    };
  }
}
