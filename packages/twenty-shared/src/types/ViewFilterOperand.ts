export enum ViewFilterOperand {
  IS = 'IS',
  IS_NOT_NULL = 'IS_NOT_NULL',
  IS_NOT = 'IS_NOT',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL', // TODO: we could change this to 'lessThanOrEqual' for consistency but it would require a migration
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL', // TODO: we could change this to 'greaterThanOrEqual' for consistency but it would require a migration
  IS_BEFORE = 'IS_BEFORE',
  IS_AFTER = 'IS_AFTER', // TODO: migrate this to IS_AFTER_OR_EQUAL
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  IS_EMPTY = 'IS_EMPTY',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
  IS_RELATIVE = 'IS_RELATIVE',
  IS_IN_PAST = 'IS_IN_PAST',
  IS_IN_FUTURE = 'IS_IN_FUTURE',
  IS_TODAY = 'IS_TODAY',
  VECTOR_SEARCH = 'VECTOR_SEARCH',
}
