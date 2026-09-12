import { computeWebhookOperationsToMatch } from 'src/engine/metadata-modules/webhook/utils/compute-webhook-operations-to-match.util';

describe('computeWebhookOperationsToMatch', () => {
  it('matches exact and wildcard operations for a regular object event', () => {
    expect(
      computeWebhookOperationsToMatch({
        nameSingular: 'company',
        operation: 'updated',
      }),
    ).toEqual(['company.updated', '*.updated', 'company.*', '*.*']);
  });

  it('matches only the exact operation for workflowRun.updated', () => {
    expect(
      computeWebhookOperationsToMatch({
        nameSingular: 'workflowRun',
        operation: 'updated',
      }),
    ).toEqual(['workflowRun.updated']);
  });

  it('keeps wildcard matching for other workflowRun operations', () => {
    expect(
      computeWebhookOperationsToMatch({
        nameSingular: 'workflowRun',
        operation: 'created',
      }),
    ).toEqual(['workflowRun.created', '*.created', 'workflowRun.*', '*.*']);
  });
});
