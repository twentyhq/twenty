import { GraphQLError, Kind, OperationDefinitionNode, print } from 'graphql';
import * as express from 'express';
import {
  getDocumentString,
  handleStreamOrSingleExecutionResult,
  OnExecuteDoneHookResultOnNextHook,
  Plugin,
} from '@envelop/core';

import { ExceptionHandlerUser } from 'src/integrations/exception-handler/interfaces/exception-handler-user.interface';

import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';
import { TokenService } from 'src/core/auth/services/token.service';
import {
  convertExceptionToGraphQLError,
  filterException,
} from 'src/filters/utils/global-exception-handler.util';

export type ExceptionHandlerPluginOptions = {
  /**
   * The driver to use to handle exceptions.
   */
  exceptionHandlerService: ExceptionHandlerService;
  /**
   * The token service to use to get the token from the request.
   */
  tokenService: TokenService;
  /**
   * The key of the event id in the error's extension. `null` to disable.
   * @default exceptionEventId
   */
  eventIdKey?: string | null;
};

export const useExceptionHandler = <
  PluginContext extends Record<string, any> = object,
>(
  options: ExceptionHandlerPluginOptions,
): Plugin<PluginContext> => {
  const exceptionHandlerService = options.exceptionHandlerService;
  const tokenService = options.tokenService;
  const eventIdKey = options.eventIdKey === null ? null : 'exceptionEventId';

  function addEventId(
    err: GraphQLError,
    eventId: string | undefined | null,
  ): GraphQLError {
    if (eventIdKey !== null && eventId) {
      err.extensions[eventIdKey] = eventId;
    }

    return err;
  }

  return {
    async onExecute({ args }) {
      const rootOperation = args.document.definitions.find(
        (o) => o.kind === Kind.OPERATION_DEFINITION,
      ) as OperationDefinitionNode;
      const operationType = rootOperation.operation;
      const document = getDocumentString(args.document, print);
      const request = args.contextValue.req as express.Request;
      const opName =
        args.operationName ||
        rootOperation.name?.value ||
        'Anonymous Operation';
      let user: ExceptionHandlerUser | undefined;

      if (tokenService.isTokenPresent(request)) {
        try {
          const data = await tokenService.validateToken(request);

          user = {
            id: data.user?.id,
            email: data.user?.email,
          };
        } catch {}
      }

      return {
        onExecuteDone(payload) {
          const handleResult: OnExecuteDoneHookResultOnNextHook<object> = ({
            result,
            setResult,
          }) => {
            if (result.errors && result.errors.length > 0) {
              const exceptions = result.errors.reduce<{
                filtered: any[];
                unfiltered: any[];
              }>(
                (acc, err) => {
                  // Filter out exceptions that we don't want to be captured by exception handler
                  if (filterException(err?.originalError ?? err)) {
                    acc.filtered.push(err);
                  } else {
                    acc.unfiltered.push(err);
                  }

                  return acc;
                },
                {
                  filtered: [],
                  unfiltered: [],
                },
              );

              if (exceptions.unfiltered.length > 0) {
                const eventIds = exceptionHandlerService.captureExceptions(
                  exceptions.unfiltered,
                  {
                    operation: {
                      name: opName,
                      type: operationType,
                    },
                    document,
                    user,
                  },
                );

                exceptions.unfiltered.map((err, i) =>
                  addEventId(err, eventIds?.[i]),
                );
              }

              const concatenatedErrors = [
                ...exceptions.filtered,
                ...exceptions.unfiltered,
              ];
              const errors = concatenatedErrors.map((err) => {
                // Properly convert errors to GraphQLErrors
                const graphQLError = convertExceptionToGraphQLError(
                  err.originalError,
                );

                return graphQLError;
              });

              setResult({
                ...result,
                errors,
              });
            }
          };

          return handleStreamOrSingleExecutionResult(payload, handleResult);
        },
      };
    },
  };
};
