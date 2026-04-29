import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { ViewFilterOperand } from 'twenty-shared/types';
import { z } from 'zod';

import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const VIEW_FILTER_OPERAND_OPTIONS = Object.values(ViewFilterOperand);

const GetViewFiltersInputSchema = z.object({
  viewId: z
    .string()
    .uuid()
    .describe(
      'ID of the view to list filters for. Obtain this from get_views.',
    ),
});

const CreateViewFilterInputSchema = z.object({
  viewId: z.string().uuid().describe('ID of the view to add the filter to'),
  fieldMetadataId: z
    .string()
    .uuid()
    .describe(
      'ID of the field to filter on. Use list_object_metadata_items to find field IDs.',
    ),
  operand: z
    .enum(VIEW_FILTER_OPERAND_OPTIONS)
    .describe(
      'Filter operator. Valid operators per field type — TEXT/EMAILS/FULL_NAME: CONTAINS, DOES_NOT_CONTAIN, IS_EMPTY, IS_NOT_EMPTY. NUMBER/NUMERIC: IS, IS_NOT, GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, IS_EMPTY, IS_NOT_EMPTY. CURRENCY: GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, IS_EMPTY, IS_NOT_EMPTY. DATE/DATE_TIME: IS, IS_RELATIVE, IS_IN_PAST, IS_IN_FUTURE, IS_TODAY, IS_BEFORE, IS_AFTER, IS_EMPTY, IS_NOT_EMPTY. SELECT: IS, IS_NOT, IS_EMPTY, IS_NOT_EMPTY. MULTI_SELECT/ARRAY: CONTAINS, DOES_NOT_CONTAIN, IS_EMPTY, IS_NOT_EMPTY. RELATION: IS, IS_NOT, IS_EMPTY, IS_NOT_EMPTY. BOOLEAN: IS.',
    ),
  value: z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.record(z.string(), z.unknown()),
    ])
    .describe(
      'Filter value. Format depends on operand and field type: string for TEXT/SELECT, number for NUMBER/CURRENCY, array of option values for MULTI_SELECT IS/IS_NOT, empty string "" for IS_EMPTY/IS_NOT_EMPTY operators.',
    ),
  subFieldName: z
    .string()
    .optional()
    .describe(
      'Required for composite fields — e.g. "amountMicros" for CURRENCY, "addressCity" for ADDRESS, "firstName" or "lastName" for FULL_NAME.',
    ),
});

const CreateManyViewFiltersInputSchema = z.object({
  filters: z
    .array(CreateViewFilterInputSchema)
    .min(1)
    .max(20)
    .describe('Array of filters to create (1-20 items)'),
});

const UpdateViewFilterInputSchema = z.object({
  id: z.string().uuid().describe('ID of the view filter to update'),
  operand: z
    .enum(VIEW_FILTER_OPERAND_OPTIONS)
    .optional()
    .describe('New filter operator'),
  value: z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.record(z.string(), z.unknown()),
    ])
    .optional()
    .describe('New filter value'),
  subFieldName: z
    .string()
    .optional()
    .describe('New sub-field name for composite fields'),
});

const DeleteViewFilterInputSchema = z.object({
  id: z.string().uuid().describe('ID of the view filter to delete'),
});

@Injectable()
export class ViewFilterToolsFactory {
  constructor(private readonly viewFilterService: ViewFilterService) {}

  generateReadTools(workspaceId: string): ToolSet {
    return {
      get_view_filters: {
        description:
          'List all filters applied to a view. Each filter defines a condition that records must match to appear in the view.',
        inputSchema: GetViewFiltersInputSchema,
        execute: async (parameters: { viewId: string }) => {
          const filters = await this.viewFilterService.findByViewId(
            workspaceId,
            parameters.viewId,
          );

          return filters.map((filter) => ({
            id: filter.id,
            viewId: filter.viewId,
            fieldMetadataId: filter.fieldMetadataId,
            operand: filter.operand,
            value: filter.value,
            subFieldName: filter.subFieldName,
            positionInViewFilterGroup: filter.positionInViewFilterGroup,
          }));
        },
      },
    };
  }

  generateWriteTools(workspaceId: string): ToolSet {
    return {
      create_view_filter: {
        description:
          'Add a filter to a view. Use list_object_metadata_items to get fieldMetadataId values.',
        inputSchema: CreateViewFilterInputSchema,
        execute: async (parameters: {
          viewId: string;
          fieldMetadataId: string;
          operand: ViewFilterOperand;
          value: unknown;
          subFieldName?: string;
        }) => {
          try {
            const filter = await this.viewFilterService.createOne({
              createViewFilterInput: {
                viewId: parameters.viewId,
                fieldMetadataId: parameters.fieldMetadataId,
                operand: parameters.operand,
                value: parameters.value as ViewFilterValue,
                subFieldName: parameters.subFieldName,
              },
              workspaceId,
            });

            return {
              id: filter.id,
              viewId: filter.viewId,
              fieldMetadataId: filter.fieldMetadataId,
              operand: filter.operand,
              value: filter.value,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }

            throw error;
          }
        },
      },
      create_many_view_filters: {
        description:
          'Add multiple filters to a view in one call. Use list_object_metadata_items to get fieldMetadataId values.',
        inputSchema: CreateManyViewFiltersInputSchema,
        execute: async (parameters: {
          filters: Array<{
            viewId: string;
            fieldMetadataId: string;
            operand: ViewFilterOperand;
            value: unknown;
            subFieldName?: string;
          }>;
        }) => {
          const results = [];

          for (const filterInput of parameters.filters) {
            try {
              const filter = await this.viewFilterService.createOne({
                createViewFilterInput: {
                  viewId: filterInput.viewId,
                  fieldMetadataId: filterInput.fieldMetadataId,
                  operand: filterInput.operand,
                  value: filterInput.value as ViewFilterValue,
                  subFieldName: filterInput.subFieldName,
                },
                workspaceId,
              });

              results.push({
                id: filter.id,
                viewId: filter.viewId,
                fieldMetadataId: filter.fieldMetadataId,
                operand: filter.operand,
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
      update_view_filter: {
        description:
          'Update a filter on a view. Use get_view_filters to find the filter ID.',
        inputSchema: UpdateViewFilterInputSchema,
        execute: async (parameters: {
          id: string;
          operand?: ViewFilterOperand;
          value?: unknown;
          subFieldName?: string;
        }) => {
          try {
            const filter = await this.viewFilterService.updateOne({
              updateViewFilterInput: {
                id: parameters.id,
                update: {
                  operand: parameters.operand,
                  value: parameters.value as ViewFilterValue,
                  subFieldName: parameters.subFieldName,
                },
              },
              workspaceId,
            });

            return {
              id: filter.id,
              viewId: filter.viewId,
              fieldMetadataId: filter.fieldMetadataId,
              operand: filter.operand,
              value: filter.value,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }

            throw error;
          }
        },
      },
      delete_view_filter: {
        description:
          'Remove a filter from a view. Use get_view_filters to find the filter ID.',
        inputSchema: DeleteViewFilterInputSchema,
        execute: async (parameters: { id: string }) => {
          try {
            const filter = await this.viewFilterService.deleteOne({
              deleteViewFilterInput: { id: parameters.id },
              workspaceId,
            });

            return {
              id: filter.id,
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
