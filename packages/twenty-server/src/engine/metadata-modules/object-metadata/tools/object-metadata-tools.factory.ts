import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { z } from 'zod';

import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';

const GetObjectMetadataInputSchema = z.object({
  id: z
    .string()
    .uuid()
    .optional()
    .describe(
      'Unique identifier for the object metadata. If provided, returns a single object.',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(100)
    .describe('Maximum number of objects to return.'),
});

const CreateObjectMetadataInputSchema = z.object({
  nameSingular: z
    .string()
    .describe('Singular name for the object (e.g., "company")'),
  namePlural: z
    .string()
    .describe('Plural name for the object (e.g., "companies")'),
  labelSingular: z
    .string()
    .describe('Display label in singular form (e.g., "Company")'),
  labelPlural: z
    .string()
    .describe('Display label in plural form (e.g., "Companies")'),
  description: z.string().optional().describe('Description of the object'),
  icon: z.string().optional().describe('Icon identifier for the object'),
  shortcut: z.string().optional().describe('Keyboard shortcut for the object'),
  isRemote: z.boolean().optional().describe('Whether this is a remote object'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Whether label should sync with name changes'),
});

const UpdateObjectMetadataInputSchema = z.object({
  id: z.string().uuid().describe('ID of the object to update'),
  labelSingular: z
    .string()
    .optional()
    .describe('Display label in singular form'),
  labelPlural: z.string().optional().describe('Display label in plural form'),
  nameSingular: z.string().optional().describe('Singular name for the object'),
  namePlural: z.string().optional().describe('Plural name for the object'),
  description: z.string().optional().describe('Description of the object'),
  icon: z.string().optional().describe('Icon identifier for the object'),
  shortcut: z.string().optional().describe('Keyboard shortcut for the object'),
  isActive: z.boolean().optional().describe('Whether the object is active'),
  labelIdentifierFieldMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe('ID of the field used as label identifier'),
  imageIdentifierFieldMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe('ID of the field used as image identifier'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Whether label should sync with name changes'),
});

const DeleteObjectMetadataInputSchema = z.object({
  id: z.string().uuid().describe('ID of the object to delete'),
});

@Injectable()
export class ObjectMetadataToolsFactory {
  constructor(private readonly objectMetadataService: ObjectMetadataService) {}

  generateTools(workspaceId: string): ToolSet {
    return {
      get_object_metadata: {
        description:
          'Find objects metadata. Retrieve information about the data model objects in the workspace.',
        inputSchema: GetObjectMetadataInputSchema,
        execute: async (parameters: { id?: string; limit?: number }) => {
          const flatObjectMetadatas =
            await this.objectMetadataService.findManyWithinWorkspace(
              workspaceId,
              {
                ...(parameters.id ? { where: { id: parameters.id } } : {}),
                take: parameters.limit ?? 100,
              },
            );

          return flatObjectMetadatas.map((flatObjectMetadata) =>
            fromFlatObjectMetadataToObjectMetadataDto(flatObjectMetadata),
          );
        },
      },
      create_object_metadata: {
        description:
          'Create a new object metadata in the workspace data model.',
        inputSchema: CreateObjectMetadataInputSchema,
        execute: async (parameters: {
          nameSingular: string;
          namePlural: string;
          labelSingular: string;
          labelPlural: string;
          description?: string;
          icon?: string;
          shortcut?: string;
          isRemote?: boolean;
          isLabelSyncedWithName?: boolean;
        }) => {
          try {
            const flatObjectMetadata =
              await this.objectMetadataService.createOneObject({
                createObjectInput: parameters as Parameters<
                  typeof this.objectMetadataService.createOneObject
                >[0]['createObjectInput'],
                workspaceId,
              });

            return fromFlatObjectMetadataToObjectMetadataDto(
              flatObjectMetadata,
            );
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderExceptionV2) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      update_object_metadata: {
        description:
          'Update an existing object metadata. Provide the object ID and the fields to update.',
        inputSchema: UpdateObjectMetadataInputSchema,
        execute: async (parameters: {
          id: string;
          labelSingular?: string;
          labelPlural?: string;
          nameSingular?: string;
          namePlural?: string;
          description?: string;
          icon?: string;
          shortcut?: string;
          isActive?: boolean;
          labelIdentifierFieldMetadataId?: string;
          imageIdentifierFieldMetadataId?: string;
          isLabelSyncedWithName?: boolean;
        }) => {
          try {
            const { id, ...update } = parameters;

            const flatObjectMetadata =
              await this.objectMetadataService.updateOneObject({
                updateObjectInput: { id, update },
                workspaceId,
              });

            return fromFlatObjectMetadataToObjectMetadataDto(
              flatObjectMetadata,
            );
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderExceptionV2) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      delete_object_metadata: {
        description:
          'Delete an object metadata by its ID. This will also delete all associated fields.',
        inputSchema: DeleteObjectMetadataInputSchema,
        execute: async (parameters: { id: string }) => {
          try {
            const flatObjectMetadata =
              await this.objectMetadataService.deleteOneObject({
                deleteObjectInput: { id: parameters.id },
                workspaceId,
              });

            return fromFlatObjectMetadataToObjectMetadataDto(
              flatObjectMetadata,
            );
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
