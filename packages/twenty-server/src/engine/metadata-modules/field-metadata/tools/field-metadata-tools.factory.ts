import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { z } from 'zod';

import { compactMetadataOutput } from 'src/engine/core-modules/tool-provider/utils/compact-metadata-output.util';
import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const EXCLUDED_FIELD_NAMES = new Set(['searchVector', 'position', 'updatedBy']);

const FIELD_STRIP_WHEN_NULLISH = [
  'options',
  'settings',
  'defaultValue',
  'description',
  'icon',
  'deletedAt',
];

const FIELD_STRIP_WHEN_FALSE = ['isLabelSyncedWithName', 'isUIReadOnly'];

const GetFieldMetadataInputSchema = z.object({
  id: z
    .string()
    .uuid()
    .optional()
    .describe('Field ID. Returns one field if set.'),
  objectMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe('Filter by object ID.'),
  includeFullSystemFields: z
    .boolean()
    .default(false)
    .describe(
      'Return full payload for system fields. Default: false — system fields are returned as compact {id, name, type}.',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(100)
    .describe('Max fields to return.'),
});

const CreateFieldMetadataInputSchema = z.object({
  objectMetadataId: z.string().uuid().describe('Target object ID'),
  type: z.nativeEnum(FieldMetadataType).describe('Field type'),
  name: z.string().describe('Field name (camelCase)'),
  label: z.string().describe('Display label'),
  description: z.string().optional().describe('Description'),
  icon: z.string().optional().describe('Icon name'),
  isNullable: z.boolean().optional().describe('Nullable'),
  isUnique: z.boolean().optional().describe('Unique constraint'),
  defaultValue: z.unknown().optional().describe('Default value'),
  options: z.unknown().optional().describe('SELECT/MULTI_SELECT options'),
  settings: z.unknown().optional().describe('Field settings'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Sync label with name'),
  isRemoteCreation: z.boolean().optional().describe('Remote field creation'),
  relationCreationPayload: z
    .unknown()
    .optional()
    .describe('Relation creation payload'),
});

const UpdateFieldMetadataInputSchema = z.object({
  id: z.string().uuid().describe('Field ID'),
  name: z.string().optional().describe('Field name'),
  label: z.string().optional().describe('Display label'),
  description: z.string().optional().describe('Description'),
  icon: z.string().optional().describe('Icon name'),
  isActive: z.boolean().optional().describe('Active state'),
  isNullable: z.boolean().optional().describe('Nullable'),
  isUnique: z.boolean().optional().describe('Unique constraint'),
  defaultValue: z.unknown().optional().describe('Default value'),
  options: z.unknown().optional().describe('SELECT/MULTI_SELECT options'),
  settings: z.unknown().optional().describe('Field settings'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Sync label with name'),
});

const DeleteFieldMetadataInputSchema = z.object({
  id: z.string().uuid().describe('Field ID'),
});

const CreateManyFieldMetadataInputSchema = z.object({
  fields: z
    .array(CreateFieldMetadataInputSchema)
    .min(1)
    .max(20)
    .describe('Fields to create (max 20).'),
});

const UpdateManyFieldMetadataInputSchema = z.object({
  fields: z
    .array(UpdateFieldMetadataInputSchema)
    .min(1)
    .max(20)
    .describe('Fields to update (max 20).'),
});

const CreateManyRelationFieldsInputSchema = z.object({
  relations: z
    .array(
      z.object({
        objectMetadataId: z.string().uuid().describe('Source object ID'),
        name: z.string().describe('Field name (camelCase)'),
        label: z.string().describe('Display label'),
        description: z.string().optional().describe('Description'),
        icon: z.string().optional().describe('Icon name'),
        type: z.nativeEnum(RelationType).describe('MANY_TO_ONE or ONE_TO_MANY'),
        targetObjectMetadataId: z.string().uuid().describe('Target object ID'),
        targetFieldLabel: z.string().describe('Inverse field label'),
        targetFieldIcon: z.string().describe('Inverse field icon'),
      }),
    )
    .min(1)
    .max(20)
    .describe('Relations to create (max 20).'),
});

@Injectable()
export class FieldMetadataToolsFactory {
  constructor(private readonly fieldMetadataService: FieldMetadataService) {}

  generateTools(workspaceId: string): ToolSet {
    return {
      get_fields_metadata: {
        description:
          'Returns an array of fields. System fields are compact {id, name, type} by default; set includeFullSystemFields=true for full payload. Internal fields (searchVector, position, updatedBy) are excluded.',
        inputSchema: GetFieldMetadataInputSchema,
        execute: async (parameters: {
          id?: string;
          objectMetadataId?: string;
          includeFullSystemFields?: boolean;
          limit?: number;
        }) => {
          const rawResults = await this.fieldMetadataService.query({
            filter: {
              workspaceId: { eq: workspaceId },
              ...(parameters.id ? { id: { eq: parameters.id } } : {}),
              ...(parameters.objectMetadataId
                ? {
                    objectMetadataId: { eq: parameters.objectMetadataId },
                  }
                : {}),
            },
            paging: { limit: parameters.limit ?? 100 },
          });

          const compactedFields = (
            rawResults as unknown as Record<string, unknown>[]
          )
            .filter((field) => !EXCLUDED_FIELD_NAMES.has(field.name as string))
            .map((field) => {
              if (field.isSystem && !parameters.includeFullSystemFields) {
                return {
                  id: field.id,
                  name: field.name,
                  type: field.type,
                };
              }

              return compactMetadataOutput(
                { ...field },
                {
                  stripWhenNullish: FIELD_STRIP_WHEN_NULLISH,
                  stripWhenFalse: FIELD_STRIP_WHEN_FALSE,
                },
              );
            });

          return compactedFields;
        },
      },
      create_field_metadata: {
        description: 'Create a new field on an object.',
        inputSchema: CreateFieldMetadataInputSchema,
        execute: async (parameters: {
          objectMetadataId: string;
          type: FieldMetadataType;
          name: string;
          label: string;
          description?: string;
          icon?: string;
          isNullable?: boolean;
          isUnique?: boolean;
          defaultValue?: unknown;
          options?: unknown;
          settings?: unknown;
          isLabelSyncedWithName?: boolean;
          isRemoteCreation?: boolean;
          relationCreationPayload?: unknown;
        }) => {
          try {
            const flatFieldMetadata =
              await this.fieldMetadataService.createOneField({
                createFieldInput: parameters as Parameters<
                  typeof this.fieldMetadataService.createOneField
                >[0]['createFieldInput'],
                workspaceId,
              });

            return {
              id: flatFieldMetadata.id,
              name: flatFieldMetadata.name,
              label: flatFieldMetadata.label,
              type: flatFieldMetadata.type,
              objectMetadataId: flatFieldMetadata.objectMetadataId,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      update_field_metadata: {
        description:
          'Update a field. Provide field ID and properties to change.',
        inputSchema: UpdateFieldMetadataInputSchema,
        execute: async (parameters: {
          id: string;
          name?: string;
          label?: string;
          description?: string;
          icon?: string;
          isActive?: boolean;
          isNullable?: boolean;
          isUnique?: boolean;
          defaultValue?: unknown;
          options?: unknown;
          settings?: unknown;
          isLabelSyncedWithName?: boolean;
        }) => {
          try {
            const { id, ...update } = parameters;

            const flatFieldMetadata =
              await this.fieldMetadataService.updateOneField({
                updateFieldInput: { id, ...update } as Parameters<
                  typeof this.fieldMetadataService.updateOneField
                >[0]['updateFieldInput'],
                workspaceId,
              });

            return {
              id: flatFieldMetadata.id,
              name: flatFieldMetadata.name,
              label: flatFieldMetadata.label,
              type: flatFieldMetadata.type,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      delete_field_metadata: {
        description: 'Delete a field by ID.',
        inputSchema: DeleteFieldMetadataInputSchema,
        execute: async (parameters: { id: string }) => {
          try {
            const flatFieldMetadata =
              await this.fieldMetadataService.deleteOneField({
                deleteOneFieldInput: { id: parameters.id },
                workspaceId,
              });

            return { id: flatFieldMetadata.id, success: true };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      create_many_field_metadata: {
        description:
          'Create multiple field metadata at once on one or more objects. More efficient than calling create_field_metadata multiple times. Each item follows the same schema as create_field_metadata.',
        inputSchema: CreateManyFieldMetadataInputSchema,
        execute: async (parameters: {
          fields: Array<{
            objectMetadataId: string;
            type: FieldMetadataType;
            name: string;
            label: string;
            description?: string;
            icon?: string;
            isNullable?: boolean;
            isUnique?: boolean;
            defaultValue?: unknown;
            options?: unknown;
            settings?: unknown;
            isLabelSyncedWithName?: boolean;
            isRemoteCreation?: boolean;
            relationCreationPayload?: unknown;
          }>;
        }) => {
          try {
            await this.fieldMetadataService.createManyFields({
              createFieldInputs: parameters.fields as Parameters<
                typeof this.fieldMetadataService.createManyFields
              >[0]['createFieldInputs'],
              workspaceId,
            });

            return true;
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      update_many_field_metadata: {
        description:
          'Update multiple field metadata at once. More efficient than calling update_field_metadata multiple times. Each item must include the field ID and the properties to update.',
        inputSchema: UpdateManyFieldMetadataInputSchema,
        execute: async (parameters: {
          fields: Array<{
            id: string;
            name?: string;
            label?: string;
            description?: string;
            icon?: string;
            isActive?: boolean;
            isNullable?: boolean;
            isUnique?: boolean;
            defaultValue?: unknown;
            options?: unknown;
            settings?: unknown;
            isLabelSyncedWithName?: boolean;
          }>;
        }) => {
          try {
            await Promise.all(
              parameters.fields.map(async ({ id, ...update }) => {
                await this.fieldMetadataService.updateOneField({
                  updateFieldInput: { id, ...update } as Parameters<
                    typeof this.fieldMetadataService.updateOneField
                  >[0]['updateFieldInput'],
                  workspaceId,
                });
              }),
            );

            return true;
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      create_many_relation_fields: {
        description: 'Create multiple relation fields between objects at once.',
        inputSchema: CreateManyRelationFieldsInputSchema,
        execute: async (parameters: {
          relations: Array<{
            objectMetadataId: string;
            name: string;
            label: string;
            description?: string;
            icon?: string;
            type: RelationType;
            targetObjectMetadataId: string;
            targetFieldLabel: string;
            targetFieldIcon: string;
          }>;
        }) => {
          try {
            await this.fieldMetadataService.createManyFields({
              createFieldInputs: parameters.relations.map((relation) => ({
                objectMetadataId: relation.objectMetadataId,
                type: FieldMetadataType.RELATION,
                name: relation.name,
                label: relation.label,
                description: relation.description,
                icon: relation.icon,
                relationCreationPayload: {
                  type: relation.type,
                  targetObjectMetadataId: relation.targetObjectMetadataId,
                  targetFieldLabel: relation.targetFieldLabel,
                  targetFieldIcon: relation.targetFieldIcon,
                },
              })) as Parameters<
                typeof this.fieldMetadataService.createManyFields
              >[0]['createFieldInputs'],
              workspaceId,
            });

            return true;
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
