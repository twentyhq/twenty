import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceSchemaColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/interfaces/workspace-schema-column-definition-generator.interface';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';

@Injectable()
export class RelationColumnDefinitionGenerator
  implements
    WorkspaceSchemaColumnDefinitionGenerator<FieldMetadataType.RELATION>
{
  generateColumnDefinitions(
    fieldMetadata: FlatFieldMetadata<FieldMetadataType.RELATION>,
  ): WorkspaceSchemaColumnDefinition[] {
    if (!fieldMetadata.settings || !fieldMetadata.settings.joinColumnName) {
      return [];
    }

    const joinColumnName = fieldMetadata.settings.joinColumnName;

    return [
      {
        name: joinColumnName,
        type: fieldMetadataTypeToColumnType(FieldMetadataType.UUID),
        isNullable: fieldMetadata.isNullable ?? true,
        isArray: false,
        isUnique: false,
        default: null,
      },
    ];
  }
}
