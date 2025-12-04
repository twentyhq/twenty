import { Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/schemas';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';
import {
  type ToolHints,
  type ToolOperation,
} from 'src/engine/metadata-modules/ai/ai-chat-router/types/tool-hints.interface';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import { createActivateWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/activate-workflow-version.tool';
import { createComputeStepOutputSchemaTool } from 'src/modules/workflow/workflow-tools/tools/compute-step-output-schema.tool';
import { createCreateCompleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/create-complete-workflow.tool';
import { createCreateDraftFromWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/create-draft-from-workflow-version.tool';
import { createCreateWorkflowVersionEdgeTool } from 'src/modules/workflow/workflow-tools/tools/create-workflow-version-edge.tool';
import { createCreateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/create-workflow-version-step.tool';
import { createDeactivateWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/deactivate-workflow-version.tool';
import { createDeleteWorkflowVersionEdgeTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow-version-edge.tool';
import { createDeleteWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow-version-step.tool';
import { createCreateRecordStepConfiguratorTool } from 'src/modules/workflow/workflow-tools/tools/record-step-configurators/create-record-step-configurator.factory';
import { createDeleteRecordStepConfiguratorTool } from 'src/modules/workflow/workflow-tools/tools/record-step-configurators/delete-record-step-configurator.factory';
import { createFindRecordsStepConfiguratorTool } from 'src/modules/workflow/workflow-tools/tools/record-step-configurators/find-records-step-configurator.factory';
import { createUpdateRecordStepConfiguratorTool } from 'src/modules/workflow/workflow-tools/tools/record-step-configurators/update-record-step-configurator.factory';
import { createUpdateWorkflowVersionPositionsTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-positions.tool';
import { createUpdateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-step.tool';
import { type WorkflowToolDependencies } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Injectable()
export class WorkflowToolWorkspaceService {
  private readonly logger = new Logger(WorkflowToolWorkspaceService.name);
  private readonly deps: WorkflowToolDependencies;

  constructor(
    workflowVersionStepService: WorkflowVersionStepWorkspaceService,
    workflowVersionEdgeService: WorkflowVersionEdgeWorkspaceService,
    workflowVersionService: WorkflowVersionWorkspaceService,
    workflowTriggerService: WorkflowTriggerWorkspaceService,
    workflowSchemaService: WorkflowSchemaWorkspaceService,
    twentyORMGlobalManager: TwentyORMGlobalManager,
    recordPositionService: RecordPositionService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    this.deps = {
      workflowVersionStepService,
      workflowVersionEdgeService,
      workflowVersionService,
      workflowTriggerService,
      workflowSchemaService,
      twentyORMGlobalManager,
      recordPositionService,
    };
  }

  // Generates static workflow tools that don't depend on workspace objects
  generateWorkflowTools(
    workspaceId: string,
    rolePermissionConfig: RolePermissionConfig,
  ): ToolSet {
    const context = { workspaceId };
    const contextWithPermissions = { workspaceId, rolePermissionConfig };

    const createCompleteWorkflow = createCreateCompleteWorkflowTool(
      this.deps,
      contextWithPermissions,
    );
    const createWorkflowVersionStep = createCreateWorkflowVersionStepTool(
      this.deps,
      context,
    );
    const updateWorkflowVersionStep = createUpdateWorkflowVersionStepTool(
      this.deps,
      context,
    );
    const deleteWorkflowVersionStep = createDeleteWorkflowVersionStepTool(
      this.deps,
      context,
    );
    const createWorkflowVersionEdge = createCreateWorkflowVersionEdgeTool(
      this.deps,
      context,
    );
    const deleteWorkflowVersionEdge = createDeleteWorkflowVersionEdgeTool(
      this.deps,
      context,
    );
    const createDraftFromWorkflowVersion =
      createCreateDraftFromWorkflowVersionTool(this.deps, context);
    const updateWorkflowVersionPositions =
      createUpdateWorkflowVersionPositionsTool(this.deps, context);
    const activateWorkflowVersion = createActivateWorkflowVersionTool(
      this.deps,
    );
    const deactivateWorkflowVersion = createDeactivateWorkflowVersionTool(
      this.deps,
    );
    const computeStepOutputSchema = createComputeStepOutputSchemaTool(
      this.deps,
      context,
    );

    return {
      [createCompleteWorkflow.name]: createCompleteWorkflow,
      [createWorkflowVersionStep.name]: createWorkflowVersionStep,
      [updateWorkflowVersionStep.name]: updateWorkflowVersionStep,
      [deleteWorkflowVersionStep.name]: deleteWorkflowVersionStep,
      [createWorkflowVersionEdge.name]: createWorkflowVersionEdge,
      [deleteWorkflowVersionEdge.name]: deleteWorkflowVersionEdge,
      [createDraftFromWorkflowVersion.name]: createDraftFromWorkflowVersion,
      [updateWorkflowVersionPositions.name]: updateWorkflowVersionPositions,
      [activateWorkflowVersion.name]: activateWorkflowVersion,
      [deactivateWorkflowVersion.name]: deactivateWorkflowVersion,
      [computeStepOutputSchema.name]: computeStepOutputSchema,
    };
  }

  // Generates dynamic step configurator tools for each workspace object
  // These tools accept the same input schemas as AI chat tools (create_company, find_person, etc.)
  // and transform them into workflow step configurations
  async generateRecordStepConfiguratorTools(
    workspaceId: string,
    rolePermissionConfig: RolePermissionConfig,
    toolHints?: ToolHints,
  ): Promise<ToolSet> {
    const tools: ToolSet = {};

    const { rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'rolesPermissions',
      ]);

    let objectPermissions;

    if ('unionOf' in rolePermissionConfig) {
      if (rolePermissionConfig.unionOf.length === 1) {
        objectPermissions = rolesPermissions[rolePermissionConfig.unionOf[0]];
      } else {
        // TODO: Implement union logic for multiple roles
        throw new Error(
          'Union permission logic for multiple roles not yet implemented',
        );
      }
    } else if ('intersectionOf' in rolePermissionConfig) {
      const allRolePermissions = rolePermissionConfig.intersectionOf.map(
        (roleId: string) => rolesPermissions[roleId],
      );

      objectPermissions =
        allRolePermissions.length === 1
          ? allRolePermissions[0]
          : computePermissionIntersection(allRolePermissions);
    } else {
      return tools;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const allFlatObjects = Object.values(flatObjectMetadataMaps.byId)
      .filter(isDefined)
      .filter((obj) => obj.isActive && !obj.isSystem);

    const allObjectMetadata: ObjectMetadataForToolSchema[] = allFlatObjects.map(
      (flatObject) => ({
        ...flatObject,
        fields: getFlatFieldsFromFlatObjectMetadata(
          flatObject,
          flatFieldMetadataMaps,
        ),
      }),
    );

    // Filter out workflow-related objects
    let filteredObjectMetadata = allObjectMetadata.filter(
      (objectMetadata) => !isWorkflowRelatedObject(objectMetadata),
    );

    // Apply toolHints filtering if provided
    if (toolHints?.relevantObjects && toolHints.relevantObjects.length > 0) {
      const relevantSet = new Set(toolHints.relevantObjects);
      const originalCount = filteredObjectMetadata.length;

      filteredObjectMetadata = filteredObjectMetadata.filter(
        (obj) =>
          relevantSet.has(obj.nameSingular) || relevantSet.has(obj.namePlural),
      );

      this.logger.log(
        `Workflow step tools filtering: reduced from ${originalCount} to ${filteredObjectMetadata.length} objects based on hints: ${toolHints.relevantObjects.join(', ')}`,
      );
    }

    const operationsSet = toolHints?.operations
      ? new Set(toolHints.operations)
      : null;

    const shouldIncludeOperation = (operation: ToolOperation) =>
      !operationsSet || operationsSet.has(operation);

    const shouldIncludeCreate = shouldIncludeOperation('create');
    const shouldIncludeUpdate = shouldIncludeOperation('update');
    const shouldIncludeFind = shouldIncludeOperation('find');
    const shouldIncludeDelete = shouldIncludeOperation('delete');

    const context = { workspaceId };

    filteredObjectMetadata.forEach((objectMetadata) => {
      const objectPermission = objectPermissions[objectMetadata.id];

      if (!objectPermission) {
        return;
      }

      const restrictedFields = objectPermission.restrictedFields;

      // Generate create record step tool
      if (shouldIncludeCreate && objectPermission.canUpdateObjectRecords) {
        const createStepTool = createCreateRecordStepConfiguratorTool(
          this.deps,
          context,
          objectMetadata,
          restrictedFields,
        );

        tools[createStepTool.name] = createStepTool;
      }

      // Generate update record step tool
      if (shouldIncludeUpdate && objectPermission.canUpdateObjectRecords) {
        const updateStepTool = createUpdateRecordStepConfiguratorTool(
          this.deps,
          context,
          objectMetadata,
          restrictedFields,
        );

        tools[updateStepTool.name] = updateStepTool;
      }

      // Generate find records step tool
      if (shouldIncludeFind && objectPermission.canReadObjectRecords) {
        const findStepTool = createFindRecordsStepConfiguratorTool(
          this.deps,
          context,
          objectMetadata,
          restrictedFields,
        );

        tools[findStepTool.name] = findStepTool;
      }

      // Generate delete record step tool
      if (shouldIncludeDelete && objectPermission.canSoftDeleteObjectRecords) {
        const deleteStepTool = createDeleteRecordStepConfiguratorTool(
          this.deps,
          context,
          objectMetadata,
        );

        tools[deleteStepTool.name] = deleteStepTool;
      }
    });

    this.logger.log(
      `Generated ${Object.keys(tools).length} record step configurator tools`,
    );

    return tools;
  }
}
