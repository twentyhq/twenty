import { GraphQLResolveInfo } from 'graphql';
import isEmpty from 'lodash.isempty';

import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';

import { isCompositeFieldMetadataType } from 'src/tenant/schema-builder/utils/is-composite-field-metadata-type.util';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  RelationDirection,
  deduceRelationDirection,
} from 'src/tenant/schema-builder/utils/deduce-relation-direction.util';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

import { generateArgsInput } from './generate-args-input.util';
import { getFieldArgumentsByKey } from './get-field-arguments-by-key.util';

export const convertFieldsToGraphQL = (
  info: GraphQLResolveInfo,
  select: any,
  fieldMetadataCollection: FieldMetadataInterface[],
  acc = '',
) => {
  const fieldMetadataMap = new Map(
    fieldMetadataCollection.map((metadata) => [metadata.name, metadata]),
  );

  for (const [key, value] of Object.entries(select)) {
    let fieldAlias = key;

    if (fieldMetadataMap.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const fieldMetadata = fieldMetadataMap.get(key)!;

      if (!fieldMetadata) {
        throw new Error(`Field ${key} not found in fieldsMap`);
      }

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        if (fieldMetadata.type === FieldMetadataType.RELATION) {
          const relationMetadata =
            fieldMetadata.fromRelationMetadata ??
            fieldMetadata.toRelationMetadata;

          if (!relationMetadata) {
            throw new Error(`Relation metadata not found for field ${key}`);
          }

          const targetTableName =
            relationMetadata.toObjectMetadata.targetTableName;
          const relationDirection = deduceRelationDirection(
            fieldMetadata.objectId,
            relationMetadata,
          );

          if (
            relationMetadata.relationType ===
              RelationMetadataType.ONE_TO_MANY &&
            relationDirection === RelationDirection.FROM
          ) {
            const args = getFieldArgumentsByKey(info, key);
            const argsString = generateArgsInput(args);

            fieldAlias = `
              ${key}: ${targetTableName}Collection${
              argsString ? `(${argsString})` : ''
            } {
                ${convertFieldsToGraphQL(
                  info,
                  value,
                  relationMetadata.toObjectMetadata.fields,
                )}
              }
            `;
          } else {
            fieldAlias = `
              ${key}: ${targetTableName} {
                ${convertFieldsToGraphQL(
                  info,
                  value,
                  relationMetadata.toObjectMetadata.fields,
                )}
              }
            `;
          }
        }
      } else {
        const entries = Object.entries(fieldMetadata.targetColumnMap);

        if (entries.length > 0) {
          // If there is only one value, use it as the alias
          if (entries.length === 1) {
            const alias = entries[0][1];

            fieldAlias = `${key}: ${alias}`;
          } else {
            // Otherwise it means it's a special type with multiple values, so we need fetch all fields
            fieldAlias = `
            ${entries
              .map(
                ([key, value]) => `___${fieldMetadata.name}_${key}: ${value}`,
              )
              .join('\n')}
          `;
          }
        }
      }
    }

    // Recurse if value is a nested object, otherwise append field or alias
    if (
      !fieldMetadataMap.has(key) &&
      value &&
      typeof value === 'object' &&
      !isEmpty(value)
    ) {
      acc += `${key} {\n`;
      acc = convertFieldsToGraphQL(info, value, fieldMetadataCollection, acc); // recursive call with updated accumulator
      acc += `}\n`;
    } else {
      acc += `${fieldAlias}\n`;
    }
  }

  return acc;
};
