import {
  checkFields,
  getFieldType,
} from 'src/core/api-rest/utils/metadata-query.utils';

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

export const addDefaultConjunctionIfMissing = (filterQuery) => {
  if (!(filterQuery.includes('(') && filterQuery.includes(')'))) {
    return `and(${filterQuery})`;
  }
  return filterQuery;
};

export const checkFilterQuery = (filterQuery) => {
  const countOpenedBrackets = (filterQuery.match(/\(/g) || []).length;
  const countClosedBrackets = (filterQuery.match(/\)/g) || []).length;
  const diff = countOpenedBrackets - countClosedBrackets;
  if (diff !== 0) {
    const hint =
      diff > 0
        ? `${diff} open bracket${diff > 1 ? 's are' : ' is'}`
        : `${Math.abs(diff)} close bracket${
            Math.abs(diff) > 1 ? 's are' : ' is'
          }`;
    throw Error(`'filter' invalid. ${hint} missing in the query`);
  }
  return;
};

export const parseFilterQueryContent = (filterQuery) => {
  let bracketsCounter = 0;
  let parenthesisCounter = 0;
  const predicates: string[] = [];
  let currentPredicates = '';
  for (const c of filterQuery) {
    if (c === '(') {
      parenthesisCounter++;
      if (parenthesisCounter === 1) continue;
    }
    if (c === ')') {
      parenthesisCounter--;
      if (parenthesisCounter === 0) continue;
    }
    if (c === '[') {
      bracketsCounter++;
    }
    if (c === ']') {
      bracketsCounter--;
    }
    if (c === ',' && parenthesisCounter === 1 && bracketsCounter === 0) {
      predicates.push(currentPredicates);
      currentPredicates = '';
      continue;
    }
    if (parenthesisCounter >= 1) currentPredicates += c;
  }
  if (currentPredicates.length) {
    predicates.push(currentPredicates);
  }
  return predicates;
};

export const parseSimpleFilterString = (
  filterString: string,
): {
  fields: string[];
  comparator: string;
  value: string;
} => {
  if (
    !filterString.match(
      `^(.+)\\[(${Object.keys(FILTER_COMPARATORS).join('|')})\\]:(.+)$`,
    )
  ) {
    throw Error(`'filter' invalid for '${filterString}'. eg: price[gte]:10`);
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
    throw Error(
      `'filter' invalid for '${filterString}', comparator ${comparator} not in ${Object.keys(
        FILTER_COMPARATORS,
      ).join(',')}`,
    );
  }
  return { fields: fields.split('.'), comparator, value };
};

export const formatFieldValue = (value, fieldType?, comparator?) => {
  if (comparator === 'in') {
    if (value[0] !== '[' || value[value.length - 1] !== ']') {
      throw Error(
        `'filter' invalid for 'in' operator. Received '${value}' but array value expected eg: 'field[in]:[value_1,value_2]'`,
      );
    }
    const stringValues = value.substring(1, value.length - 1);
    return stringValues
      .split(',')
      .map((value) => formatFieldValue(value, fieldType));
  }
  if (comparator === 'is') {
    return value;
  }
  if (fieldType === 'NUMBER') {
    return parseInt(value);
  }
  if (fieldType === 'BOOLEAN') {
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
};

export const parseStringFilter = (filterQuery, objectMetadataItem) => {
  const result = {};
  const match = filterQuery.match(
    `^(${Object.values(CONJUNCTIONS).join('|')})((.+))$`,
  );
  if (match) {
    const conjunction = match[1];
    const subResult = parseFilterQueryContent(filterQuery).map((elem) =>
      parseStringFilter(elem, objectMetadataItem),
    );
    if (conjunction === CONJUNCTIONS.not) {
      if (subResult.length > 1) {
        throw Error(
          `'filter' invalid. 'not' conjunction should contain only 1 condition. eg: not(field[eq]:1)`,
        );
      }
      result[conjunction] = subResult[0];
    } else {
      result[conjunction] = subResult;
    }
    return result;
  }
  const { fields, comparator, value } = parseSimpleFilterString(filterQuery);
  checkFields(objectMetadataItem, fields);
  const fieldType = getFieldType(objectMetadataItem, fields[0]);
  const formattedValue = formatFieldValue(value, fieldType, comparator);
  return fields.reverse().reduce(
    (acc, currentValue) => {
      return { [currentValue]: acc };
    },
    { [comparator]: formattedValue },
  );
};
