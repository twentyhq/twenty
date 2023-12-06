import { BadRequestException } from '@nestjs/common';

enum FilterComparators {
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

  // Not handled rigth now
  // regex = 'regex',
  // iregex = 'iregex',
}

export const parseBaseFilter = (
  baseFilter: string,
): {
  fields: string[];
  comparator: string;
  value: string;
} => {
  if (!baseFilter.match(`^(.+)\\[(.+)\\]:(.+)$`)) {
    throw new BadRequestException(
      `'filter' invalid for '${baseFilter}'. eg: price[gte]:10`,
    );
  }
  let fields = '';
  let comparator = '';
  let value = '';
  let previousC = '';
  let fillFields = true;
  let fillComparator = false;
  let fillValue = false;

  for (const c of baseFilter) {
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
  if (!Object.keys(FilterComparators).includes(comparator)) {
    throw new BadRequestException(
      `'filter' invalid for '${baseFilter}', comparator ${comparator} not in ${Object.keys(
        FilterComparators,
      ).join(',')}`,
    );
  }

  return { fields: fields.split('.'), comparator, value };
};
