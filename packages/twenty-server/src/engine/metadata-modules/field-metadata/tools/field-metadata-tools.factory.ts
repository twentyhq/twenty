import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { FieldMetadataType } from 'twenty-shared/types';
import { z } from 'zod';

import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';

const GetFieldMetadataInputSchema = z.object({
  id: z
    .string()
    .uuid()
    .optional()
    .describe(
      'Unique identifier for the field metadata. If provided, returns a single field.',
    ),
  objectMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe('Filter fields by object metadata ID.'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(100)
    .describe('Maximum number of fields to return.'),
});

const CreateFieldMetadataInputSchema = z.object({
  objectMetadataId: z
    .string()
    .uuid()
    .describe('ID of the object to add the field to'),
  type: z
    .nativeEnum(FieldMetadataType)
    .describe(
      'Field type (e.g., TEXT, NUMBER, BOOLEAN, DATE_TIME, RELATION, etc.)',
    ),
  name: z.string().describe('Internal name of the field (camelCase)'),
  label: z.string().describe('Display label of the field'),
  description: z.string().optional().describe('Description of the field'),
  icon: z.string().optional().describe('Icon identifier for the field'),
  isNullable: z.boolean().optional().describe('Whether the field can be null'),
  isUnique: z
    .boolean()
    .optional()
    .describe('Whether the field value must be unique'),
  defaultValue: z.unknown().optional().describe('Default value for the field'),
  options: z
    .unknown()
    .optional()
    .describe('Options for SELECT/MULTI_SELECT fields'),
  settings: z
    .unknown()
    .optional()
    .describe('Additional settings for the field'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Whether label should sync with name changes'),
  isRemoteCreation: z
    .boolean()
    .optional()
    .describe('Whether this is a remote field creation'),
  relationCreationPayload: z
    .unknown()
    .optional()
    .describe('Payload for creating relation fields'),
});

const UpdateFieldMetadataInputSchema = z.object({
  id: z.string().uuid().describe('ID of the field to update'),
  name: z.string().optional().describe('Internal name of the field'),
  label: z.string().optional().describe('Display label of the field'),
  description: z.string().optional().describe('Description of the field'),
  icon: z.string().optional().describe('Icon identifier for the field'),
  isActive: z.boolean().optional().describe('Whether the field is active'),
  isNullable: z.boolean().optional().describe('Whether the field can be null'),
  isUnique: z
    .boolean()
    .optional()
    .describe('Whether the field value must be unique'),
  defaultValue: z.unknown().optional().describe('Default value for the field'),
  options: z
    .unknown()
    .optional()
    .describe('Options for SELECT/MULTI_SELECT fields'),
  settings: z
    .unknown()
    .optional()
    .describe('Additional settings for the field'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Whether label should sync with name changes'),
});

const DeleteFieldMetadataInputSchema = z.object({
  id: z.string().uuid().describe('ID of the field to delete'),
});

@Injectable()
export class FieldMetadataToolsFactory {
  constructor(private readonly fieldMetadataService: FieldMetadataService) {}

  generateTools(workspaceId: string): ToolSet {
    return {
      get_field_metadata: {
        description:
          'Find fields metadata. Retrieve information about the fields of objects in the workspace data model.',
        inputSchema: GetFieldMetadataInputSchema,
        execute: async (parameters: {
          id?: string;
          objectMetadataId?: string;
          limit?: number;
        }) => {
          return this.fieldMetadataService.query({
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
        },
      },
      create_field_metadata: {
        description:
          'Create a new field metadata on an object. Specify the objectMetadataId and field properties.',
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

            return fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata);
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderExceptionV2) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      update_field_metadata: {
        description:
          'Update an existing field metadata. Provide the field ID and the properties to update.',
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

            return fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata);
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderExceptionV2) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      delete_field_metadata: {
        description: 'Delete a field metadata by its ID.',
        inputSchema: DeleteFieldMetadataInputSchema,
        execute: async (parameters: { id: string }) => {
          try {
            const flatFieldMetadata =
              await this.fieldMetadataService.deleteOneField({
                deleteOneFieldInput: { id: parameters.id },
                workspaceId,
              });

            return fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata);
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderExceptionV2) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
    };
  }
}
