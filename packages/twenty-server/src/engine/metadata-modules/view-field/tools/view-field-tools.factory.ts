import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { AggregateOperations } from 'twenty-shared/types';
import { z } from 'zod';

import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const GetViewFieldsInputSchema = z.object({
  viewId: z.string().uuid().describe('The ID of the view to list fields for.'),
});

const CreateViewFieldInputSchema = z.object({
  viewId: z.string().uuid().describe('The ID of the view to add the field to.'),
  fieldMetadataId: z
    .string()
    .uuid()
    .describe(
      'The ID of the field metadata to add. Use get_field_metadata to find available fields.',
    ),
  isVisible: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether the field is visible in the view.'),
  size: z
    .number()
    .int()
    .optional()
    .default(150)
    .describe('Column width in pixels.'),
  position: z
    .number()
    .optional()
    .default(0)
    .describe('Position of the field in the view (0-based).'),
  aggregateOperation: z
    .enum(Object.values(AggregateOperations) as [string, ...string[]])
    .optional()
    .describe(
      'Aggregate operation for this field (e.g., "SUM", "AVG", "COUNT").',
    ),
});

const UpdateViewFieldInputSchema = z.object({
  id: z.string().uuid().describe('The ID of the view field to update.'),
  isVisible: z.boolean().optional().describe('Whether the field is visible.'),
  size: z.number().int().optional().describe('Column width in pixels.'),
  position: z.number().optional().describe('Position of the field.'),
  aggregateOperation: z
    .enum(Object.values(AggregateOperations) as [string, ...string[]])
    .optional()
    .describe('Aggregate operation for this field.'),
});

const DeleteViewFieldInputSchema = z.object({
  id: z.string().uuid().describe('The ID of the view field to delete.'),
});

@Injectable()
export class ViewFieldToolsFactory {
  constructor(
    private readonly viewFieldService: ViewFieldService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private async resolveFieldName(
    workspaceId: string,
    fieldMetadataId: string,
  ): Promise<string | undefined> {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const universalIdentifier =
      flatFieldMetadataMaps.universalIdentifierById[fieldMetadataId];

    if (!universalIdentifier) {
      return undefined;
    }

    return flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier]
      ?.name;
  }

  generateReadTools(workspaceId: string): ToolSet {
    return {
      get_view_fields: {
        description:
          'List fields configured for a specific view. Returns field visibility, size, position, and aggregate settings.',
        inputSchema: GetViewFieldsInputSchema,
        execute: async (parameters: { viewId: string }) => {
          const viewFields = await this.viewFieldService.findByViewId(
            workspaceId,
            parameters.viewId,
          );

          const viewFieldsWithNames = await Promise.all(
            viewFields.map(async (viewField) => {
              const fieldName = await this.resolveFieldName(
                workspaceId,
                viewField.fieldMetadataId,
              );

              return {
                id: viewField.id,
                fieldMetadataId: viewField.fieldMetadataId,
                fieldName: fieldName ?? null,
                viewId: viewField.viewId,
                isVisible: viewField.isVisible,
                size: viewField.size,
                position: viewField.position,
                aggregateOperation: viewField.aggregateOperation,
              };
            }),
          );

          return viewFieldsWithNames;
        },
      },
    };
  }

  generateWriteTools(workspaceId: string): ToolSet {
    return {
      create_view_field: {
        description:
          'Add a field to a view. Use get_field_metadata to find available field metadata IDs.',
        inputSchema: CreateViewFieldInputSchema,
        execute: async (parameters: {
          viewId: string;
          fieldMetadataId: string;
          isVisible?: boolean;
          size?: number;
          position?: number;
          aggregateOperation?: string;
        }) => {
          try {
            const viewField = await this.viewFieldService.createOne({
              createViewFieldInput: {
                viewId: parameters.viewId,
                fieldMetadataId: parameters.fieldMetadataId,
                isVisible: parameters.isVisible ?? true,
                size: parameters.size ?? 150,
                position: parameters.position ?? 0,
                aggregateOperation:
                  parameters.aggregateOperation as AggregateOperations,
              },
              workspaceId,
            });

            return {
              id: viewField.id,
              fieldMetadataId: viewField.fieldMetadataId,
              viewId: viewField.viewId,
              isVisible: viewField.isVisible,
              size: viewField.size,
              position: viewField.position,
              aggregateOperation: viewField.aggregateOperation,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      update_view_field: {
        description:
          'Update a view field. You can change visibility, size, position, and aggregate operation. Be careful to not change the position to -1, never do that, and not before the position of the label identifier or to an existing position of another field.',
        inputSchema: UpdateViewFieldInputSchema,
        execute: async (parameters: {
          id: string;
          isVisible?: boolean;
          size?: number;
          position?: number;
          aggregateOperation?: string;
        }) => {
          try {
            const viewField = await this.viewFieldService.updateOne({
              updateViewFieldInput: {
                id: parameters.id,
                update: {
                  isVisible: parameters.isVisible,
                  size: parameters.size,
                  position: parameters.position,
                  aggregateOperation:
                    parameters.aggregateOperation as AggregateOperations,
                },
              },
              workspaceId,
            });

            return {
              id: viewField.id,
              fieldMetadataId: viewField.fieldMetadataId,
              viewId: viewField.viewId,
              isVisible: viewField.isVisible,
              size: viewField.size,
              position: viewField.position,
              aggregateOperation: viewField.aggregateOperation,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      delete_view_field: {
        description: 'Remove a field from a view by its view field ID.',
        inputSchema: DeleteViewFieldInputSchema,
        execute: async (parameters: { id: string }) => {
          try {
            const viewField = await this.viewFieldService.deleteOne({
              deleteViewFieldInput: { id: parameters.id },
              workspaceId,
            });

            return {
              id: viewField.id,
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
