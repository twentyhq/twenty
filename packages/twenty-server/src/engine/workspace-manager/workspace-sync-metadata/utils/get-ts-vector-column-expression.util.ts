import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import {
  phonesCompositeType,
  PRIMARY_PHONE_COUNTRY_CODE,
  PRIMARY_PHONE_NUMBER,
} from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';
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
  const columnExpressions = fieldsUsedForSearch.flatMap(
    getColumnExpressionsFromField,
  );
  const concatenatedExpression = columnExpressions.join(" || ' ' || ");

  return `to_tsvector('simple', ${concatenatedExpression})`;
};

const getColumnExpressionsFromField = (
  fieldMetadataTypeAndName: FieldTypeAndNameMetadata,
): string[] => {
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

    if (compositeType === phonesCompositeType) {
      const primaryPhoneNumberProperty = compositeType.properties.find(
        (property) => property.name === PRIMARY_PHONE_NUMBER,
      );

      const primaryPhoneCountryCodeProperty = compositeType.properties.find(
        (property) => property.name === PRIMARY_PHONE_COUNTRY_CODE,
      );

      if (!primaryPhoneNumberProperty || !primaryPhoneCountryCodeProperty) {
        throw new Error(
          'Primary phone number or country code properties not found for field metadata type PHONES',
        );
      }

      const countryCodeColumn = computeCompositeColumnName(
        fieldMetadataTypeAndName.name,
        primaryPhoneNumberProperty,
      );
      const phoneNumberColumn = computeCompositeColumnName(
        fieldMetadataTypeAndName.name,
        primaryPhoneCountryCodeProperty,
      );
      const concatenatedCountryCodeAndNumberExpression = `
      COALESCE(
        CONCAT_WS(' ',
          "${phoneNumberColumn}",
          "${countryCodeColumn}"
        ),
        ''
      )
    `;

      return [concatenatedCountryCodeAndNumberExpression];
    }

    return compositeType.properties
      .filter((property) => property.type === FieldMetadataType.TEXT)
      .map((property) => {
        const columnName = computeCompositeColumnName(
          fieldMetadataTypeAndName,
          property,
        );

        return getColumnExpression(columnName, fieldMetadataTypeAndName.type);
      });
  } else {
    const columnName = computeColumnName(fieldMetadataTypeAndName.name);

    return [getColumnExpression(columnName, fieldMetadataTypeAndName.type)];
  }
};

const getColumnExpression = (
  columnName: string,
  fieldType: FieldMetadataType,
): string => {
  const quotedColumnName = `"${columnName}"`;

  if (fieldType === FieldMetadataType.EMAILS) {
    return `
      COALESCE(
        replace(
          ${quotedColumnName},
          '@',
          ' '
        ),
        ''
      )
    `;
  } else {
    return `COALESCE(${quotedColumnName}, '')`;
  }
};
