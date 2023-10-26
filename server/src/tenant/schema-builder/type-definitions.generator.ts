import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { customTableDefaultColumns } from 'src/metadata/migration-runner/custom-table-default-column.util';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

import { TypeDefinitionsStorage } from './storages/type-definitions.storage';
import { ObjectTypeDefinitionFactory } from './factories/object-type-definition.factory';
import { InputTypeDefinitionFactory } from './factories/input-type-definition.factory';
import { getFieldMetadataType } from './utils/get-field-metadata-type.util';
import { BuildSchemaOptions } from './interfaces/build-schema-optionts.interface';
import { InputTypeKind } from './factories/input-type.factory';
import { moneyObjectDefinition } from './objects/money.object';
import { urlObjectDefinition } from './objects/url.object';
import { IObjectMetadata } from './metadata/object.metadata';
import { IFieldMetadata } from './metadata/field.metadata';

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
  private readonly logger = new Logger(TypeDefinitionsGenerator.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly objectTypeDefinitionFactory: ObjectTypeDefinitionFactory,
    private readonly inputTypeDefinitionFactory: InputTypeDefinitionFactory,
  ) {}

  async generate(objects: ObjectMetadata[], options: BuildSchemaOptions) {
    this.generateStaticObjectTypeDefs(options);
    await this.generateDynamicObjectTypeDefs(objects, options);
  }

  private generateStaticObjectTypeDefs(options: BuildSchemaOptions) {
    const staticObjects = [moneyObjectDefinition, urlObjectDefinition];

    this.logger.log(
      `Generating staticObjects: [${staticObjects
        .map((object) => object.nameSingular)
        .join(', ')}]`,
    );

    // Generate static objects first because they can be used in dynamic objects
    this.generateObjectTypeDefs(staticObjects, options);
    this.generateCreateInputTypeDefs(staticObjects, options);
    this.generateUpdateInputTypeDefs(staticObjects, options);
  }

  private async generateDynamicObjectTypeDefs(
    dynamicObjects: ObjectMetadata[],
    options: BuildSchemaOptions,
  ) {
    this.logger.log(
      `Generating dynamicObjects: [${dynamicObjects
        .map((object) => object.nameSingular)
        .join(', ')}]`,
    );

    // Generate dynamic objects
    this.generateObjectTypeDefs(dynamicObjects, options);
    this.generateCreateInputTypeDefs(dynamicObjects, options);
    this.generateUpdateInputTypeDefs(dynamicObjects, options);
  }

  private generateObjectTypeDefs(
    objects: IObjectMetadata[],
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
    objects: IObjectMetadata[],
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
    objects: IObjectMetadata[],
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

  private mergeFieldsWithDefaults(fields: IFieldMetadata[]): IFieldMetadata[] {
    const fieldNames = new Set(fields.map((field) => field.name));

    const uniqueDefaultFields = defaultFields.filter(
      (defaultField) => !fieldNames.has(defaultField.name),
    );

    return [...fields, ...uniqueDefaultFields];
  }
}
