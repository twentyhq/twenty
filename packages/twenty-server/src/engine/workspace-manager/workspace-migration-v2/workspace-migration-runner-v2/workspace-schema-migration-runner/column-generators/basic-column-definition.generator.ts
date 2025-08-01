import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceSchemaColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/interfaces/workspace-schema-column-definition-generator.interface';

import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { BasicFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/basic-column-action.factory';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';

@Injectable()
export class BasicColumnDefinitionGenerator
  implements WorkspaceSchemaColumnDefinitionGenerator<BasicFieldMetadataType>
{
  generateColumnDefinitions(
    fieldMetadata: FlatFieldMetadata<BasicFieldMetadataType>,
  ): WorkspaceSchemaColumnDefinition[] {
    const columnName = computeColumnName(fieldMetadata.name);
    const serializedDefaultValue = serializeDefaultValue(
      fieldMetadata.defaultValue,
    );

    return [
      {
        name: columnName,
        type: fieldMetadataTypeToColumnType(fieldMetadata.type),
        isNullable: fieldMetadata.isNullable ?? true,
        isArray: fieldMetadata.type === FieldMetadataType.ARRAY,
        isUnique: fieldMetadata.isUnique ?? false,
        default: serializedDefaultValue,
      },
    ];
  }
}
