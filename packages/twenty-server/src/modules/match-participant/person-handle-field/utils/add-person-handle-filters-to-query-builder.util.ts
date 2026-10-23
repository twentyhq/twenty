import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';

// TRIM only strips spaces; the canonical form strips any leading and trailing whitespace
const trimmedSql = (expression: string) =>
  `regexp_replace(${expression}, '^\\s+|\\s+$', '', 'g')`;

const canonicalTextSql = (expression: string) =>
  `LOWER(${trimmedSql(expression)})`;

const canonicalPhoneSql = ({
  callingCode,
  number,
}: {
  callingCode: string;
  number: string;
}) =>
  `('+' || regexp_replace(COALESCE(${callingCode}, '') || COALESCE(${number}, ''), '[^0-9]', '', 'g'))`;

const canonicalLinkSql = (expression: string) => {
  const withoutFragment = `regexp_replace(${trimmedSql(expression)}, '#.*$', '')`;
  const location = `regexp_replace(regexp_replace(LOWER(split_part(${withoutFragment}, '?', 1)), '^([a-z][a-z0-9+.-]*://)?(www\\.)?', ''), '/+$', '')`;
  const query = `COALESCE(substring(${withoutFragment} from '\\?(.*)$'), '')`;

  return `(${location} || CASE WHEN ${query} <> '' THEN '?' || ${query} ELSE '' END)`;
};

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
        `${canonicalTextSql(column('PrimaryEmail'))} = ANY(:handles)`,
        `EXISTS (SELECT 1 FROM ${jsonbArrayElementsSql(column('AdditionalEmails'))} AS "email"("value") WHERE ${canonicalTextSql(`"email"."value" #>> '{}'`)} = ANY(:handles))`,
      ];
    case FieldMetadataType.PHONES:
      return [
        `${canonicalPhoneSql({ callingCode: column('PrimaryPhoneCallingCode'), number: column('PrimaryPhoneNumber') })} = ANY(:handles)`,
        `EXISTS (SELECT 1 FROM ${jsonbArrayElementsSql(column('AdditionalPhones'))} AS "phone"("value") WHERE ${canonicalPhoneSql({ callingCode: `"phone"."value" ->> 'callingCode'`, number: `"phone"."value" ->> 'number'` })} = ANY(:handles))`,
      ];
    case FieldMetadataType.LINKS:
      return [
        `${canonicalLinkSql(column('PrimaryLinkUrl'))} = ANY(:handles)`,
        `EXISTS (SELECT 1 FROM ${jsonbArrayElementsSql(column('SecondaryLinks'))} AS "link"("value") WHERE ${canonicalLinkSql(`"link"."value" ->> 'url'`)} = ANY(:handles))`,
      ];
    case FieldMetadataType.TEXT:
      return [
        `${canonicalTextSql(`"${alias}"."${personHandleField.name}"`)} = ANY(:handles)`,
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
