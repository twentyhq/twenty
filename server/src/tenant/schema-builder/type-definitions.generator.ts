import { Injectable } from '@nestjs/common';

import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';
import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { customTableDefaultColumns } from 'src/metadata/migration-runner/custom-table-default-column.util';

import { TypeDefinitionsStorage } from './storages/type-definitions.storage';
import { ObjectTypeDefinitionFactory } from './factories/object-type-definition.factory';
import { InputTypeDefinitionFactory } from './factories/input-type-definition.factory';
import { getFieldMetadataType } from './utils/get-field-metadata-type.util';
import { BuildSchemaOptions } from './interfaces/build-schema-optionts.interface';
import { InputTypeKind } from './factories/input-type.factory';

// Create a default field for each custom table default column
const defaultFields = customTableDefaultColumns.map((column) => {
  return {
    type: getFieldMetadataType(column.type),
    name: column.name,
    isNullable: column.isNullable,
  } as FieldMetadata;
});

@Injectable()
export class TypeDefinitionsGenerator {
  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly objectTypeDefinitionFactory: ObjectTypeDefinitionFactory,
    private readonly inputTypeDefinitionFactory: InputTypeDefinitionFactory,
  ) {}

  async generate(options: BuildSchemaOptions) {
    const objects =
      await this.objectMetadataService.getObjectMetadataFromDataSourceId(
        options.dataSourceId,
      );

    this.generateObjectTypeDefs(objects, options);
    this.generateCreateInputTypeDefs(objects, options);
    this.generateUpdateInputTypeDefs(objects, options);
  }

  private generateObjectTypeDefs(
    objects: ObjectMetadata[],
    options: BuildSchemaOptions,
  ) {
    const objectTypeDefs = objects.map((metadata) =>
      this.objectTypeDefinitionFactory.create(
        {
          ...metadata,
          fields: this.mergeFieldsWithDefaults(metadata.fields),
        },
        options,
      ),
    );

    this.typeDefinitionsStorage.addObjectTypes(objectTypeDefs);
  }

  private generateCreateInputTypeDefs(
    objects: ObjectMetadata[],
    options: BuildSchemaOptions,
  ) {
    const inputTypeDefs = objects.map((metadata) =>
      this.inputTypeDefinitionFactory.create(
        {
          ...metadata,
          fields: this.mergeFieldsWithDefaults(metadata.fields),
        },
        InputTypeKind.Create,
        options,
      ),
    );

    this.typeDefinitionsStorage.addInputTypes(inputTypeDefs);
  }

  private generateUpdateInputTypeDefs(
    objects: ObjectMetadata[],
    options: BuildSchemaOptions,
  ) {
    const inputTypeDefs = objects.map((metadata) => {
      const fields = this.mergeFieldsWithDefaults(metadata.fields);

      return this.inputTypeDefinitionFactory.create(
        {
          ...metadata,
          // All fields are nullable for update input types
          fields: fields.map((field) => ({ ...field, isNullable: true })),
        },
        InputTypeKind.Update,
        options,
      );
    });

    this.typeDefinitionsStorage.addInputTypes(inputTypeDefs);
  }

  private mergeFieldsWithDefaults(fields: FieldMetadata[]): FieldMetadata[] {
    const fieldNames = new Set(fields.map((field) => field.name));

    const uniqueDefaultFields = defaultFields.filter(
      (defaultField) => !fieldNames.has(defaultField.name),
    );

    return [...fields, ...uniqueDefaultFields];
  }
}
