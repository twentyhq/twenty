import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  WorkspaceMigrationException,
  WorkspaceMigrationExceptionCode,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

type FieldTypeAndNameMetadata = {
  name: string;
  type: FieldMetadataType;
};

export const getTsVectorColumnExpressionFromFields = (
  fieldsUsedForSearch: FieldTypeAndNameMetadata[],
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
  fieldMetadataTypeAndName: FieldTypeAndNameMetadata,
): string[] => {
  const columnNames: string[] = [];

  if (isCompositeFieldMetadataType(fieldMetadataTypeAndName.type)) {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadataTypeAndName.type,
    );

    if (!compositeType) {
      throw new WorkspaceMigrationException(
        `Composite type not found for field metadata type: ${fieldMetadataTypeAndName.type}`,
        WorkspaceMigrationExceptionCode.INVALID_FIELD_METADATA,
      );
    }

    for (const property of compositeType.properties) {
      if (property.type !== FieldMetadataType.TEXT) {
        continue;
      }

      columnNames.push(
        computeCompositeColumnName(fieldMetadataTypeAndName, property),
      );
    }
  } else {
    columnNames.push(computeColumnName(fieldMetadataTypeAndName.name));
  }

  return columnNames;
};
