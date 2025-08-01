import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceSchemaColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/interfaces/workspace-schema-column-definition-generator.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';

@Injectable()
export class CompositeColumnDefinitionGenerator
  implements
    WorkspaceSchemaColumnDefinitionGenerator<CompositeFieldMetadataType>
{
  private readonly logger = new Logger(CompositeColumnDefinitionGenerator.name);

  generateColumnDefinitions(
    fieldMetadata: FlatFieldMetadata<CompositeFieldMetadataType>,
  ): WorkspaceSchemaColumnDefinition[] {
    const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

    if (!compositeType) {
      throw new Error(
        `Composite type not found for field metadata type: ${fieldMetadata.type}`,
      );
    }

    const columnDefinitions: WorkspaceSchemaColumnDefinition[] = [];

    for (const property of compositeType.properties) {
      if (property.type === FieldMetadataType.RELATION) {
        throw new Error(`Relation type not supported for composite columns`);
      }

      const columnName = computeCompositeColumnName(fieldMetadata, property);
      // @ts-expect-error legacy noImplicitAny
      const defaultValue = fieldMetadata.defaultValue?.[property.name];
      const serializedDefaultValue = serializeDefaultValue(defaultValue);
      const enumOptions = property.options
        ? [...property.options.map((option) => option.value)]
        : undefined;

      columnDefinitions.push({
        name: columnName,
        type: fieldMetadataTypeToColumnType(property.type),
        isNullable: fieldMetadata.isNullable || !property.isRequired,
        isUnique: fieldMetadata.isUnique ?? false,
        default: serializedDefaultValue,
        isArray:
          property.type === FieldMetadataType.ARRAY ||
          property.type === FieldMetadataType.MULTI_SELECT ||
          property.isArray,
        enum: enumOptions,
      });
    }

    return columnDefinitions;
  }
}
