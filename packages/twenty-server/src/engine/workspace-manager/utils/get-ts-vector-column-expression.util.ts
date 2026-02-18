import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';

import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { type SearchableFieldType } from 'src/engine/workspace-manager/utils/is-searchable-field.util';
import { isSearchableSubfield } from 'src/engine/workspace-manager/utils/is-searchable-subfield.util';

export type FieldTypeAndNameMetadata = {
  name: string;
  type: SearchableFieldType;
};

export const getTsVectorColumnExpressionFromFields = (
  fieldsUsedForSearch: FieldTypeAndNameMetadata[],
): string => {
  const columnExpressions = fieldsUsedForSearch.flatMap(
    getColumnExpressionsFromField,
  );
  const concatenatedExpression =
    columnExpressions.length > 0
      ? columnExpressions.join(" || ' ' || ")
      : 'NULL';

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
      throw new Error(
        `Composite type not found for field metadata type: ${fieldMetadataTypeAndName.type}`,
      );
    }

    const baseExpressions = compositeType.properties
      .filter((property) =>
        isSearchableSubfield(compositeType.type, property.type, property.name),
      )
      .map((property) => {
        const columnName = computeCompositeColumnName(
          fieldMetadataTypeAndName,
          property,
        );

        return getColumnExpression(columnName, fieldMetadataTypeAndName.type);
      });

    if (fieldMetadataTypeAndName.type === FieldMetadataType.PHONES) {
      const phoneNumberColumn = escapeIdentifier(
        `${fieldMetadataTypeAndName.name}PrimaryPhoneNumber`,
      );
      const callingCodeColumn = escapeIdentifier(
        `${fieldMetadataTypeAndName.name}PrimaryPhoneCallingCode`,
      );
      const additionalPhonesColumn = escapeIdentifier(
        `${fieldMetadataTypeAndName.name}AdditionalPhones`,
      );

      const internationalFormats = [
        `COALESCE(${callingCodeColumn} || ${phoneNumberColumn}, '')`,
        `COALESCE(REPLACE(${callingCodeColumn}, '+', '') || ${phoneNumberColumn}, '')`,
        `COALESCE('0' || ${phoneNumberColumn}, '')`,
      ];

      const additionalPhonesExpression = `COALESCE(TRANSLATE(regexp_replace(${additionalPhonesColumn}::text, '"(number|countryCode|callingCode)"\\s*:\\s*', '', 'g'), '[]{}",:', '        '), '')`;

      return [
        ...baseExpressions,
        ...internationalFormats,
        additionalPhonesExpression,
      ];
    }

    if (fieldMetadataTypeAndName.type === FieldMetadataType.LINKS) {
      const secondaryLinksColumn = escapeIdentifier(
        `${fieldMetadataTypeAndName.name}SecondaryLinks`,
      );

      const secondaryLinksExpression = `COALESCE(public.unaccent_immutable(TRANSLATE(regexp_replace(${secondaryLinksColumn}::text, '"(label|url)"\\s*:\\s*', '', 'g'), '[]{}",:', '        ')), '')`;

      return [...baseExpressions, secondaryLinksExpression];
    }

    if (fieldMetadataTypeAndName.type === FieldMetadataType.EMAILS) {
      const additionalEmailsColumn = escapeIdentifier(
        `${fieldMetadataTypeAndName.name}AdditionalEmails`,
      );

      const additionalEmailsExpression = `COALESCE(public.unaccent_immutable(TRANSLATE(${additionalEmailsColumn}::text, '[]",', '    ')), '') || ' ' || COALESCE(public.unaccent_immutable(TRANSLATE(REPLACE(${additionalEmailsColumn}::text, '@', ' '), '[]",', '    ')), '')`;

      return [...baseExpressions, additionalEmailsExpression];
    }

    return baseExpressions;
  }
  const columnName = computeColumnName(fieldMetadataTypeAndName.name);

  return [getColumnExpression(columnName, fieldMetadataTypeAndName.type)];
};

const getColumnExpression = (
  columnName: string,
  fieldType: FieldMetadataType,
): string => {
  const quotedColumnName = escapeIdentifier(columnName);

  switch (fieldType) {
    case FieldMetadataType.EMAILS:
      return `
      COALESCE(public.unaccent_immutable(${quotedColumnName}), '') || ' ' ||
      COALESCE(public.unaccent_immutable(SPLIT_PART(${quotedColumnName}, '@', 2)), '')`;

    case FieldMetadataType.PHONES:
      return `COALESCE(${quotedColumnName}, '')`;

    default:
      return `COALESCE(public.unaccent_immutable(${quotedColumnName}), '')`;
  }
};
