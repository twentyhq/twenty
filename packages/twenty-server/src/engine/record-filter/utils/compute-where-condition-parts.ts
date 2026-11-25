import { randomBytes } from 'crypto';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { findPostgresDefaultNullEquivalentValue } from 'src/engine/record-filter/utils/find-postgres-default-null-equivalent-value.util';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import {
  RecordFilterException,
  RecordFilterExceptionCode,
} from 'src/engine/record-filter/exceptions/record-filter.exception';
import { formatSearchTerms } from 'src/engine/core-modules/search/utils/format-search-terms';
import {
  escapeIdentifier,
  removeSqlDDLInjection,
} from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type WhereConditionParts = {
  sql: string;
  params: ObjectLiteral;
};

export const computeWhereConditionParts = ({
  operator,
  objectNameSingular,
  key,
  subFieldKey,
  value,
  fieldMetadataType,
  useDirectTableReference = false,
}: {
  operator: string;
  objectNameSingular: string;
  key: string;
  subFieldKey?: string;
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any;
  fieldMetadataType: FieldMetadataType;
  useDirectTableReference?: boolean;
}): WhereConditionParts => {
  const parameterKey = removeSqlDDLInjection(key);
  const paramSuffix = randomBytes(5).toString('hex');

  const secondParamSuffix = randomBytes(5).toString('hex');

  const fieldReference = useDirectTableReference
    ? escapeIdentifier(key)
    : `${escapeIdentifier(objectNameSingular)}.${escapeIdentifier(key)}`;

  const isDateTimeField = fieldMetadataType === FieldMetadataType.DATE_TIME;

  //TODO : Remove filter null equivalence injection once feature flag removed + null equivalence transformation added in ORM
  const nullEquivalentFieldValue = findPostgresDefaultNullEquivalentValue(
    value,
    fieldMetadataType,
    subFieldKey,
  );

  const hasNullEquivalentFieldValue = isDefined(nullEquivalentFieldValue);

  switch (operator) {
    case 'isEmptyArray':
      if (value === true) {
        return {
          sql: `(${fieldReference} = '{}' OR ${fieldReference} IS NULL)`,
          params: {},
        };
      }

      return {
        sql: `(${fieldReference} IS NOT NULL AND ${fieldReference} != '{}')`,
        params: {},
      };
    case 'eq':
      if (isDateTimeField) {
        return {
          sql: `(${fieldReference} >= :${parameterKey}${paramSuffix} AND ${fieldReference} < :${parameterKey}${paramSuffix}::timestamptz + interval '1 millisecond')${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NULL` : ''}`,
          params: { [`${parameterKey}${paramSuffix}`]: value },
        };
      }

      return {
        sql: `${fieldReference} = :${parameterKey}${paramSuffix}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NULL` : ''}`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'neq':
      if (hasNullEquivalentFieldValue) {
        return {
          sql: `(${fieldReference} != :${parameterKey}${paramSuffix} AND ${fieldReference} IS NOT NULL)`,
          params: {
            [`${parameterKey}${paramSuffix}`]: nullEquivalentFieldValue,
          },
        };
      }

      if (value === null) {
        return {
          sql: `${fieldReference} IS NOT NULL`,
          params: {},
        };
      }

      if (isDateTimeField) {
        return {
          sql: `(${fieldReference} < :${parameterKey}${paramSuffix} OR ${fieldReference} >= :${parameterKey}${paramSuffix}::timestamptz + interval '1 millisecond' OR ${fieldReference} IS NULL)`,
          params: { [`${parameterKey}${paramSuffix}`]: value },
        };
      }

      return {
        sql: `(${fieldReference} != :${parameterKey}${paramSuffix} OR ${fieldReference} IS NULL)`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'gt':
      if (isDateTimeField) {
        return {
          sql: `${fieldReference} >= :${parameterKey}${paramSuffix}::timestamptz + interval '1 millisecond'`,
          params: { [`${parameterKey}${paramSuffix}`]: value },
        };
      }

      return {
        sql: `${fieldReference} > :${parameterKey}${paramSuffix}`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'gte':
      return {
        sql: `${fieldReference} >= :${parameterKey}${paramSuffix}`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'lt':
      return {
        sql: `${fieldReference} < :${parameterKey}${paramSuffix}`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'lte':
      if (isDateTimeField) {
        return {
          sql: `${fieldReference} < :${parameterKey}${paramSuffix}::timestamptz + interval '1 millisecond'`,
          params: { [`${parameterKey}${paramSuffix}`]: value },
        };
      }

      return {
        sql: `${fieldReference} <= :${parameterKey}${paramSuffix}`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'in':
      return {
        sql: `${fieldReference} IN (:...${parameterKey}${paramSuffix})`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'is':
      return {
        sql: `${fieldReference} IS ${value === 'NULL' ? 'NULL' : 'NOT NULL'}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} = :${parameterKey}${secondParamSuffix}` : ''}`,
        params: hasNullEquivalentFieldValue
          ? {
              [`${parameterKey}${secondParamSuffix}`]: nullEquivalentFieldValue,
            }
          : {},
      };
    // Keyset cursors must mirror SQL scan order, where only real NULLs sort into the NULL block, so the
    // empty-value widening of 'is' and 'eq' would skip or duplicate rows at the block boundaries
    case 'isStrictly':
      return {
        sql: `${fieldReference} IS ${value === 'NULL' ? 'NULL' : 'NOT NULL'}`,
        params: {},
      };
    case 'gtStrict':
      return {
        sql: `${fieldReference} > :${parameterKey}${paramSuffix}`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'eqStrict':
      return {
        sql: `${fieldReference} = :${parameterKey}${paramSuffix}`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'like':
      return {
        sql: `${fieldReference}::text LIKE :${parameterKey}${paramSuffix}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NULL` : ''}`,
        params: { [`${parameterKey}${paramSuffix}`]: `${value}` },
      };
    case 'ilike':
      return {
        sql: `${fieldReference}::text ILIKE :${parameterKey}${paramSuffix}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NULL` : ''}`,
        params: { [`${parameterKey}${paramSuffix}`]: `${value}` },
      };
    case 'startsWith':
      return {
        sql: `${fieldReference}::text ^@ :${parameterKey}${paramSuffix}`,
        params: { [`${parameterKey}${paramSuffix}`]: `${value}` },
      };
    case 'endsWith':
      return {
        sql: `RIGHT(${fieldReference}::text, LENGTH(:${parameterKey}${paramSuffix})) = :${parameterKey}${paramSuffix}`,
        params: { [`${parameterKey}${paramSuffix}`]: `${value}` },
      };
    case 'contains':
      return {
        sql: `${fieldReference} @> ARRAY[:...${parameterKey}${paramSuffix}]`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'search': {
      const tsQuery = formatSearchTerms(value, 'and');

      return {
        sql: `(
          ${fieldReference} @@ to_tsquery('simple', public.unaccent_immutable(:${parameterKey}${paramSuffix}Ts)) OR
          public.unaccent_immutable(${fieldReference}::text) ILIKE public.unaccent_immutable(:${parameterKey}${paramSuffix}Like)
        )`,
        params: {
          [`${parameterKey}${paramSuffix}Ts`]: tsQuery,
          [`${parameterKey}${paramSuffix}Like`]: `%${value}%`,
        },
      };
    }
    case 'notContains':
      return {
        sql: `NOT (${fieldReference}::text[] && ARRAY[:...${parameterKey}${paramSuffix}]::text[])`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'containsAny':
      return {
        sql: `${fieldReference}::text[] && ARRAY[:...${parameterKey}${paramSuffix}]::text[]`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    case 'containsIlike':
      return {
        sql: `EXISTS (SELECT 1 FROM unnest(${fieldReference}) AS elem WHERE elem ILIKE :${parameterKey}${paramSuffix})`,
        params: { [`${parameterKey}${paramSuffix}`]: value },
      };
    default:
      throw new RecordFilterException({
        message: `Operator "${operator}" is not supported`,
        code: RecordFilterExceptionCode.UNSUPPORTED_OPERATOR,
        userFriendlyMessage: STANDARD_ERROR_MESSAGE,
      });
  }
};
