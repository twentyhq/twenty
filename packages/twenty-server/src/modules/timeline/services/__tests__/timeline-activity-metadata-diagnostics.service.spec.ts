import { TimelineActivityMetadataDiagnosticsService } from 'src/modules/timeline/services/timeline-activity-metadata-diagnostics.service';

describe('TimelineActivityMetadataDiagnosticsService', () => {
  it('rate-limits repeated metadata diagnostics from event batches', () => {
    const incrementCounterBy = jest.fn();
    const service = new TimelineActivityMetadataDiagnosticsService({
      incrementCounterBy,
    } as never);
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    const issue = {
      action: 'linked',
      objectUniversalIdentifier: '00000000-0000-4000-8000-000000000001',
      reason: 'invalid-contract' as const,
      workspaceId: '00000000-0000-4000-8000-000000000002',
    };

    service.report(issue);
    service.report(issue);

    expect(incrementCounterBy).toHaveBeenCalledTimes(1);

    now.mockReturnValue(1_300_000);
    service.report(issue);

    expect(incrementCounterBy).toHaveBeenCalledTimes(2);
    now.mockRestore();
  });
});
