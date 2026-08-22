import { Injectable, Logger } from '@nestjs/common';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

type TimelineActivityMetadataIssue = {
  workspaceId: string;
  reason:
    | 'ambiguous-declared-rule'
    | 'ambiguous-resolver'
    | 'invalid-contract'
    | 'missing-type';
  action: string;
  objectUniversalIdentifier: string | null;
};

type TimelineActivityMetadataIssueDetails = Pick<
  TimelineActivityMetadataIssue,
  'action' | 'objectUniversalIdentifier'
>;

@Injectable()
export class TimelineActivityMetadataDiagnosticsService {
  private readonly logger = new Logger(
    TimelineActivityMetadataDiagnosticsService.name,
  );

  constructor(private readonly metricsService: MetricsService) {}

  reportAll({
    workspaceId,
    reason,
    issues,
  }: Pick<TimelineActivityMetadataIssue, 'workspaceId' | 'reason'> & {
    issues: TimelineActivityMetadataIssueDetails[];
  }): void {
    for (const issue of issues) {
      this.report({ workspaceId, reason, ...issue });
    }
  }

  report(issue: TimelineActivityMetadataIssue): void {
    this.logger.warn(
      `Skipping timeline activity metadata: ${JSON.stringify(issue)}`,
    );
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.TimelineActivityMetadataIssue,
      amount: 1,
      attributes: { reason: issue.reason },
    });
  }
}
