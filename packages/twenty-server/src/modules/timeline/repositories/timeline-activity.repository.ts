import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThan } from 'typeorm';

import { objectRecordDiffMerge } from 'src/engine/core-modules/event-emitter/utils/object-record-diff-merge';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type TimelineActivityPayload } from 'src/modules/timeline/types/timeline-activity-payload';
import { buildTimelineActivityRelatedMorphFieldMetadataName } from 'src/modules/timeline/utils/timeline-activity-related-morph-field-metadata-name-builder.util';

// Compaction identity is structural: the legacy name is a display field and
// must never decide which rows are the same event. An unset value is null on a
// stored row and undefined on a payload, so both normalize to the same key part.
const buildMergeKey = ({
  recordId,
  workspaceMemberId,
  sourceObjectMetadataId,
  linkedRecordId,
}: {
  recordId: string;
  workspaceMemberId: string | null | undefined;
  sourceObjectMetadataId: string | null | undefined;
  linkedRecordId: string | null | undefined;
}): string =>
  [recordId, workspaceMemberId, sourceObjectMetadataId, linkedRecordId]
    .map((keyPart) => keyPart ?? null)
    .join('|');

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

      const payloadsToUpsert = payloads.flatMap(
        ({ properties, ...payload }) => {
          const { diff } = properties;
          const hasDiff = isDefined(diff) && Object.keys(diff).length > 0;

          if (payload.action !== 'updated') {
            return [{ ...payload, properties: {} }];
          }

          return hasDiff ? [{ ...payload, properties: { diff } }] : [];
        },
      );

      const payloadsToInsert: TimelineActivityPayloadWorkspaceIdAndObjectSingularName['payloads'] =
        [];
      const mergesToApply: {
        id: string;
        properties: Partial<ObjectRecord>;
        workspaceMemberId: string | undefined;
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
        const mergeKey = buildMergeKey({
          recordId: timelineActivity[timelineActivityPropertyName],
          workspaceMemberId: timelineActivity.workspaceMemberId,
          sourceObjectMetadataId: timelineActivity.sourceObjectMetadataId,
          linkedRecordId: timelineActivity.linkedRecordId,
        });

        const bucket = recentTimelineActivitiesByMergeKey.get(mergeKey);

        if (isDefined(bucket)) {
          bucket.push(timelineActivity);
        } else {
          recentTimelineActivitiesByMergeKey.set(mergeKey, [timelineActivity]);
        }
      }

      for (const payload of payloadsToUpsert) {
        // Only successive updates compact. Link transitions are discrete facts:
        // folding an unlink into an earlier link would show the opposite event.
        const recentTimelineActivity =
          payload.action === 'updated'
            ? recentTimelineActivitiesByMergeKey.get(
                buildMergeKey({
                  recordId: payload.recordId,
                  workspaceMemberId: payload.workspaceMemberId,
                  sourceObjectMetadataId: payload.sourceObjectMetadataId,
                  linkedRecordId: payload.linkedRecordId,
                }),
              )?.[0]
            : undefined;

        if (isDefined(recentTimelineActivity)) {
          mergesToApply.push({
            id: recentTimelineActivity.id,
            properties: objectRecordDiffMerge(
              recentTimelineActivity.properties,
              payload.properties,
            ),
            workspaceMemberId: payload.workspaceMemberId,
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
      action: 'updated',
      sourceObjectMetadataId: In(
        payloads.map((payload) => payload.sourceObjectMetadataId),
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
      where: whereConditions,
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
        name: payload.name,
        action: payload.action,
        sourceObjectMetadataId: payload.sourceObjectMetadataId,
        ruleRelationFieldMetadataId: payload.ruleRelationFieldMetadataId,
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
      merges.map(({ id, properties, workspaceMemberId }) =>
        timelineActivityTypeORMRepository.update(id, {
          properties,
          workspaceMemberId,
        }),
      ),
    );
  }

  private async getTimelineActivityPropertyName(objectSingularName: string) {
    return `${buildTimelineActivityRelatedMorphFieldMetadataName(objectSingularName)}Id`;
  }
}
