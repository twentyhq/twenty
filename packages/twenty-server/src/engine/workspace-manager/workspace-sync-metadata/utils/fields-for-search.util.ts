import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import {
    FieldMetadataEntity,
    FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
    computeColumnName,
    computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
    WorkspaceMigrationException,
    WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';
import { PERSON_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const PERSON_SEARCH_FIELDS_STANDARD_IDS = [
  PERSON_STANDARD_FIELD_IDS.name,
  PERSON_STANDARD_FIELD_IDS.email,
  PERSON_STANDARD_FIELD_IDS.phone,
];

export const getTsVectorColumnExpressionFromFields = (
  fieldsUsedForSearch: FieldMetadataEntity[],
): string => {
  let columnNames: string[] = [];

  for (const fieldMetadata of fieldsUsedForSearch) {
    columnNames = columnNames.concat(getColumnNamesFromField(fieldMetadata));
  }

  const coalesceExpressions = columnNames.map(
    (columnName) => `coalesce("${columnName}", '')`,
  );

  const concatenatedExpression = coalesceExpressions.join(" || ' ' || ");

  return `to_tsvector('simple', ${concatenatedExpression})`;
};

const getColumnNamesFromField = (
  fieldMetadata: FieldMetadataEntity,
): string[] => {
  const columnNames: string[] = [];

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

    if (!compositeType) {
      throw new WorkspaceMigrationException(
        `Composite type not found for field metadata type: ${fieldMetadata.type}`,
        WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA,
      );
    }

    for (const property of compositeType.properties) {
      if (property.type === FieldMetadataType.RELATION) {
        throw new WorkspaceMigrationException(
          `Relation type not supported for composite columns`,
          WorkspaceMigrationExceptionCode.INVALID_COMPOSITE_TYPE,
        );
      }

      columnNames.push(computeCompositeColumnName(fieldMetadata, property));
    }
  } else {
    columnNames.push(computeColumnName(fieldMetadata));
  }

  return columnNames;
};
