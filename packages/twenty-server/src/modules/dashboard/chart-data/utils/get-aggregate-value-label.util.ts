import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type AggregateOperations } from 'twenty-shared/types';

import { getAggregateOperationLabel } from 'src/modules/dashboard/chart-data/utils/get-aggregate-operation-label.util';

export const getAggregateValueLabel = ({
  aggregateOperation,
  aggregateFieldLabel,
  i18n,
}: {
  aggregateOperation: AggregateOperations;
  aggregateFieldLabel: string;
  i18n: I18n;
}): string => {
  const operationLabel = i18n._(getAggregateOperationLabel(aggregateOperation));

  return i18n._(msg`${operationLabel} of ${aggregateFieldLabel}`);
};
