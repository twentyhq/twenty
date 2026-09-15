import { isDefined } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { type TimelineActivityMutationInput } from 'src/modules/timeline/query-hooks/types/timeline-activity-mutation-input.type';
import { type ResolvedTimelineActivityType } from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';

const throwInvalidTimelineActivityInput = (message: string): never => {
  throw new GraphqlQueryRunnerException(
    message,
    GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
    { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
  );
};

export const sanitizeApplicationTimelineActivityInput = ({
  now = new Date(),
  record,
}: {
  now?: Date;
  record: TimelineActivityMutationInput;
}): TimelineActivityMutationInput => {
  const happensAt = isDefined(record.happensAt)
    ? new Date(record.happensAt)
    : undefined;

  return {
    ...record,
    workspaceMemberId: null,
    ...(isDefined(happensAt) &&
      !Number.isNaN(happensAt.getTime()) &&
      happensAt > now && { happensAt: now.toISOString() }),
  };
};

export const assertTimelineActivityCreationInputIsValid = ({
  records,
  upsert,
}: {
  records: TimelineActivityMutationInput[];
  upsert?: boolean;
}): void => {
  if (upsert) {
    throwInvalidTimelineActivityInput(
      'Timeline activities cannot be upserted because their type is immutable',
    );
  }

  if (
    records.some(
      ({ timelineActivityTypeId }) => !isDefined(timelineActivityTypeId),
    )
  ) {
    throwInvalidTimelineActivityInput(
      'A timeline activity type is required on creation',
    );
  }

  if (
    records.some(
      (record) =>
        isDefined(record.linkedRecordId) !==
          isDefined(record.linkedObjectMetadataId) ||
        Object.entries(record).filter(
          ([key, value]) => key.startsWith('target') && isDefined(value),
        ).length !== 1,
    )
  ) {
    throwInvalidTimelineActivityInput(
      'A timeline activity requires exactly one target and complete linked record metadata',
    );
  }
};

export const stampTimelineActivityTypeSnapshots = ({
  applicationId,
  now = new Date(),
  records,
  resolvedTimelineActivityTypeById,
}: {
  applicationId?: string;
  now?: Date;
  records: TimelineActivityMutationInput[];
  resolvedTimelineActivityTypeById: ReadonlyMap<
    string,
    ResolvedTimelineActivityType
  >;
}): TimelineActivityMutationInput[] => {
  if (
    isDefined(applicationId) &&
    [...resolvedTimelineActivityTypeById.values()].some(
      (timelineActivityType) =>
        timelineActivityType.applicationId !== applicationId,
    )
  ) {
    throwInvalidTimelineActivityInput(
      'An application can only create its own timeline activity types',
    );
  }

  return records.map((record) => {
    if (!isDefined(record.timelineActivityTypeId)) {
      return throwInvalidTimelineActivityInput(
        'Timeline activity type validation did not run',
      );
    }

    const resolvedTimelineActivityType = resolvedTimelineActivityTypeById.get(
      record.timelineActivityTypeId,
    );

    if (!isDefined(resolvedTimelineActivityType)) {
      return throwInvalidTimelineActivityInput(
        'Timeline activity type resolution did not run',
      );
    }

    const stampedRecord = {
      ...record,
      timelineActivityTypeSnapshot: resolvedTimelineActivityType.snapshot,
    };

    return isDefined(applicationId)
      ? sanitizeApplicationTimelineActivityInput({
          now,
          record: stampedRecord,
        })
      : stampedRecord;
  });
};

export const assertTimelineActivityTypeIsNotUpdated = (
  records: TimelineActivityMutationInput[],
): void => {
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
    throwInvalidTimelineActivityInput(
      'A timeline activity type is immutable after creation',
    );
  }
};
