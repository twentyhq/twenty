import { v4 } from 'uuid';

import { uuidToBase36 } from 'src/metadata/data-source/data-source.util';

import { FieldMetadataTargetColumnMap } from './field-metadata.entity';

/**
 * Generate a column name from a field name removing unsupported characters.
 *
 * @param name string
 * @returns string
 */
export function generateColumnName(name: string): string {
  return name.toLowerCase().replace(/ /g, '_');
}

/**
 * Generate a target column map for a given type, this is used to map the field to the correct column(s) in the database.
 * This is used to support fields that map to multiple columns in the database.
 *
 * @param type string
 * @returns FieldMetadataTargetColumnMap
 */
export function generateTargetColumnMap(
  type: string,
): FieldMetadataTargetColumnMap {
  switch (type) {
    case 'text':
    case 'phone':
    case 'email':
    case 'number':
    case 'boolean':
    case 'date':
      return {
        value: uuidToBase36(v4()),
      };
    case 'url':
      return {
        text: uuidToBase36(v4()),
        link: uuidToBase36(v4()),
      };
    case 'money':
      return {
        amount: uuidToBase36(v4()),
        currency: uuidToBase36(v4()),
      };
    default:
      throw new Error(`Unknown type ${type}`);
  }
}
