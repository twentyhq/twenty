import * as Sentry from '@sentry/node';
import { handleStreamOrSingleExecutionResult, Plugin } from '@envelop/core';
import { OperationDefinitionNode, Kind } from 'graphql';

export const useTracing = (): Plugin => {
  return {
    onExecute({ args }) {
      console.log('onExecute');
      console.log(args);
      const transactionName = args.operationName || 'Anonymous Operation';
      const rootOperation = args.document.definitions.find(
        (o) => o.kind === Kind.OPERATION_DEFINITION,
      ) as OperationDefinitionNode;
      const operationType = rootOperation.operation;

      if (Sentry.isInitialized()) {
        Sentry.setTags({
          operationName: transactionName,
          operation: operationType,
        });
        Sentry.getCurrentScope().setTransactionName(transactionName);
      }

      return {
        onExecuteDone(payload) {
          return handleStreamOrSingleExecutionResult(payload, () => {});
        },
      };
    },
  };
};
