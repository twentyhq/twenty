import { type z } from 'zod';

import { webhookOperationSchema } from 'src/engine/metadata-modules/webhook/tools/schemas/webhook-operation.schema';

export const compileWebhookOperations = (
  operations: z.infer<typeof webhookOperationSchema>,
): string[] =>
  operations.map((operation) => {
    if (operation.kind === 'record') {
      return `${operation.object}.${operation.event}`;
    }

    return `metadata.${operation.metadataName}.${operation.operation}`;
  });
