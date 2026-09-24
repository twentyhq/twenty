import type { ActorMetadata } from 'twenty-shared/types';

import type { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import type { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import type { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import type { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import type { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import type { CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import type { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import type { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import type { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import type { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import type { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import type { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';

export type WorkflowToolDependencies = {
  coreWorkflowListService: CoreWorkflowListService;
  coreWorkflowVersionListService: CoreWorkflowVersionListService;
  coreWorkflowMutationService: CoreWorkflowMutationWorkspaceService;
  coreWorkflowVersionMutationService: CoreWorkflowVersionMutationWorkspaceService;
  coreWorkflowVersionWriteService: CoreWorkflowVersionWriteService;
  coreWorkflowLifecycleService: CoreWorkflowLifecycleWorkspaceService;
  workflowSchemaService: WorkflowSchemaWorkspaceService;
  workspaceOrmManager: WorkspaceOrmManager;
  logicFunctionFromSourceService: LogicFunctionFromSourceService;
  flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;
  agentService: AgentService;
};

export type WorkflowToolContext = {
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
  actorContext?: ActorMetadata;
  userWorkspaceId?: string;
};
