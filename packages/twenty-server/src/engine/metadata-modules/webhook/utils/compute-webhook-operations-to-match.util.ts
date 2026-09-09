import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

const WILDCARD_EXCLUDED_EVENT_NAMES = [
  `workflowRun.${DatabaseEventAction.UPDATED}`,
];

export const computeWebhookOperationsToMatch = ({
  nameSingular,
  operation,
}: {
  nameSingular: string;
  operation: string;
}): string[] => {
  const exactOperation = `${nameSingular}.${operation}`;

  if (WILDCARD_EXCLUDED_EVENT_NAMES.includes(exactOperation)) {
    return [exactOperation];
  }

  return [exactOperation, `*.${operation}`, `${nameSingular}.*`, '*.*'];
};
