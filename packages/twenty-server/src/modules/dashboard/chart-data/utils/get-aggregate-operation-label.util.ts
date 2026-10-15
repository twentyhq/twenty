import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { AggregateOperations } from 'twenty-shared/types';

export const getAggregateOperationLabel = (
  operation: AggregateOperations,
): MessageDescriptor => {
  switch (operation) {
    case AggregateOperations.MIN:
      return msg`Min`;
    case AggregateOperations.MAX:
      return msg`Max`;
    case AggregateOperations.AVG:
      return msg`Average`;
    case AggregateOperations.SUM:
      return msg`Sum`;
    case AggregateOperations.COUNT:
      return msg`Count all`;
    case AggregateOperations.COUNT_EMPTY:
      return msg`Count empty`;
    case AggregateOperations.COUNT_NOT_EMPTY:
      return msg`Count not empty`;
    case AggregateOperations.COUNT_UNIQUE_VALUES:
      return msg`Count unique values`;
    case AggregateOperations.PERCENTAGE_EMPTY:
      return msg`Percent empty`;
    case AggregateOperations.PERCENTAGE_NOT_EMPTY:
      return msg`Percent not empty`;
    case AggregateOperations.COUNT_TRUE:
      return msg`Count true`;
    case AggregateOperations.COUNT_FALSE:
      return msg`Count false`;
    default:
      return msg`Count`;
  }
};
