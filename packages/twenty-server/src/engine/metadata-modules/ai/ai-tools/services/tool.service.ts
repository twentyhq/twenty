import { Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { generateCreateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-create-record-input-schema.util';
import { generateUpdateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-update-record-input-schema.util';
import { BulkDeleteToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/bulk-delete-tool.zod-schema';
import { FindOneToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-one-tool.zod-schema';
import { generateFindToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-tool.zod-schema';
import { SoftDeleteToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/soft-delete-tool.zod-schema';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';
import {
  ToolHints,
  ToolOperation,
} from 'src/engine/metadata-modules/ai/ai-chat-router/types/tool-hints.interface';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';

@Injectable()
export class ToolService {
  private readonly logger = new Logger(ToolService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly createRecordService: CreateRecordService,
    private readonly updateRecordService: UpdateRecordService,
    private readonly deleteRecordService: DeleteRecordService,
    private readonly findRecordsService: FindRecordsService,
  ) {}

  // Generates AI tools for database operations based on workspace objects and permissions
  // Supports filtering by object names and operation types via toolHints
  // Returns a map of tool names to tool definitions
  async listTools(
    rolePermissionConfig: RolePermissionConfig,
    workspaceId: string,
    actorContext?: ActorMetadata,
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

    const allObjectMetadata = allFlatObjects.map((flatObject) => ({
      ...flatObject,
      fields: getFlatFieldsFromFlatObjectMetadata(
        flatObject,
        flatFieldMetadataMaps,
      ),
    }));

    let filteredObjectMetadata = allObjectMetadata.filter(
      (objectMetadata) => !isWorkflowRelatedObject(objectMetadata),
    );

    if (toolHints?.relevantObjects && toolHints.relevantObjects.length > 0) {
      const relevantSet = new Set(toolHints.relevantObjects);
      const originalCount = filteredObjectMetadata.length;

      filteredObjectMetadata = filteredObjectMetadata.filter(
        (obj) =>
          relevantSet.has(obj.nameSingular) || relevantSet.has(obj.namePlural),
      );

      this.logger.log(
        `Tool filtering: reduced from ${originalCount} to ${filteredObjectMetadata.length} objects based on hints: ${toolHints.relevantObjects.join(', ')}`,
      );

      if (filteredObjectMetadata.length === 0) {
        this.logger.warn(
          `Tool filtering resulted in 0 objects. Hints may be incorrect: ${toolHints.relevantObjects.join(', ')}`,
        );
      }
    }

    const operationsSet = toolHints?.operations
      ? new Set(toolHints.operations)
      : null;

    const shouldIncludeOperation = (operation: ToolOperation) =>
      !operationsSet || operationsSet.has(operation);

    const shouldIncludeFind = shouldIncludeOperation('find');
    const shouldIncludeCreate = shouldIncludeOperation('create');
    const shouldIncludeUpdate = shouldIncludeOperation('update');
    const shouldIncludeDelete = shouldIncludeOperation('delete');

    filteredObjectMetadata.forEach((objectMetadata) => {
      const objectPermission = objectPermissions[objectMetadata.id];

      if (!objectPermission) {
        return;
      }

      const restrictedFields = objectPermission.restrictedFields;

      if (shouldIncludeFind && objectPermission.canReadObjectRecords) {
        tools[`find_${objectMetadata.nameSingular}`] = {
          description: `Search for ${objectMetadata.labelSingular} records using flexible filtering criteria. Supports exact matches, pattern matching, ranges, and null checks. Use limit/offset for pagination and orderBy for sorting. To find by ID, use filter: { id: { eq: "record-id" } }. Returns an array of matching records with their full data.`,
          inputSchema: generateFindToolInputSchema(
            objectMetadata,
            restrictedFields,
          ),
          execute: async (parameters) => {
            const { limit, offset, orderBy, ...filter } = parameters.input;

            return this.findRecordsService.execute({
              objectName: objectMetadata.nameSingular,
              filter,
              orderBy,
              limit,
              offset,
              workspaceId,
              rolePermissionConfig,
            });
          },
        };

        tools[`find_one_${objectMetadata.nameSingular}`] = {
          description: `Retrieve a single ${objectMetadata.labelSingular} record by its unique ID. Use this when you know the exact record ID and need the complete record data. Returns the full record or an error if not found.`,
          inputSchema: FindOneToolInputSchema,
          execute: async (parameters) => {
            return this.findRecordsService.execute({
              objectName: objectMetadata.nameSingular,
              filter: { id: { eq: parameters.input.id } },
              limit: 1,
              workspaceId,
              rolePermissionConfig,
            });
          },
        };
      }

      if (objectPermission.canUpdateObjectRecords) {
        if (shouldIncludeCreate) {
          tools[`create_${objectMetadata.nameSingular}`] = {
            description: `Create a new ${objectMetadata.labelSingular} record. Provide all required fields and any optional fields you want to set. The system will automatically handle timestamps and IDs. Returns the created record with all its data.`,
            inputSchema: generateCreateRecordInputSchema(
              objectMetadata,
              restrictedFields,
            ),
            execute: async (parameters) => {
              return this.createRecordService.execute({
                objectName: objectMetadata.nameSingular,
                objectRecord: parameters.input,
                workspaceId,
                rolePermissionConfig,
                createdBy: actorContext,
              });
            },
          };
        }

        if (shouldIncludeUpdate) {
          tools[`update_${objectMetadata.nameSingular}`] = {
            description: `Update an existing ${objectMetadata.labelSingular} record. Provide the record ID and only the fields you want to change. Unspecified fields will remain unchanged. Returns the updated record with all current data.`,
            inputSchema: generateUpdateRecordInputSchema(
              objectMetadata,
              restrictedFields,
            ),
            execute: async (parameters) => {
              const { id, ...allFields } = parameters.input;

              const objectRecord = Object.fromEntries(
                Object.entries(allFields).filter(
                  ([, value]) => value !== undefined,
                ),
              );

              return this.updateRecordService.execute({
                objectName: objectMetadata.nameSingular,
                objectRecordId: id,
                objectRecord,
                workspaceId,
                rolePermissionConfig,
              });
            },
          };
        }
      }

      if (shouldIncludeDelete && objectPermission.canSoftDeleteObjectRecords) {
        tools[`soft_delete_${objectMetadata.nameSingular}`] = {
          description: `Soft delete a ${objectMetadata.labelSingular} record by marking it as deleted. The record remains in the database but is hidden from normal queries. This is reversible and preserves all data. Use this for temporary removal.`,
          inputSchema: SoftDeleteToolInputSchema,
          execute: async (parameters) => {
            return this.deleteRecordService.execute({
              objectName: objectMetadata.nameSingular,
              objectRecordId: parameters.input.id,
              workspaceId,
              rolePermissionConfig,
              soft: true,
            });
          },
        };

        tools[`soft_delete_many_${objectMetadata.nameSingular}`] = {
          description: `Soft delete multiple ${objectMetadata.labelSingular} records at once by providing an array of record IDs. All records are marked as deleted but remain in the database. This is efficient for bulk operations and preserves all data.`,
          inputSchema: BulkDeleteToolInputSchema,
          execute: async (parameters) => {
            return this.softDeleteManyRecords(
              objectMetadata.nameSingular,
              parameters.input,
              workspaceId,
              rolePermissionConfig,
            );
          },
        };
      }
    });

    if (operationsSet) {
      this.logger.log(
        `Tool filtering: included operations [${Array.from(operationsSet).join(', ')}]`,
      );
    }

    return tools;
  }

  private async softDeleteManyRecords(
    objectName: string,
    parameters: Record<string, unknown>,
    workspaceId: string,
    rolePermissionConfig: RolePermissionConfig,
  ) {
    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          rolePermissionConfig,
        );

      const { filter } = parameters;

      if (!filter || typeof filter !== 'object' || !('id' in filter)) {
        return {
          success: false,
          message: `Failed to soft delete many ${objectName}: Filter with record IDs is required`,
          error: 'Filter with record IDs is required for bulk soft delete',
        };
      }

      const idFilter = filter.id as Record<string, unknown>;
      const recordIds = idFilter.in;

      if (!Array.isArray(recordIds) || recordIds.length === 0) {
        return {
          success: false,
          message: `Failed to soft delete many ${objectName}: At least one record ID is required`,
          error: 'At least one record ID is required for bulk soft delete',
        };
      }

      const existingRecords = await repository.find({
        where: { id: { in: recordIds } },
      });

      if (existingRecords.length === 0) {
        return {
          success: false,
          message: `Failed to soft delete many ${objectName}: No records found with the provided IDs`,
          error: 'No records found to soft delete',
        };
      }

      await repository.softDelete({ id: { in: recordIds } });

      return {
        success: true,
        message: `Successfully soft deleted ${existingRecords.length} ${objectName} records`,
        result: {
          count: existingRecords.length,
          deletedIds: recordIds,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to soft delete many ${objectName}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
