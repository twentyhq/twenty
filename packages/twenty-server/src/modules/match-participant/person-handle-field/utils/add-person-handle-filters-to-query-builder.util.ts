import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';

const canonicalTextSql = (expression: string) => `LOWER(TRIM(${expression}))`;

const canonicalPhoneSql = ({
  callingCode,
  number,
}: {
  callingCode: string;
  number: string;
}) =>
  `('+' || regexp_replace(COALESCE(${callingCode}, '') || COALESCE(${number}, ''), '[^0-9]', '', 'g'))`;

const canonicalLinkSql = (expression: string) =>
  `regexp_replace(regexp_replace(regexp_replace(${canonicalTextSql(expression)}, '[?#].*$', ''), '^([a-z][a-z0-9+.-]*://)?(www\\.)?', ''), '/+$', '')`;

const jsonbArrayElementsSql = (column: string) =>
  `jsonb_array_elements(CASE WHEN jsonb_typeof(${column}) = 'array' THEN ${column} ELSE '[]'::jsonb END)`;

const buildCanonicalHandleConditions = ({
  personHandleField,
  alias,
}: {
  personHandleField: PersonHandleField;
  alias: string;
}): string[] => {
  const column = (property: string) =>
    `"${alias}"."${personHandleField.name}${property}"`;

  switch (personHandleField.type) {
    case FieldMetadataType.EMAILS:
      return [
        `${canonicalTextSql(column('PrimaryEmail'))} IN (:...handles)`,
        `EXISTS (SELECT 1 FROM ${jsonbArrayElementsSql(column('AdditionalEmails'))} AS "email"("value") WHERE ${canonicalTextSql(`"email"."value" #>> '{}'`)} IN (:...handles))`,
      ];
    case FieldMetadataType.PHONES:
      return [
        `${canonicalPhoneSql({ callingCode: column('PrimaryPhoneCallingCode'), number: column('PrimaryPhoneNumber') })} IN (:...handles)`,
        `EXISTS (SELECT 1 FROM ${jsonbArrayElementsSql(column('AdditionalPhones'))} AS "phone"("value") WHERE ${canonicalPhoneSql({ callingCode: `"phone"."value" ->> 'callingCode'`, number: `"phone"."value" ->> 'number'` })} IN (:...handles))`,
      ];
    case FieldMetadataType.LINKS:
      return [
        `${canonicalLinkSql(column('PrimaryLinkUrl'))} IN (:...handles)`,
        `EXISTS (SELECT 1 FROM ${jsonbArrayElementsSql(column('SecondaryLinks'))} AS "link"("value") WHERE ${canonicalLinkSql(`"link"."value" ->> 'url'`)} IN (:...handles))`,
      ];
    case FieldMetadataType.TEXT:
      return [
        `${canonicalTextSql(`"${alias}"."${personHandleField.name}"`)} IN (:...handles)`,
      ];
  }
};

// expects handles already canonical, as participant handles on a channel with a person handle field are stored
export const addPersonHandleFiltersToQueryBuilder = ({
  queryBuilder,
  personHandleField,
  handles,
}: {
  queryBuilder: WorkspaceSelectQueryBuilder;
  personHandleField: PersonHandleField;
  handles: string[];
}): WorkspaceSelectQueryBuilder =>
  queryBuilder
    .where(
      `(${buildCanonicalHandleConditions({
        personHandleField,
        alias: queryBuilder.alias,
      }).join(' OR ')})`,
      { handles },
    )
    .withDeleted();
