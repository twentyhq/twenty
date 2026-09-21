import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { RecordVisibilityPolicyEntity } from 'src/engine/metadata-modules/record-visibility-policy/entities/record-visibility-policy.entity';
import { type RecordVisibilityPoliciesByRoleId } from 'src/engine/twenty-orm/types/record-visibility-policy.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';

@Injectable()
@WorkspaceCache('recordVisibilityPolicies', { packingPonderation: 1 })
export class WorkspaceRecordVisibilityPolicyCacheService extends WorkspaceCacheProvider<RecordVisibilityPoliciesByRoleId> {
  constructor(
    @InjectWorkspaceScopedRepository(RecordVisibilityPolicyEntity)
    private readonly recordVisibilityPolicyRepository: WorkspaceScopedRepository<RecordVisibilityPolicyEntity>,
  ) {
    super();
  }

  async computeForCache({
    workspaceId,
  }: WorkspaceCacheProviderContext): Promise<RecordVisibilityPoliciesByRoleId> {
    const policies =
      await this.recordVisibilityPolicyRepository.find(workspaceId);

    const policiesByRoleId: RecordVisibilityPoliciesByRoleId = {};

    for (const policy of policies) {
      const policiesByObjectMetadataId = (policiesByRoleId[policy.roleId] ??=
        {});

      policiesByObjectMetadataId[policy.objectMetadataId] = {
        filter: policy.filter,
        currentMemberFieldName: policy.currentMemberFieldName,
      };
    }

    return policiesByRoleId;
  }
}
