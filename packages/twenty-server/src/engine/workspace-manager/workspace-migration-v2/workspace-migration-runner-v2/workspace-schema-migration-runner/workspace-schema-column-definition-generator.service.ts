import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceSchemaColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/interfaces/workspace-schema-column-definition-generator.interface';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { BasicColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/column-generators/basic-column-definition.generator';
import { CompositeColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/column-generators/composite-column-definition.generator';
import { RelationColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/column-generators/relation-column-definition.generator';
import { TsVectorColumnDefinitionGenerator } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/column-generators/ts-vector-column-definition.generator';

@Injectable()
export class WorkspaceSchemaColumnDefinitionGeneratorService {
  private readonly logger = new Logger(
    WorkspaceSchemaColumnDefinitionGeneratorService.name,
  );
  private generatorsMap: Map<
    FieldMetadataType,
    WorkspaceSchemaColumnDefinitionGenerator
  >;

  constructor(
    private readonly basicColumnDefinitionGenerator: BasicColumnDefinitionGenerator,
    private readonly tsVectorColumnDefinitionGenerator: TsVectorColumnDefinitionGenerator,
    private readonly compositeColumnDefinitionGenerator: CompositeColumnDefinitionGenerator,
    private readonly relationColumnDefinitionGenerator: RelationColumnDefinitionGenerator,
  ) {
    this.generatorsMap = new Map<
      FieldMetadataType,
      WorkspaceSchemaColumnDefinitionGenerator
    >([
      [FieldMetadataType.UUID, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.TEXT, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.NUMERIC, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.NUMBER, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.POSITION, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.RAW_JSON, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.RICH_TEXT, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.BOOLEAN, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.DATE_TIME, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.DATE, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.ARRAY, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.RATING, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.SELECT, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.MULTI_SELECT, this.basicColumnDefinitionGenerator],
      [FieldMetadataType.CURRENCY, this.compositeColumnDefinitionGenerator],
      [FieldMetadataType.ADDRESS, this.compositeColumnDefinitionGenerator],
      [FieldMetadataType.FULL_NAME, this.compositeColumnDefinitionGenerator],
      [FieldMetadataType.LINKS, this.compositeColumnDefinitionGenerator],
      [FieldMetadataType.ACTOR, this.compositeColumnDefinitionGenerator],
      [FieldMetadataType.EMAILS, this.compositeColumnDefinitionGenerator],
      [FieldMetadataType.PHONES, this.compositeColumnDefinitionGenerator],
      [FieldMetadataType.RICH_TEXT_V2, this.compositeColumnDefinitionGenerator],
      [FieldMetadataType.TS_VECTOR, this.tsVectorColumnDefinitionGenerator],
      [FieldMetadataType.RELATION, this.relationColumnDefinitionGenerator],
    ]);
  }

  generateColumnDefinitions(
    fieldMetadata: FlatFieldMetadata[],
  ): WorkspaceSchemaColumnDefinition[] {
    return fieldMetadata.flatMap((fieldMetadata) => {
      const generator = this.generatorsMap.get(fieldMetadata.type);

      if (!generator) {
        throw new Error(`No generator found for type ${fieldMetadata.type}`);
      }

      return generator.generateColumnDefinitions(fieldMetadata);
    });
  }
}
