import { type Messages, setupI18n } from '@lingui/core';
import { compileMessage } from '@lingui/message-utils/compileMessage';
import { msg } from '@lingui/core/macro';
import { AggregateOperations } from 'twenty-shared/types';

import { getAggregateOperationLabel } from 'src/modules/dashboard/chart-data/utils/get-aggregate-operation-label.util';
import { getAggregateValueLabel } from 'src/modules/dashboard/chart-data/utils/get-aggregate-value-label.util';

// Same message and placeholder names as the util, so this is the id Lingui extracts
const operationLabel = '';
const aggregateFieldLabel = '';
const VALUE_LABEL_MESSAGE_ID = msg`${operationLabel} of ${aggregateFieldLabel}`
  .id;

const buildI18n = (locale: string, messages: Messages) => {
  const i18n = setupI18n();

  i18n.setMessagesCompiler(compileMessage);
  i18n.load(locale, messages);
  i18n.activate(locale);

  return i18n;
};

describe('getAggregateValueLabel', () => {
  it('should translate the operation and compose the label with the locale template', () => {
    const i18n = buildI18n('fr-FR', {
      [getAggregateOperationLabel(AggregateOperations.SUM).id]: 'Somme',
      [VALUE_LABEL_MESSAGE_ID]: '{operationLabel} de {aggregateFieldLabel}',
    });

    const result = getAggregateValueLabel({
      aggregateOperation: AggregateOperations.SUM,
      aggregateFieldLabel: 'Montant',
      i18n,
    });

    expect(result).toBe('Somme de Montant');
  });

  it('should keep the source messages when the locale has no translation', () => {
    const i18n = buildI18n('fr-FR', {});

    const result = getAggregateValueLabel({
      aggregateOperation: AggregateOperations.COUNT,
      aggregateFieldLabel: 'Amount',
      i18n,
    });

    expect(result).toBe('Count all of Amount');
  });
});
