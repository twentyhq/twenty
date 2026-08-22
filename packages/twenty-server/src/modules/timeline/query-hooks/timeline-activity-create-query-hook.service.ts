import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { TimelineActivityTypeCacheService } from 'src/modules/timeline/services/timeline-activity-type-cache.service';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';

type TimelineActivityCreateInput = Record<string, unknown> & {
  timelineActivityTypeId?: string | null;
  linkedRecordId?: string | null;
  linkedObjectMetadataId?: string | null;
};

@Injectable()
export class TimelineActivityCreateQueryHookService {
  constructor(
    private readonly timelineActivityTypeCacheService: TimelineActivityTypeCacheService,
  ) {}

  async stampTimelineActivityTypeSnapshot({
    workspaceId,
    applicationId,
    records,
    upsert,
  }: {
    workspaceId: string;
    applicationId?: string;
    records: TimelineActivityCreateInput[];
    upsert?: boolean;
  }): Promise<TimelineActivityCreateInput[]> {
    if (upsert) {
      throw new GraphqlQueryRunnerException(
        'Timeline activities cannot be upserted because their type is immutable',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if (
      records.some(
        ({ timelineActivityTypeId }) => !isDefined(timelineActivityTypeId),
      )
    ) {
      throw new GraphqlQueryRunnerException(
        'A timeline activity type is required on creation',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if (
      records.some(
        (record) =>
          isDefined(record.linkedRecordId) !==
            isDefined(record.linkedObjectMetadataId) ||
          Object.entries(record).filter(
            ([key, value]) =>
              key.startsWith('target') &&
              key.endsWith('Id') &&
              isDefined(value),
          ).length !== 1,
      )
    ) {
      throw new GraphqlQueryRunnerException(
        'A timeline activity requires exactly one target and complete linked record metadata',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const resolvedTimelineActivityTypeById = new Map(
      await Promise.all(
        [
          ...new Set(
            records
              .map(({ timelineActivityTypeId }) => timelineActivityTypeId)
              .filter(isDefined),
          ),
        ].map(
          async (timelineActivityTypeId) =>
            [
              timelineActivityTypeId,
              await this.timelineActivityTypeCacheService.getTimelineActivityTypeByIdOrThrow(
                { workspaceId, timelineActivityTypeId },
              ),
            ] as const,
        ),
      ),
    );

    if (
      isDefined(applicationId) &&
      [...resolvedTimelineActivityTypeById.values()].some(
        (timelineActivityType) =>
          timelineActivityType.applicationId !== applicationId,
      )
    ) {
      throw new GraphqlQueryRunnerException(
        'An application can only create its own timeline activity types',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    return records.map((record) => {
      if (!isDefined(record.timelineActivityTypeId)) {
        throw new GraphqlQueryRunnerException(
          'Timeline activity type validation did not run',
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      const resolvedTimelineActivityType = resolvedTimelineActivityTypeById.get(
        record.timelineActivityTypeId,
      );

      if (!isDefined(resolvedTimelineActivityType)) {
        throw new GraphqlQueryRunnerException(
          'Timeline activity type resolution did not run',
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      return {
        ...record,
        timelineActivityTypeSnapshot: resolvedTimelineActivityType.snapshot,
      };
    });
  }

  assertTimelineActivityTypeIsNotUpdated(
    records: TimelineActivityCreateInput[],
  ): void {
    if (
      records.some(
        (record) =>
          Object.prototype.hasOwnProperty.call(
            record,
            'timelineActivityTypeId',
          ) ||
          Object.prototype.hasOwnProperty.call(
            record,
            'timelineActivityTypeSnapshot',
          ),
      )
    ) {
      throw new GraphqlQueryRunnerException(
        'A timeline activity type is immutable after creation',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }
}
