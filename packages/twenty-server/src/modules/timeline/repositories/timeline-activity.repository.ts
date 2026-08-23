import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThan, type ObjectLiteral } from 'typeorm';

import { objectRecordDiffMerge } from 'src/engine/core-modules/event-emitter/utils/object-record-diff-merge';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/global-workspace-datasource/types/workspace-transaction-scope.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type TimelineActivityPayload } from 'src/modules/timeline/types/timeline-activity-payload';
import {
  buildTimelineActivityMergeKey,
  buildTimelineActivityMergeKeyCandidates,
} from 'src/modules/timeline/utils/build-timeline-activity-merge-key.util';
import { buildTimelineActivityRelatedMorphFieldMetadataName } from 'src/modules/timeline/utils/timeline-activity-related-morph-field-metadata-name-builder.util';

type TimelineActivityPayloadWorkspaceIdAndObjectSingularName = {
  payloads: (Omit<TimelineActivityPayload, 'properties'> & {
    properties: Pick<TimelineActivityPayload['properties'], 'diff'>;
  })[];
  workspaceId: string;
  objectSingularName: string;
};

const ACQUIRE_TIMELINE_ACTIVITY_MERGE_LOCK = `SELECT pg_advisory_xact_lock(hashtextextended("lockName", 0))
   FROM unnest($1::text[]) WITH ORDINALITY AS "locks"("lockName", "ordinality")
   ORDER BY "ordinality"`;

@Injectable()
export class TimelineActivityRepository {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async upsertTimelineActivities({
    objectSingularName,
    workspaceId,
    payloads,
  }: TimelineActivityPayloadWorkspaceIdAndObjectSingularName) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.globalWorkspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          await this.acquireMergeLocks({
            transactionScope,
            objectSingularName,
            workspaceId,
            payloads,
          });

          const timelineActivityRepository =
            transactionScope.getRepository<ObjectLiteral>('timelineActivity', {
              shouldBypassPermissionChecks: true,
            });

          const recentTimelineActivities =
            await this.findRecentTimelineActivities({
              timelineActivityRepository,
              objectSingularName,
              payloads,
            });

          const payloadsToInsert: TimelineActivityPayloadWorkspaceIdAndObjectSingularName['payloads'] =
            [];
          const mergesToApply: {
            id: string;
            properties: Partial<ObjectRecord>;
            workspaceMemberId: string | undefined;
            timelineActivityTypeSnapshot?: TimelineActivityPayload['timelineActivityTypeSnapshot'];
          }[] = [];

          const timelineActivityPropertyName =
            this.getTimelineActivityPropertyName(objectSingularName);

          // Bucketed once so matching a payload stays constant time: the recent
          // window is scoped to this batch but is not capped in size.
          const recentTimelineActivitiesByMergeKey = new Map<
            string,
            (typeof recentTimelineActivities)[number][]
          >();

          for (const timelineActivity of recentTimelineActivities) {
            const mergeKey = buildTimelineActivityMergeKey({
              recordId: timelineActivity[timelineActivityPropertyName],
              workspaceMemberId: timelineActivity.workspaceMemberId,
              timelineActivityTypeId: timelineActivity.timelineActivityTypeId,
              timelineActivityTypeSnapshot:
                timelineActivity.timelineActivityTypeSnapshot,
            });

            const bucket = recentTimelineActivitiesByMergeKey.get(mergeKey);

            if (isDefined(bucket)) {
              bucket.push(timelineActivity);
            } else {
              recentTimelineActivitiesByMergeKey.set(mergeKey, [
                timelineActivity,
              ]);
            }
          }

          for (const payload of payloads) {
            const recentTimelineActivity =
              buildTimelineActivityMergeKeyCandidates({
                recordId: payload.recordId,
                workspaceMemberId: payload.workspaceMemberId,
                timelineActivityTypeId: payload.timelineActivityTypeId,
                timelineActivityTypeSnapshot:
                  payload.timelineActivityTypeSnapshot,
              })
                .flatMap(
                  (mergeKey) =>
                    recentTimelineActivitiesByMergeKey.get(mergeKey) ?? [],
                )
                .find(
                  (timelineActivity) =>
                    !isDefined(payload.linkedRecordId) ||
                    timelineActivity.linkedRecordId === payload.linkedRecordId,
                );

            if (isDefined(recentTimelineActivity)) {
              mergesToApply.push({
                id: recentTimelineActivity.id,
                properties: objectRecordDiffMerge(
                  recentTimelineActivity.properties,
                  payload.properties,
                ),
                workspaceMemberId: payload.workspaceMemberId,
                ...(!isDefined(
                  recentTimelineActivity.timelineActivityTypeSnapshot,
                ) && {
                  timelineActivityTypeSnapshot:
                    payload.timelineActivityTypeSnapshot,
                }),
              });
            } else {
              payloadsToInsert.push(payload);
            }
          }

