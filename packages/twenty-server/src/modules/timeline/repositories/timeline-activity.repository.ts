import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThan } from 'typeorm';

import { objectRecordDiffMerge } from 'src/engine/core-modules/event-emitter/utils/object-record-diff-merge';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
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
      const recentTimelineActivities = await this.findRecentTimelineActivities({
        objectSingularName,
        workspaceId,
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
        await this.getTimelineActivityPropertyName(objectSingularName);

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
          recentTimelineActivitiesByMergeKey.set(mergeKey, [timelineActivity]);
        }
      }

      for (const payload of payloads) {
        const recentTimelineActivity = buildTimelineActivityMergeKeyCandidates({
          recordId: payload.recordId,
          workspaceMemberId: payload.workspaceMemberId,
          timelineActivityTypeId: payload.timelineActivityTypeId,
          timelineActivityTypeSnapshot: payload.timelineActivityTypeSnapshot,
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
        this.updateTimelineActivities({ merges: mergesToApply, workspaceId }),
        this.insertTimelineActivities({
          objectSingularName,
          payloads: payloadsToInsert,
          workspaceId,
        }),
      ]);
    }, authContext);
  }

  private async findRecentTimelineActivities({
    objectSingularName,
    workspaceId,
    payloads,
  }: TimelineActivityPayloadWorkspaceIdAndObjectSingularName) {
    const timelineActivityTypeORMRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'timelineActivity',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const timelineActivityPropertyName =
      await this.getTimelineActivityPropertyName(objectSingularName);

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
    return await timelineActivityTypeORMRepository.find({
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
    objectSingularName,
    workspaceId,
    payloads,
  }: TimelineActivityPayloadWorkspaceIdAndObjectSingularName) {
    if (payloads.length === 0) {
      return;
    }

    const timelineActivityTypeORMRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'timelineActivity',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const timelineActivityPropertyName =
      await this.getTimelineActivityPropertyName(objectSingularName);

    return timelineActivityTypeORMRepository.insert(
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
    merges,
    workspaceId,
  }: {
    merges: {
      id: string;
      properties: Partial<ObjectRecord>;
      workspaceMemberId: string | undefined;
      timelineActivityTypeSnapshot?: TimelineActivityPayload['timelineActivityTypeSnapshot'];
    }[];
    workspaceId: string;
  }) {
    if (merges.length === 0) {
      return;
    }

    const timelineActivityTypeORMRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'timelineActivity',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    await Promise.all(
      merges.map(
        ({ id, properties, workspaceMemberId, timelineActivityTypeSnapshot }) =>
          timelineActivityTypeORMRepository.update(id, {
            properties,
            workspaceMemberId,
            ...(isDefined(timelineActivityTypeSnapshot) && {
              timelineActivityTypeSnapshot,
            }),
          }),
      ),
    );
  }

  private async getTimelineActivityPropertyName(objectSingularName: string) {
    return `${buildTimelineActivityRelatedMorphFieldMetadataName(objectSingularName)}Id`;
  }
}
