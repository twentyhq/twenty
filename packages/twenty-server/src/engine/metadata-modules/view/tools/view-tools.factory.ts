import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { z } from 'zod';
import {
  AggregateOperations,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const GetViewsInputSchema = z.object({
  objectNameSingular: z
    .string()
    .optional()
    .describe(
      'Filter views by object name (e.g., "task", "person", "company"). If omitted, returns all views.',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum views to return.'),
});

const GetViewQueryParamsInputSchema = z.object({
  viewId: z
    .string()
    .uuid()
    .describe('ID of the view to get query parameters for.'),
});

const CreateViewInputSchema = z.object({
  name: z.string().describe('View name'),
  objectNameSingular: z
    .string()
    .describe(
      'Object name this view is for (e.g., "task", "person", "company")',
    ),
  icon: z
    .string()
    .optional()
    .default('IconList')
    .describe('Icon identifier (e.g., "IconList", "IconCheckbox")'),
  type: z
    .enum([ViewType.TABLE, ViewType.KANBAN, ViewType.CALENDAR])
    .optional()
    .default(ViewType.TABLE)
    .describe('View type'),
  visibility: z
    .enum([ViewVisibility.WORKSPACE, ViewVisibility.UNLISTED])
    .optional()
    .default(ViewVisibility.WORKSPACE)
    .describe('View visibility'),
  mainGroupByFieldName: z
    .string()
    .optional()
    .describe(
      'Field name to group by (required for KANBAN views, must be a SELECT field, e.g., "stage", "status")',
    ),
  kanbanAggregateOperation: z
    .enum(Object.values(AggregateOperations) as [string, ...string[]])
    .optional()
    .describe(
      'Aggregate operation for kanban columns (e.g., "SUM", "AVG", "COUNT")',
    ),
  kanbanAggregateOperationFieldName: z
    .string()
    .optional()
    .describe('Field name for the kanban aggregate operation (e.g., "amount")'),
});

const UpdateViewInputSchema = z.object({
  id: z.string().uuid().describe('View ID to update'),
  name: z.string().optional().describe('New view name'),
  icon: z.string().optional().describe('New icon identifier'),
});

const DeleteViewInputSchema = z.object({
  id: z.string().uuid().describe('View ID to delete'),
});

@Injectable()
export class ViewToolsFactory {
  constructor(
    private readonly viewService: ViewService,
    private readonly viewQueryParamsService: ViewQueryParamsService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private async resolveObjectMetadataId(
    workspaceId: string,
    objectNameSingular: string,
  ): Promise<string> {
    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    const objectMetadataId = idByNameSingular[objectNameSingular];

    if (!objectMetadataId) {
      throw new Error(
        `Object "${objectNameSingular}" not found. Use get_object_metadata to list available objects.`,
      );
    }

    return objectMetadataId;
  }

  private async resolveFieldMetadataId(
    workspaceId: string,
    objectMetadataId: string,
    fieldName: string,
  ): Promise<string> {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const fieldMetadata = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).find(
      (field) =>
        field?.name === fieldName &&
        field?.objectMetadataId === objectMetadataId,
    );

    if (!fieldMetadata) {
      throw new Error(
        `Field "${fieldName}" not found on this object. Use get_field_metadata to list available fields.`,
      );
    }

    return fieldMetadata.id;
  }

  generateReadTools(
    workspaceId: string,
    userWorkspaceId?: string,
    currentWorkspaceMemberId?: string,
  ): ToolSet {
    return {
      get_views: {
        description:
          'List views in the workspace. Views define how records are displayed, filtered, and sorted.',
        inputSchema: GetViewsInputSchema,
        execute: async (parameters: {
          objectNameSingular?: string;
          limit?: number;
        }) => {
          let views;

          if (parameters.objectNameSingular) {
            const objectMetadataId = await this.resolveObjectMetadataId(
              workspaceId,
              parameters.objectNameSingular,
            );

            views = await this.viewService.findByObjectMetadataId(
              workspaceId,
              objectMetadataId,
              userWorkspaceId,
            );
          } else {
            views = await this.viewService.findByWorkspaceId(
              workspaceId,
              userWorkspaceId,
            );
          }

          const limitedViews = views.slice(0, parameters.limit ?? 50);

          return limitedViews.map((view) => ({
            id: view.id,
            name: view.name,
            objectMetadataId: view.objectMetadataId,
            type: view.type,
            icon: view.icon,
            visibility: view.visibility,
            position: view.position,
          }));
        },
      },
      get_view_query_parameters: {
        description:
          'Get filter and sort parameters from a view. Use these parameters with find_* tools to query records matching the view.',
        inputSchema: GetViewQueryParamsInputSchema,
        execute: async (parameters: { viewId: string }) => {
          return this.viewQueryParamsService.resolveViewToQueryParams(
            parameters.viewId,
            workspaceId,
            currentWorkspaceMemberId,
          );
        },
      },
    };
  }

  generateWriteTools(workspaceId: string, userWorkspaceId?: string): ToolSet {
    return {
      create_view: {
        description:
          'Create a new view for an object. Views define how records are displayed. For KANBAN views, mainGroupByFieldName is required and must be a SELECT field (e.g., "stage", "status").',
        inputSchema: CreateViewInputSchema,
        execute: async (parameters: {
          name: string;
          objectNameSingular: string;
          icon?: string;
          type?: ViewType;
          visibility?: ViewVisibility;
          mainGroupByFieldName?: string;
          kanbanAggregateOperation?: string;
          kanbanAggregateOperationFieldName?: string;
        }) => {
          try {
            const objectMetadataId = await this.resolveObjectMetadataId(
              workspaceId,
              parameters.objectNameSingular,
            );

            let mainGroupByFieldMetadataId: string | undefined;
            let kanbanAggregateOperationFieldMetadataId: string | undefined;

            if (parameters.mainGroupByFieldName) {
              mainGroupByFieldMetadataId = await this.resolveFieldMetadataId(
                workspaceId,
                objectMetadataId,
                parameters.mainGroupByFieldName,
              );
            }

            if (parameters.kanbanAggregateOperationFieldName) {
              kanbanAggregateOperationFieldMetadataId =
                await this.resolveFieldMetadataId(
                  workspaceId,
                  objectMetadataId,
                  parameters.kanbanAggregateOperationFieldName,
                );
            }

            const view = await this.viewService.createOne({
              createViewInput: {
                name: parameters.name,
                objectMetadataId,
                icon: parameters.icon ?? 'IconList',
                type: parameters.type ?? ViewType.TABLE,
                visibility: parameters.visibility ?? ViewVisibility.WORKSPACE,
                mainGroupByFieldMetadataId,
                kanbanAggregateOperation:
                  parameters.kanbanAggregateOperation as AggregateOperations,
                kanbanAggregateOperationFieldMetadataId,
              },
              workspaceId,
              createdByUserWorkspaceId: userWorkspaceId,
            });

            return {
              id: view.id,
              name: view.name,
              objectNameSingular: parameters.objectNameSingular,
              type: view.type,
              icon: view.icon,
              visibility: view.visibility,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      update_view: {
        description:
          'Update an existing view. You can change the name and icon.',
        inputSchema: UpdateViewInputSchema,
        execute: async (parameters: {
          id: string;
          name?: string;
          icon?: string;
        }) => {
          try {
            const existingView = await this.viewService.findById(
              parameters.id,
              workspaceId,
            );

            if (!existingView) {
              throw new Error(`View with id ${parameters.id} not found`);
            }

            if (
              existingView.visibility === ViewVisibility.UNLISTED &&
              existingView.createdByUserWorkspaceId !== userWorkspaceId
            ) {
              throw new Error('You can only update your own unlisted views');
            }

            const view = await this.viewService.updateOne({
              updateViewInput: {
                id: parameters.id,
                name: parameters.name,
                icon: parameters.icon,
              },
              workspaceId,
              userWorkspaceId,
            });

            return {
              id: view.id,
              name: view.name,
              objectMetadataId: view.objectMetadataId,
              type: view.type,
              icon: view.icon,
              visibility: view.visibility,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      delete_view: {
        description: 'Delete a view by its ID.',
        inputSchema: DeleteViewInputSchema,
        execute: async (parameters: { id: string }) => {
          try {
            const existingView = await this.viewService.findById(
              parameters.id,
              workspaceId,
            );

            if (!existingView) {
              throw new Error(`View with id ${parameters.id} not found`);
            }

            if (
              existingView.visibility === ViewVisibility.UNLISTED &&
              existingView.createdByUserWorkspaceId !== userWorkspaceId
            ) {
              throw new Error('You can only delete your own unlisted views');
            }

            const view = await this.viewService.deleteOne({
              deleteViewInput: { id: parameters.id },
              workspaceId,
            });

            return {
              id: view.id,
              name: view.name,
              deleted: true,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
    };
  }
}