          await Promise.all([
            this.updateTimelineActivities({
              timelineActivityRepository,
              merges: mergesToApply,
            }),
            this.insertTimelineActivities({
              timelineActivityRepository,
              objectSingularName,
              payloads: payloadsToInsert,
            }),
          ]);
        },
      );
    }, authContext);
  }

  private async acquireMergeLocks({
    transactionScope,
    objectSingularName,
    workspaceId,
    payloads,
  }: {
    transactionScope: WorkspaceTransactionScope;
    objectSingularName: string;
    workspaceId: string;
    payloads: TimelineActivityPayloadWorkspaceIdAndObjectSingularName['payloads'];
  }) {
    const lockNames = [
      ...new Set(
        payloads.map((payload) =>
          JSON.stringify([
            'timeline-activity-merge',
            workspaceId,
            objectSingularName,
            payload.recordId,
            payload.workspaceMemberId ?? null,
            payload.timelineActivityTypeId,
          ]),
        ),
      ),
    ].sort();

    await transactionScope.executeRawQuery(
      ACQUIRE_TIMELINE_ACTIVITY_MERGE_LOCK,
      [lockNames],
    );
  }

  private async findRecentTimelineActivities({
    timelineActivityRepository,
    objectSingularName,
    payloads,
  }: {
    timelineActivityRepository: WorkspaceRepository<ObjectLiteral>;
    objectSingularName: string;
    payloads: TimelineActivityPayloadWorkspaceIdAndObjectSingularName['payloads'];
  }) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const timelineActivityPropertyName =
      this.getTimelineActivityPropertyName(objectSingularName);

    const whereConditions: Record<string, unknown> = {
      [timelineActivityPropertyName]: In(
        payloads.map((payload) => payload.recordId),
      ),
      workspaceMemberId: In(
        payloads.map((payload) => payload.workspaceMemberId || null),
      ),
      createdAt: MoreThan(tenMinutesAgo),
    };

    // The where clause is already scoped to this batch payloads and to the merge
    // window, so every candidate is fetched: taking a single row would let only
    // one payload of a multi record batch merge.
    return await timelineActivityRepository.find({
      where: {
        ...whereConditions,
        timelineActivityTypeId: In(
          payloads.map((payload) => payload.timelineActivityTypeId),
        ),
      },
      order: { createdAt: 'DESC' },
    });
  }

  public async insertTimelineActivities({
    timelineActivityRepository,
    objectSingularName,
    payloads,
  }: {
    timelineActivityRepository: WorkspaceRepository<ObjectLiteral>;
    objectSingularName: string;
    payloads: TimelineActivityPayloadWorkspaceIdAndObjectSingularName['payloads'];
  }) {
    if (payloads.length === 0) {
      return;
    }

    const timelineActivityPropertyName =
      this.getTimelineActivityPropertyName(objectSingularName);

    return timelineActivityRepository.insert(
      payloads.map((payload) => ({
        happensAt: payload.happensAt,
        timelineActivityTypeId: payload.timelineActivityTypeId,
        timelineActivityTypeSnapshot: payload.timelineActivityTypeSnapshot,
        properties: payload.properties,
        workspaceMemberId: payload.workspaceMemberId,
        [timelineActivityPropertyName]: payload.recordId,
        linkedRecordCachedName: payload.linkedRecordCachedName ?? '',
        linkedRecordId: payload.linkedRecordId,
        linkedObjectMetadataId: payload.linkedObjectMetadataId,
      })),
    );
  }

  private async updateTimelineActivities({
    timelineActivityRepository,
    merges,
  }: {
    timelineActivityRepository: WorkspaceRepository<ObjectLiteral>;
    merges: {
      id: string;
      properties: Partial<ObjectRecord>;
      workspaceMemberId: string | undefined;
      timelineActivityTypeSnapshot?: TimelineActivityPayload['timelineActivityTypeSnapshot'];
    }[];
  }) {
    if (merges.length === 0) {
      return;
    }

    await Promise.all(
      merges.map(
        ({ id, properties, workspaceMemberId, timelineActivityTypeSnapshot }) =>
          timelineActivityRepository.update(id, {
            properties,
            workspaceMemberId,
            ...(isDefined(timelineActivityTypeSnapshot) && {
              timelineActivityTypeSnapshot,
            }),
          }),
      ),
    );
  }

  private getTimelineActivityPropertyName(objectSingularName: string) {
    return `${buildTimelineActivityRelatedMorphFieldMetadataName(objectSingularName)}Id`;
  }
}
