import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceSchemaColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/interfaces/workspace-schema-column-definition-generator.interface';

import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';

@Injectable()
export class TsVectorColumnDefinitionGenerator
  implements
    WorkspaceSchemaColumnDefinitionGenerator<FieldMetadataType.TS_VECTOR>
{
  generateColumnDefinitions(
    fieldMetadata: FlatFieldMetadata<FieldMetadataType.TS_VECTOR>,
  ): WorkspaceSchemaColumnDefinition[] {
    const columnName = computeColumnName(fieldMetadata.name);

    return [
      {
        name: columnName,
        type: fieldMetadataTypeToColumnType(fieldMetadata.type),
        isNullable: true,
        isArray: false,
        isUnique: false,
        default: null,
        generatedType: 'STORED',
        asExpression: getTsVectorColumnExpressionFromFields([]), // TODO: setup asExpression in flatFieldMetadata transpilation
      },
    ];
  }
}
