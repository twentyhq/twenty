import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { METADATA_TOOL_EXCLUDED_FIELD_NAMES } from 'src/engine/core-modules/tool-provider/constants/metadata-tool-excluded-field-names.constant';
import { compactMetadataOutput } from 'src/engine/core-modules/tool-provider/utils/compact-metadata-output.util';
import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

type InlinedObjectFieldSummary = {
  id: string;
  name: string;
  type: FieldMetadataType;
  label: string;
};

const OBJECT_STRIP_WHEN_NULLISH = [
  'overrides',
  'color',
  'duplicateCriteria',
  'shortcut',
  'imageIdentifierFieldMetadataId',
  'description',
  'icon',
];

const GetObjectMetadataInputSchema = z.object({
  id: z.uuid().optional().describe('Object ID. Returns one object if set.'),
  objectName: z
    .string()
    .optional()
    .describe(
      'Filter by object name, singular or plural (e.g. "opportunity" or "opportunities"). Lets you locate an object by name in one call without scanning the full list.',
    ),
  includeFields: z
    .boolean()
    .default(false)
    .describe(
      'When true, each returned object includes its fields as a compact array of {id, name, type, label}. Use this to fetch an object and all the field ids you need in a single call (e.g. before building a dashboard) instead of a separate get_field_metadata call.',
    ),
  includeFullSystemObjects: z
    .boolean()
    .default(false)
    .describe(
      "Keep false (default) for listing or locating objects — system objects then return as compact {id, nameSingular, namePlural}, which is enough to find an object and read its id. Only set true when you specifically need a system object's full configuration (e.g. building a relation to workspaceMember).",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(100)
    .describe('Max objects to return.'),
});

const CreateObjectMetadataInputSchema = z.object({
  nameSingular: z.string().describe('Singular name (e.g. "company")'),
  namePlural: z.string().describe('Plural name (e.g. "companies")'),
  labelSingular: z.string().describe('Singular label (e.g. "Company")'),
  labelPlural: z.string().describe('Plural label (e.g. "Companies")'),
  description: z.string().optional().describe('Description'),
  icon: z.string().optional().describe('Icon name'),
  shortcut: z.string().optional().describe('Keyboard shortcut'),
  isRemote: z.boolean().optional().describe('Remote object'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Sync label with name'),
});

const UpdateObjectMetadataInputSchema = z.object({
  id: z.uuid().describe('Object ID'),
  labelSingular: z.string().optional().describe('Singular label'),
  labelPlural: z.string().optional().describe('Plural label'),
  nameSingular: z.string().optional().describe('Singular name'),
  namePlural: z.string().optional().describe('Plural name'),
  description: z.string().optional().describe('Description'),
  icon: z.string().optional().describe('Icon name'),
  shortcut: z.string().optional().describe('Keyboard shortcut'),
  isActive: z.boolean().optional().describe('Active state'),
  labelIdentifierFieldMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe('Label identifier field ID'),
  imageIdentifierFieldMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe('Image identifier field ID'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Sync label with name'),
});

const DeleteObjectMetadataInputSchema = z.object({
  id: z.string().uuid().describe('Object ID'),
});

const CreateManyObjectMetadataInputSchema = z.object({
  objects: z
    .array(CreateObjectMetadataInputSchema)
    .min(1)
    .max(20)
    .describe('Objects to create (max 20).'),
});

const UpdateManyObjectMetadataInputSchema = z.object({
  objects: z
    .array(UpdateObjectMetadataInputSchema)
    .min(1)
    .max(20)
    .describe('Objects to update (max 20).'),
});

@Injectable()
export class ObjectMetadataToolsFactory {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private async buildFieldsByObjectId(
    workspaceId: string,
  ): Promise<Map<string, InlinedObjectFieldSummary[]>> {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const fieldsByObjectId = new Map<string, InlinedObjectFieldSummary[]>();

    for (const fieldMetadata of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(fieldMetadata) ||
        METADATA_TOOL_EXCLUDED_FIELD_NAMES.has(fieldMetadata.name)
      ) {
        continue;
      }

      const existing =
        fieldsByObjectId.get(fieldMetadata.objectMetadataId) ?? [];

      existing.push({
        id: fieldMetadata.id,
        name: fieldMetadata.name,
        type: fieldMetadata.type,
        label: fieldMetadata.label ?? fieldMetadata.name,
      });
      fieldsByObjectId.set(fieldMetadata.objectMetadataId, existing);
    }

    return fieldsByObjectId;
  }

  generateTools(workspaceId: string): ToolSet {
    return {
      get_object_metadata: {
        description:
          "List object metadata as an array. Filter to a single object by id or objectName (singular or plural). Set includeFields to also return each object's fields ({id, name, type, label}) — enough to build a dashboard or view without a separate get_field_metadata call. System objects are otherwise returned as compact {id, nameSingular, namePlural}. Keep includeFullSystemObjects at its default (false); only set it true when you specifically need a system object's full configuration.",
        inputSchema: GetObjectMetadataInputSchema,
        execute: async (parameters: {
          id?: string;
          objectName?: string;
          includeFields?: boolean;
          includeFullSystemObjects?: boolean;
          limit?: number;
        }) => {
          const flatObjectMetadatas =
            await this.objectMetadataService.findManyWithinWorkspace(
              workspaceId,
              {
                ...(parameters.id
                  ? { where: { id: parameters.id } }
                  : parameters.objectName
                    ? {
                        where: [
                          { nameSingular: parameters.objectName },
                          { namePlural: parameters.objectName },
                        ],
                      }
                    : {}),
                take: parameters.limit ?? 100,
              },
            );

          const fieldsByObjectId = parameters.includeFields
            ? await this.buildFieldsByObjectId(workspaceId)
            : undefined;

          return flatObjectMetadatas.map((flatObjectMetadata) => {
            const dto =
              fromFlatObjectMetadataToObjectMetadataDto(flatObjectMetadata);

            const fields = fieldsByObjectId?.get(dto.id) ?? [];

            if (dto.isSystem && !parameters.includeFullSystemObjects) {
              return {
                id: dto.id,
                nameSingular: dto.nameSingular,
                namePlural: dto.namePlural,
                ...(parameters.includeFields ? { fields } : {}),
              };
            }

            return compactMetadataOutput(
              {
                ...dto,
                ...(parameters.includeFields ? { fields } : {}),
              },
              { stripWhenNullish: OBJECT_STRIP_WHEN_NULLISH },
            );
          });
        },
      },
      create_object_metadata: {
        description: 'Create a new object in the workspace data model.',
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

            return {
              id: flatObjectMetadata.id,
              nameSingular: flatObjectMetadata.nameSingular,
              labelSingular: flatObjectMetadata.labelSingular,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      update_object_metadata: {
        description:
          'Update an object. Provide object ID and properties to change.',
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

            return {
              id: flatObjectMetadata.id,
              nameSingular: flatObjectMetadata.nameSingular,
              labelSingular: flatObjectMetadata.labelSingular,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      delete_object_metadata: {
        description: 'Delete an object by ID. Also deletes associated fields.',
        inputSchema: DeleteObjectMetadataInputSchema,
        execute: async (parameters: { id: string }) => {
          try {
            const flatObjectMetadata =
              await this.objectMetadataService.deleteOneObject({
                deleteObjectInput: { id: parameters.id },
                workspaceId,
              });

            return { id: flatObjectMetadata.id, success: true };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      create_many_object_metadata: {
        description:
          'Create multiple objects at once. Batch version of create_object_metadata.',
        inputSchema: CreateManyObjectMetadataInputSchema,
        execute: async (parameters: {
          objects: Array<{
            nameSingular: string;
            namePlural: string;
            labelSingular: string;
            labelPlural: string;
            description?: string;
            icon?: string;
            shortcut?: string;
            isRemote?: boolean;
            isLabelSyncedWithName?: boolean;
          }>;
        }) => {
          try {
            await Promise.all(
              parameters.objects.map(async (createObjectInput) => {
                await this.objectMetadataService.createOneObject({
                  createObjectInput: createObjectInput as Parameters<
                    typeof this.objectMetadataService.createOneObject
                  >[0]['createObjectInput'],
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
      update_many_object_metadata: {
        description:
          'Update multiple objects at once. Batch version of update_object_metadata.',
        inputSchema: UpdateManyObjectMetadataInputSchema,
        execute: async (parameters: {
          objects: Array<{
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
          }>;
        }) => {
          try {
            await Promise.all(
              parameters.objects.map(async ({ id, ...update }) => {
                await this.objectMetadataService.updateOneObject({
                  updateObjectInput: { id, update },
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
    };
  }
}
