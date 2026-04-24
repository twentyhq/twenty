import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { z } from 'zod';

import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { ViewSortDirection } from 'twenty-shared/types';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const VIEW_SORT_DIRECTION_OPTIONS = Object.values(ViewSortDirection);

const GetViewSortsInputSchema = z.object({
  viewId: z
    .string()
    .uuid()
    .describe('ID of the view to list sorts for. Obtain this from get_views.'),
});

const CreateViewSortInputSchema = z.object({
  viewId: z.string().uuid().describe('ID of the view to add the sort to'),
  fieldMetadataId: z
    .string()
    .uuid()
    .describe(
      'ID of the field to sort by. Use list_object_metadata_items to find field IDs.',
    ),
  direction: z
    .enum(VIEW_SORT_DIRECTION_OPTIONS)
    .default(ViewSortDirection.ASC)
    .describe('Sort direction: ASC (ascending) or DESC (descending)'),
});

const CreateManyViewSortsInputSchema = z.object({
  sorts: z
    .array(CreateViewSortInputSchema)
    .min(1)
    .max(10)
    .describe('Array of sorts to create (1-10 items)'),
});

const UpdateViewSortInputSchema = z.object({
  id: z.string().uuid().describe('ID of the view sort to update'),
  direction: z
    .enum(VIEW_SORT_DIRECTION_OPTIONS)
    .optional()
    .describe('New sort direction: ASC or DESC'),
});

const DeleteViewSortInputSchema = z.object({
  id: z.string().uuid().describe('ID of the view sort to delete'),
});

@Injectable()
export class ViewSortToolsFactory {
  constructor(private readonly viewSortService: ViewSortService) {}

  generateReadTools(workspaceId: string): ToolSet {
    return {
      get_view_sorts: {
        description:
          'List all sorts applied to a view. Each sort defines a field and direction that determines the order records appear in the view.',
        inputSchema: GetViewSortsInputSchema,
        execute: async (parameters: { viewId: string }) => {
          const sorts = await this.viewSortService.findByViewId(
            workspaceId,
            parameters.viewId,
          );

          return sorts.map((sort) => ({
            id: sort.id,
            viewId: sort.viewId,
            fieldMetadataId: sort.fieldMetadataId,
            direction: sort.direction,
          }));
        },
      },
    };
  }

  generateWriteTools(workspaceId: string): ToolSet {
    return {
      create_view_sort: {
        description:
          'Add a sort to a view. Use list_object_metadata_items to get fieldMetadataId values.',
        inputSchema: CreateViewSortInputSchema,
        execute: async (parameters: {
          viewId: string;
          fieldMetadataId: string;
          direction: ViewSortDirection;
        }) => {
          try {
            const sort = await this.viewSortService.createOne({
              createViewSortInput: {
                viewId: parameters.viewId,
                fieldMetadataId: parameters.fieldMetadataId,
                direction: parameters.direction,
              },
              workspaceId,
            });

            return {
              id: sort.id,
              viewId: sort.viewId,
              fieldMetadataId: sort.fieldMetadataId,
              direction: sort.direction,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }

            throw error;
          }
        },
      },
      create_many_view_sorts: {
        description:
          'Add multiple sorts to a view in one call. Use list_object_metadata_items to get fieldMetadataId values.',
        inputSchema: CreateManyViewSortsInputSchema,
        execute: async (parameters: {
          sorts: Array<{
            viewId: string;
            fieldMetadataId: string;
            direction: ViewSortDirection;
          }>;
        }) => {
          const results = [];

          for (const sortInput of parameters.sorts) {
            try {
              const sort = await this.viewSortService.createOne({
                createViewSortInput: {
                  viewId: sortInput.viewId,
                  fieldMetadataId: sortInput.fieldMetadataId,
                  direction: sortInput.direction,
                },
                workspaceId,
              });

              results.push({
                id: sort.id,
                viewId: sort.viewId,
                fieldMetadataId: sort.fieldMetadataId,
                direction: sort.direction,
              });
            } catch (error) {
              if (error instanceof WorkspaceMigrationBuilderException) {
                throw new Error(formatValidationErrors(error));
              }

              throw error;
            }
          }

          return { created: results };
        },
      },
      update_view_sort: {
        description:
          'Update a sort on a view. Use get_view_sorts to find the sort ID.',
        inputSchema: UpdateViewSortInputSchema,
        execute: async (parameters: {
          id: string;
          direction?: ViewSortDirection;
        }) => {
          try {
            const sort = await this.viewSortService.updateOne({
              updateViewSortInput: {
                id: parameters.id,
                update: {
                  direction: parameters.direction,
                },
              },
              workspaceId,
            });

            return {
              id: sort.id,
              viewId: sort.viewId,
              fieldMetadataId: sort.fieldMetadataId,
              direction: sort.direction,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }

            throw error;
          }
        },
      },
      delete_view_sort: {
        description:
          'Remove a sort from a view. Use get_view_sorts to find the sort ID.',
        inputSchema: DeleteViewSortInputSchema,
        execute: async (parameters: { id: string }) => {
          try {
            const sort = await this.viewSortService.deleteOne({
              deleteViewSortInput: { id: parameters.id },
              workspaceId,
            });

            return {
              id: sort.id,
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
