import { Injectable } from '@nestjs/common';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

const PARENT_SUFFIX = ' (Parent)';

// accountType is a custom field not present on the TypeScript entity type.
type CompanyData = Partial<CompanyWorkspaceEntity> & {
  accountType?: string | null;
};

@WorkspaceQueryHook('company.updateOne')
@Injectable()
export class CompanyUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    const data = payload.data as CompanyData;
    const newAccountType = data.accountType;

    // Only act if accountType is explicitly being changed in this update.
    if (newAccountType === undefined) return payload;

    const workspaceId = authContext.workspace.id;

    // Fetch the current name so we can append/strip the suffix correctly.
    // If the user is also renaming in the same save, use their new name as the base.
    const currentName = await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const repo =
          await this.globalWorkspaceOrmManager.getRepository<CompanyWorkspaceEntity>(
            workspaceId,
            'company',
          );

        const record = await repo.findOne({
          where: { id: payload.id } as Parameters<typeof repo.findOne>[0]['where'],
        });

        return record?.name ?? '';
      },
      buildSystemAuthContext(workspaceId),
    );

    const baseName = data.name ?? currentName;
    const isNowParent = newAccountType === 'PARENT';
    const alreadyHasSuffix = baseName.endsWith(PARENT_SUFFIX);

    let newName: string | undefined;

    if (isNowParent && !alreadyHasSuffix) {
      newName = baseName + PARENT_SUFFIX;
    } else if (!isNowParent && alreadyHasSuffix) {
      newName = baseName.slice(0, -PARENT_SUFFIX.length);
    }

    if (newName !== undefined) {
      return {
        ...payload,
        data: { ...payload.data, name: newName },
      };
    }

    return payload;
  }
}
