import { Test } from '@nestjs/testing';

import { WorkflowActionType } from 'twenty-shared/workflow';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';

describe('WorkflowVersionStepOperationsWorkspaceService', () => {
  let service: WorkflowVersionStepOperationsWorkspaceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WorkflowVersionStepOperationsWorkspaceService,
        ...[
          WorkspaceOrmManager,
          LogicFunctionFromSourceService,
          CodeStepBuildService,
          AgentService,
          getWorkspaceScopedRepositoryToken(RoleTargetEntity),
          getWorkspaceScopedRepositoryToken(ObjectMetadataEntity),
          WorkflowCommonWorkspaceService,
          AiAgentRoleService,
          WorkspaceCacheService,
          WorkspaceManyOrAllFlatEntityMapsCacheService,
          WorkflowVersionCoreSyncService,
          FindRecordsService,
          FeatureFlagService,
        ].map((provide) => ({ provide, useValue: {} })),
      ],
    }).compile();

    service = module.get(WorkflowVersionStepOperationsWorkspaceService);
  });

  const buildSendEmailStep = async (
    defaultSettings?: Record<string, unknown>,
  ) => {
    const { builtStep } = await service.runStepCreationSideEffectsAndBuildStep({
      type: WorkflowActionType.SEND_EMAIL,
      workspaceId: 'workspace-id',
      defaultSettings,
    });

    return builtStep.settings.input as {
      connectedAccountId: string;
      fromHandle?: string;
    };
  };

  describe('SEND_EMAIL step creation', () => {
    it('should use the default sender when provided', async () => {
      const input = await buildSendEmailStep({
        input: {
          connectedAccountId: 'acc',
          fromHandle: 'jane@example.com',
        },
      });

      expect(input.connectedAccountId).toBe('acc');
      expect(input.fromHandle).toBe('jane@example.com');
    });

    it('should leave the input unchanged without default settings', async () => {
      const input = await buildSendEmailStep();

      expect(input.connectedAccountId).toBe('');
      expect(input).not.toHaveProperty('fromHandle');
    });

    it('should ignore empty or non-string default sender values', async () => {
      const input = await buildSendEmailStep({
        input: { connectedAccountId: '', fromHandle: 42 },
      });

      expect(input.connectedAccountId).toBe('');
      expect(input).not.toHaveProperty('fromHandle');
    });
  });
});
