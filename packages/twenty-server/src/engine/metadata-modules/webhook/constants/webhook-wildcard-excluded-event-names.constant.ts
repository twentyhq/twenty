// One event per workflow step transition: only explicit subscribers get it, wildcards would flood fan-out
export const WEBHOOK_WILDCARD_EXCLUDED_EVENT_NAMES = ['workflowRun.updated'];
