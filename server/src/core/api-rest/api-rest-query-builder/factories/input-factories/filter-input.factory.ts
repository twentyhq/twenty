import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import {
  checkFields,
  getFieldType,
} from 'src/core/api-rest/utils/metadata-query.utils';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

enum FILTER_COMPARATORS {
  eq = 'eq',
  neq = 'neq',
  in = 'in',
  is = 'is',
  gt = 'gt',
  gte = 'gte',
  lt = 'lt',
  lte = 'lte',
  startsWith = 'startsWith',
  like = 'like',
  ilike = 'ilike',
}

enum CONJUNCTIONS {
  or = 'or',
  and = 'and',
  not = 'not',
}

@Injectable()
export class FilterInputFactory {
  create(request: Request, objectMetadata) {
    let filterQuery = request.query.filter;

    if (typeof filterQuery !== 'string') {
      return {};
    }

    this.checkFilterQuery(filterQuery);

    filterQuery = this.addDefaultConjunctionIfMissing(filterQuery);

    return this.parseStringFilter(
      filterQuery,
      objectMetadata.objectMetadataItem,
    );
  }

  addDefaultConjunctionIfMissing(filterQuery) {
    if (!(filterQuery.includes('(') && filterQuery.includes(')'))) {
      return `and(${filterQuery})`;
    }

    return filterQuery;
  }

  checkFilterQuery(filterQuery) {
    const countOpenedBrackets = (filterQuery.match(/\(/g) || []).length;

    const countClosedBrackets = (filterQuery.match(/\)/g) || []).length;

    const diff = countOpenedBrackets - countClosedBrackets;

    if (diff !== 0) {
      const hint =
        diff > 0
          ? `${diff} close bracket${diff > 1 ? 's are' : ' is'}`
          : `${Math.abs(diff)} open bracket${
              Math.abs(diff) > 1 ? 's are' : ' is'
            }`;
      throw new BadRequestException(
        `'filter' invalid. ${hint} missing in the query`,
      );
    }

    return;
  }

  parseFilterQueryContent(filterQuery) {
    let bracketsCounter = 0;

    let doubleQuoteClosed = true;

    let singleQuoteClosed = true;

    let parenthesisCounter = 0;

    const predicates: string[] = [];

    let currentPredicates = '';

    for (const c of filterQuery) {
      if (c === ')') parenthesisCounter--;

      if (c === '[') bracketsCounter++;

      if (c === ']') bracketsCounter--;

      if (c === '"') doubleQuoteClosed = !doubleQuoteClosed;

      if (c === "'") singleQuoteClosed = !singleQuoteClosed;

      if (
        c === ',' &&
        parenthesisCounter === 1 &&
        bracketsCounter === 0 &&
        doubleQuoteClosed &&
        singleQuoteClosed
      ) {
        predicates.push(currentPredicates);

        currentPredicates = '';

        continue;
      }

      if (parenthesisCounter >= 1) currentPredicates += c;

      if (c === '(') parenthesisCounter++;
    }

    predicates.push(currentPredicates);

    return predicates;
  }

  parseSimpleFilterString(filterString: string): {
    fields: string[];
    comparator: string;
    value: string;
  } {
    if (!filterString.match(`^(.+)\\[(.+)\\]:(.+)$`)) {
      throw new BadRequestException(
        `'filter' invalid for '${filterString}'. eg: price[gte]:10`,
      );
    }
    let fields = '';
    let comparator = '';
    let value = '';
    let previousC = '';
    let fillFields = true;
    let fillComparator = false;
    let fillValue = false;
    for (const c of filterString) {
      if (c === '[') {
        fillFields = false;
      }
      if (previousC === '[' && !comparator.length) {
        fillComparator = true;
      }
      if (c === ']') {
        fillComparator = false;
      }
      if (previousC === ']' && c === ':' && !value.length) {
        fillValue = true;
        continue;
      }
      if (fillFields) {
        fields += c;
      }
      if (fillComparator) {
        comparator += c;
      }
      if (fillValue) {
        value += c;
      }
      previousC = c;
    }
    if (!Object.keys(FILTER_COMPARATORS).includes(comparator)) {
      throw new BadRequestException(
        `'filter' invalid for '${filterString}', comparator ${comparator} not in ${Object.keys(
          FILTER_COMPARATORS,
        ).join(',')}`,
      );
    }
    return { fields: fields.split('.'), comparator, value };
  }

  formatFieldValue(value, fieldType?, comparator?) {
    if (comparator === 'in') {
      if (value[0] !== '[' || value[value.length - 1] !== ']') {
        throw new BadRequestException(
          `'filter' invalid for 'in' operator. Received '${value}' but array value expected eg: 'field[in]:[value_1,value_2]'`,
        );
      }
      const stringValues = value.substring(1, value.length - 1);
      return stringValues
        .split(',')
        .map((value) => this.formatFieldValue(value, fieldType));
    }
    if (comparator === 'is') {
      return value;
    }
    if (fieldType === FieldMetadataType.NUMBER) {
      return parseInt(value);
    }
    if (fieldType === FieldMetadataType.BOOLEAN) {
      return value.toLowerCase() === 'true';
    }
    if (
      (value[0] === '"' || value[0] === "'") &&
      (value.charAt(value.length - 1) === '"' ||
        value.charAt(value.length - 1) === "'")
    ) {
      return value.substring(1, value.length - 1);
    }
    return value;
  }

  parseStringFilter(filterQuery, objectMetadataItem) {
    const result = {};
    const match = filterQuery.match(
      `^(${Object.values(CONJUNCTIONS).join('|')})((.+))$`,
    );
    if (match) {
      const conjunction = match[1];
      const subResult = this.parseFilterQueryContent(filterQuery).map((elem) =>
        this.parseStringFilter(elem, objectMetadataItem),
      );
      if (conjunction === CONJUNCTIONS.not) {
        if (subResult.length > 1) {
          throw new BadRequestException(
            `'filter' invalid. 'not' conjunction should contain only 1 condition. eg: not(field[eq]:1)`,
          );
        }
        result[conjunction] = subResult[0];
      } else {
        result[conjunction] = subResult;
      }
      return result;
    }
    const { fields, comparator, value } =
      this.parseSimpleFilterString(filterQuery);
    checkFields(objectMetadataItem, fields);
    const fieldType = getFieldType(objectMetadataItem, fields[0]);
    const formattedValue = this.formatFieldValue(value, fieldType, comparator);
    return fields.reverse().reduce(
      (acc, currentValue) => {
        return { [currentValue]: acc };
      },
      { [comparator]: formattedValue },
    );
  }
}
