import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { AggregateOperations } from 'twenty-shared/types';
import { z } from 'zod';

import { getIsFlatFieldAJunctionRelationField } from 'src/engine/api/common/common-select-fields/utils/get-is-flat-field-a-junction-relation-field';
import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const GetViewFieldsInputSchema = z.object({
  viewId: z
    .string()
    .uuid()
    .describe(
      'The ID of the view to list fields for. Obtain this from get_views.',
    ),
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
  id: z
    .string()
    .uuid()
    .describe(
      'The ID of the view field to update. Obtain this from get_view_fields.',
    ),
  isVisible: z.boolean().optional().describe('Whether the field is visible.'),
  size: z.number().int().optional().describe('Column width in pixels.'),
  position: z.number().optional().describe('Position of the field.'),
  aggregateOperation: z
    .enum(Object.values(AggregateOperations) as [string, ...string[]])
    .optional()
    .describe('Aggregate operation for this field.'),
});

const DeleteViewFieldInputSchema = z.object({
  id: z
    .string()
    .uuid()
    .describe(
      'The ID of the view field to delete. Obtain this from get_view_fields.',
    ),
});

const CreateManyViewFieldsInputSchema = z.object({
  viewFields: z
    .array(CreateViewFieldInputSchema)
    .min(1)
    .max(50)
    .describe('Array of view fields to create (1-50 items).'),
});

const UpdateManyViewFieldsInputSchema = z.object({
  viewFields: z
    .array(UpdateViewFieldInputSchema)
    .min(1)
    .max(50)
    .describe('Array of view field updates to apply (1-50 items).'),
});

@Injectable()
export class ViewFieldToolsFactory {
  constructor(
    private readonly viewFieldService: ViewFieldService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  /**
   * Hides all system and junction relation fields for a given view by setting isVisible=false.
   * Returns the updated view fields.
   */
  async hideAllSystemAndJunctionFields(workspaceId: string, viewId: string) {
    // Get all view fields for the view
    const viewFields = await this.viewFieldService.findByViewId(
      workspaceId,
      viewId,
    );

    // Get field metadata for all fields in the workspace
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    // Find view fields that are system or junction relation fields
    const toHide = viewFields.filter((vf) => {
      const universalIdentifier =
        flatFieldMetadataMaps.universalIdentifierById[vf.fieldMetadataId];
      const meta = universalIdentifier
        ? flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier]
        : undefined;

      if (!meta) {
        return false;
      }

      return (
        meta.isSystem ||
        getIsFlatFieldAJunctionRelationField({ flatField: meta })
      );
    });

    // Prepare update payloads
    const updates = toHide.map((vf) => ({
      id: vf.id,
      isVisible: false,
    }));

    // Update all relevant view fields
    const results = await Promise.all(
      updates.map(async (update) => {
        const updated = await this.viewFieldService.updateOne({
          updateViewFieldInput: {
            id: update.id,
            update: { isVisible: false },
          },
          workspaceId,
        });

        return {
          id: updated.id,
          fieldMetadataId: updated.fieldMetadataId,
          viewId: updated.viewId,
          isVisible: updated.isVisible,
          size: updated.size,
          position: updated.position,
          aggregateOperation: updated.aggregateOperation,
        };
      }),
    );

    return results;
  }

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
          'List the columns (fields) displayed in a specific view. A view field controls which columns appear in a table or kanban view, their visibility, width, position, and aggregate operation. Use get_views first to find the view ID, then call this to inspect its column configuration.',

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
          'Add a new column to a view. View fields define which columns are shown in table or kanban views. First call get_field_metadata to find the fieldMetadataId of the column to add, and get_views to find the target viewId.',

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
          "Update properties of a column in a view. You can change its visibility, width (size in pixels), display position, or aggregate operation. Use get_view_fields to find the view field ID. Constraints: position must not be -1, must not precede the label identifier field, and must not conflict with another field's position.",

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
        description:
          "Remove a column from a view. This removes the field from the view's displayed columns. Use get_view_fields to find the view field ID to delete.",

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
      create_many_view_fields: {
        description:
          'Add multiple columns to a view at once. More efficient than calling create_view_field multiple times. Each item follows the same schema as create_view_field. All view fields can target the same or different views.',
        inputSchema: CreateManyViewFieldsInputSchema,
        execute: async (parameters: {
          viewFields: Array<{
            viewId: string;
            fieldMetadataId: string;
            isVisible?: boolean;
            size?: number;
            position?: number;
            aggregateOperation?: string;
          }>;
        }) => {
          try {
            const viewFields = await this.viewFieldService.createMany({
              createViewFieldInputs: parameters.viewFields.map((vf) => ({
                viewId: vf.viewId,
                fieldMetadataId: vf.fieldMetadataId,
                isVisible: vf.isVisible ?? true,
                size: vf.size ?? 150,
                position: vf.position ?? 0,
                aggregateOperation:
                  vf.aggregateOperation as AggregateOperations,
              })),
              workspaceId,
            });

            return viewFields.map((viewField) => ({
              id: viewField.id,
              fieldMetadataId: viewField.fieldMetadataId,
              viewId: viewField.viewId,
              isVisible: viewField.isVisible,
              size: viewField.size,
              position: viewField.position,
              aggregateOperation: viewField.aggregateOperation,
            }));
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      update_many_view_fields: {
        description:
          'Update multiple columns in a view at once. More efficient than calling update_view_field multiple times. Each item must include the view field ID and properties to update. Same constraints as update_view_field apply to each item.',
        inputSchema: UpdateManyViewFieldsInputSchema,
        execute: async (parameters: {
          viewFields: Array<{
            id: string;
            isVisible?: boolean;
            size?: number;
            position?: number;
            aggregateOperation?: string;
          }>;
        }) => {
          try {
            const results = await Promise.all(
              parameters.viewFields.map(async (vf) => {
                const viewField = await this.viewFieldService.updateOne({
                  updateViewFieldInput: {
                    id: vf.id,
                    update: {
                      isVisible: vf.isVisible,
                      size: vf.size,
                      position: vf.position,
                      aggregateOperation:
                        vf.aggregateOperation as AggregateOperations,
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
              }),
            );

            return results;
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },

      hide_system_and_junction_fields: {
        description:
          'Hide all system and junction relation fields in a view by setting isVisible=false for those fields. Use get_views to find the viewId.',
        inputSchema: z.object({
          viewId: z
            .string()
            .uuid()
            .describe(
              'The ID of the view whose system and junction relation fields should be hidden.',
            ),
        }),
        execute: async (parameters: { viewId: string }) => {
          const result = await this.hideAllSystemAndJunctionFields(
            workspaceId,
            parameters.viewId,
          );

          return {
            success: Array.isArray(result) ? result.length > 0 : false,
          };
        },
      },
    };
  }
}
