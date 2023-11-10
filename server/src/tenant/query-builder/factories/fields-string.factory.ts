import { Injectable, Logger } from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import isEmpty from 'lodash.isempty';

import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';

import { isCompositeFieldMetadataType } from 'src/tenant/utils/is-composite-field-metadata-type.util';

import { FieldAliasFacotry } from './field-alias.factory';
import { CompositeFieldAliasFactory } from './composite-field-alias.factory';

@Injectable()
export class FieldsStringFactory {
  private readonly logger = new Logger(FieldsStringFactory.name);

  constructor(
    private readonly fieldAliasFactory: FieldAliasFacotry,
    private readonly compositeFieldAliasFactory: CompositeFieldAliasFactory,
  ) {}

  create(
    info: GraphQLResolveInfo,
    fieldMetadataCollection: FieldMetadataInterface[],
  ) {
    const selectedFields: Record<string, any> = graphqlFields(info);

    return this.createFieldsStringRecursive(
      info,
      selectedFields,
      fieldMetadataCollection,
    );
  }

  createFieldsStringRecursive(
    info: GraphQLResolveInfo,
    selectedFields: Record<string, any>,
    fieldMetadataCollection: FieldMetadataInterface[],
    accumulator = '',
  ): string {
    const fieldMetadataMap = new Map(
      fieldMetadataCollection.map((metadata) => [metadata.name, metadata]),
    );

    for (const [fieldKey, fieldValue] of Object.entries(selectedFields)) {
      let fieldAlias: string | null;

      if (fieldMetadataMap.has(fieldKey)) {
        // We're sure that the field exists in the map after this if condition
        // ES6 should tackle that more properly
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const fieldMetadata = fieldMetadataMap.get(fieldKey)!;

        // If the field is a composite field, we need to create a special alias
        if (isCompositeFieldMetadataType(fieldMetadata.type)) {
          const alias = this.compositeFieldAliasFactory.create(
            fieldKey,
            fieldValue,
            fieldMetadata,
            info,
          );

          fieldAlias = alias;
        } else {
          // Otherwise we just need to create a simple alias
          const alias = this.fieldAliasFactory.create(fieldKey, fieldMetadata);

          fieldAlias = alias;
        }
      }

      fieldAlias ??= fieldKey;

      // Recurse if value is a nested object, otherwise append field or alias
      if (
        !fieldMetadataMap.has(fieldKey) &&
        fieldValue &&
        typeof fieldValue === 'object' &&
        !isEmpty(fieldValue)
      ) {
        accumulator += `${fieldKey} {\n`;
        accumulator = this.createFieldsStringRecursive(
          info,
          fieldValue,
          fieldMetadataCollection,
          accumulator,
        );
        accumulator += `}\n`;
      } else {
        accumulator += `${fieldAlias}\n`;
      }
    }

    return accumulator;
  }
}
