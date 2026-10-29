// Stored as the trigger name, and the key the builder translates it by
export const WORKFLOW_TRIGGER_DEFAULT_NAMES = {
  CRON: 'On a schedule',
  WEBHOOK: 'Webhook',
  DATABASE_EVENT: {
    created: 'Record is created',
    updated: 'Record is updated',
    deleted: 'Record is deleted',
    upserted: 'Record is created or updated',
  },
} as const;
