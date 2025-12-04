import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { FieldMetadataType } from 'twenty-shared/types';
import { z } from 'zod';

import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

type MetadataToolsContext = {
  workspaceId: string;
};

const GetObjectMetadataInputSchema = z.object({
  loadingMessage: z
    .string()
    .optional()
    .describe('A clear description of the action being performed.'),
  input: z.object({
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
  }),
});

const CreateObjectMetadataInputSchema = z.object({
  loadingMessage: z
    .string()
    .optional()
    .describe('A clear description of the action being performed.'),
  input: z.object({
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
    shortcut: z
      .string()
      .optional()
      .describe('Keyboard shortcut for the object'),
    isRemote: z
      .boolean()
      .optional()
      .describe('Whether this is a remote object'),
    isLabelSyncedWithName: z
      .boolean()
      .optional()
      .describe('Whether label should sync with name changes'),
  }),
});

const UpdateObjectMetadataInputSchema = z.object({
  loadingMessage: z
    .string()
    .optional()
    .describe('A clear description of the action being performed.'),
  input: z.object({
    id: z.string().uuid().describe('ID of the object to update'),
    labelSingular: z
      .string()
      .optional()
      .describe('Display label in singular form'),
    labelPlural: z.string().optional().describe('Display label in plural form'),
    nameSingular: z
      .string()
      .optional()
      .describe('Singular name for the object'),
    namePlural: z.string().optional().describe('Plural name for the object'),
    description: z.string().optional().describe('Description of the object'),
    icon: z.string().optional().describe('Icon identifier for the object'),
    shortcut: z
      .string()
      .optional()
      .describe('Keyboard shortcut for the object'),
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
  }),
});

const DeleteObjectMetadataInputSchema = z.object({
  loadingMessage: z
    .string()
    .optional()
    .describe('A clear description of the action being performed.'),
  input: z.object({
    id: z.string().uuid().describe('ID of the object to delete'),
  }),
});

const GetFieldMetadataInputSchema = z.object({
  loadingMessage: z
    .string()
    .optional()
    .describe('A clear description of the action being performed.'),
  input: z.object({
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
  }),
});

const CreateFieldMetadataInputSchema = z.object({
  loadingMessage: z
    .string()
    .optional()
    .describe('A clear description of the action being performed.'),
  input: z.object({
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
    isNullable: z
      .boolean()
      .optional()
      .describe('Whether the field can be null'),
    isUnique: z
      .boolean()
      .optional()
      .describe('Whether the field value must be unique'),
    defaultValue: z
      .unknown()
      .optional()
      .describe('Default value for the field'),
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
  }),
});

const UpdateFieldMetadataInputSchema = z.object({
  loadingMessage: z
    .string()
    .optional()
    .describe('A clear description of the action being performed.'),
  input: z.object({
    id: z.string().uuid().describe('ID of the field to update'),
    name: z.string().optional().describe('Internal name of the field'),
    label: z.string().optional().describe('Display label of the field'),
    description: z.string().optional().describe('Description of the field'),
    icon: z.string().optional().describe('Icon identifier for the field'),
    isActive: z.boolean().optional().describe('Whether the field is active'),
    isNullable: z
      .boolean()
      .optional()
      .describe('Whether the field can be null'),
    isUnique: z
      .boolean()
      .optional()
      .describe('Whether the field value must be unique'),
    defaultValue: z
      .unknown()
      .optional()
      .describe('Default value for the field'),
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
  }),
});

const DeleteFieldMetadataInputSchema = z.object({
  loadingMessage: z
    .string()
    .optional()
    .describe('A clear description of the action being performed.'),
  input: z.object({
    id: z.string().uuid().describe('ID of the field to delete'),
  }),
});

@Injectable()
export class MetadataToolsFactory {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {}

  generateTools(context: MetadataToolsContext): ToolSet {
    return {
      ...this.generateObjectMetadataTools(context),
      ...this.generateFieldMetadataTools(context),
    };
  }

  private generateObjectMetadataTools(context: MetadataToolsContext): ToolSet {
    return {
      'get-object-metadata': {
        description:
          'Find objects metadata. Retrieve information about the data model objects in the workspace.',
        inputSchema: GetObjectMetadataInputSchema,
        execute: async (parameters: {
          input: { id?: string; limit?: number };
        }) => {
          if (parameters.input.id) {
            const objectMetadata =
              await this.objectMetadataService.findOneWithinWorkspace(
                context.workspaceId,
                { where: { id: parameters.input.id } },
              );

            return objectMetadata ? [objectMetadata] : [];
          }

          const flatObjectMetadatas =
            await this.objectMetadataService.findManyWithinWorkspace(
              context.workspaceId,
              { take: parameters.input.limit ?? 100 },
            );

          return flatObjectMetadatas.map((flatObjectMetadata) =>
            fromFlatObjectMetadataToObjectMetadataDto(flatObjectMetadata),
          );
        },
      },
      'create-object-metadata': {
        description:
          'Create a new object metadata in the workspace data model.',
        inputSchema: CreateObjectMetadataInputSchema,
        execute: async (parameters: {
          input: {
            nameSingular: string;
            namePlural: string;
            labelSingular: string;
            labelPlural: string;
            description?: string;
            icon?: string;
            shortcut?: string;
            isRemote?: boolean;
            isLabelSyncedWithName?: boolean;
          };
        }) => {
          const flatObjectMetadata =
            await this.objectMetadataService.createOneObject({
              createObjectInput: parameters.input as Parameters<
                typeof this.objectMetadataService.createOneObject
              >[0]['createObjectInput'],
              workspaceId: context.workspaceId,
            });

          return fromFlatObjectMetadataToObjectMetadataDto(flatObjectMetadata);
        },
      },
      'update-object-metadata': {
        description:
          'Update an existing object metadata. Provide the object ID and the fields to update.',
        inputSchema: UpdateObjectMetadataInputSchema,
        execute: async (parameters: {
          input: {
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
          };
        }) => {
          const { id, ...update } = parameters.input;

          const flatObjectMetadata =
            await this.objectMetadataService.updateOneObject({
              updateObjectInput: { id, update },
              workspaceId: context.workspaceId,
            });

          return fromFlatObjectMetadataToObjectMetadataDto(flatObjectMetadata);
        },
      },
      'delete-object-metadata': {
        description:
          'Delete an object metadata by its ID. This will also delete all associated fields.',
        inputSchema: DeleteObjectMetadataInputSchema,
        execute: async (parameters: { input: { id: string } }) => {
          const flatObjectMetadata =
            await this.objectMetadataService.deleteOneObject({
              deleteObjectInput: { id: parameters.input.id },
              workspaceId: context.workspaceId,
            });

          return fromFlatObjectMetadataToObjectMetadataDto(flatObjectMetadata);
        },
      },
    };
  }

  private generateFieldMetadataTools(context: MetadataToolsContext): ToolSet {
    return {
      'get-field-metadata': {
        description:
          'Find fields metadata. Retrieve information about the fields of objects in the workspace data model.',
        inputSchema: GetFieldMetadataInputSchema,
        execute: async (parameters: {
          input: { id?: string; objectMetadataId?: string; limit?: number };
        }) => {
          if (parameters.input.id) {
            const fieldMetadata =
              await this.fieldMetadataService.findOneWithinWorkspace(
                context.workspaceId,
                { where: { id: parameters.input.id } },
              );

            return fieldMetadata ? [fieldMetadata] : [];
          }

          const fieldMetadatas = await this.fieldMetadataService.query({
            filter: {
              workspaceId: { eq: context.workspaceId },
              ...(parameters.input.objectMetadataId
                ? {
                    objectMetadataId: {
                      eq: parameters.input.objectMetadataId,
                    },
                  }
                : {}),
            },
            paging: { limit: parameters.input.limit ?? 100 },
          });

          return fieldMetadatas;
        },
      },
      'create-field-metadata': {
        description:
          'Create a new field metadata on an object. Specify the objectMetadataId and field properties.',
        inputSchema: CreateFieldMetadataInputSchema,
        execute: async (parameters: {
          input: {
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
          };
        }) => {
          const flatFieldMetadata =
            await this.fieldMetadataService.createOneField({
              createFieldInput: parameters.input as Parameters<
                typeof this.fieldMetadataService.createOneField
              >[0]['createFieldInput'],
              workspaceId: context.workspaceId,
            });

          return fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata);
        },
      },
      'update-field-metadata': {
        description:
          'Update an existing field metadata. Provide the field ID and the properties to update.',
        inputSchema: UpdateFieldMetadataInputSchema,
        execute: async (parameters: {
          input: {
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
          };
        }) => {
          const { id, ...update } = parameters.input;

          const flatFieldMetadata =
            await this.fieldMetadataService.updateOneField({
              updateFieldInput: { id, ...update } as Parameters<
                typeof this.fieldMetadataService.updateOneField
              >[0]['updateFieldInput'],
              workspaceId: context.workspaceId,
            });

          return fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata);
        },
      },
      'delete-field-metadata': {
        description: 'Delete a field metadata by its ID.',
        inputSchema: DeleteFieldMetadataInputSchema,
        execute: async (parameters: { input: { id: string } }) => {
          const flatFieldMetadata =
            await this.fieldMetadataService.deleteOneField({
              deleteOneFieldInput: { id: parameters.input.id },
              workspaceId: context.workspaceId,
            });

          return fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata);
        },
      },
    };
  }
}
