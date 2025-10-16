import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { type ObjectRecord } from 'twenty-shared/types';
import { In, MoreThan } from 'typeorm';

import { objectRecordDiffMerge } from 'src/engine/core-modules/event-emitter/utils/object-record-diff-merge';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type TimelineActivityPayload } from 'src/modules/timeline/types/timeline-activity-payload';

type TimelineActivityPayloadWorkspaceIdAndObjectSingularName = {
  payloads: TimelineActivityPayload[];
  workspaceId: string;
  objectSingularName: string;
};

@Injectable()
export class TimelineActivityRepository {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async upsertTimelineActivities({
    objectSingularName,
    workspaceId,
    payloads,
  }: TimelineActivityPayloadWorkspaceIdAndObjectSingularName) {
    const recentTimelineActivities = await this.findRecentTimelineActivities({
      objectSingularName,
      workspaceId,
      payloads,
    });

    const payloadsWithDiff = payloads.filter(({ properties }) => {
      const isDiffEmpty =
        properties.diff !== null &&
        properties.diff &&
        Object.keys(properties.diff).length === 0;

      return !isDiffEmpty;
    });

    const payloadsToInsert: TimelineActivityPayload[] = [];

    for (const payload of payloadsWithDiff) {
      const recentTimelineActivity = recentTimelineActivities.find(
        (timelineActivity) =>
          timelineActivity[`${objectSingularName}Id`] === payload.recordId &&
          timelineActivity.workspaceMemberId === payload.workspaceMemberId &&
          (!isDefined(payload.linkedRecordId) ||
            timelineActivity.linkedRecordId === payload.linkedRecordId) &&
          timelineActivity.name === payload.name,
      );

      if (recentTimelineActivity) {
        const mergedProperties = objectRecordDiffMerge(
          recentTimelineActivity.properties,
          payload.properties,
        );

        await this.updateTimelineActivity({
          id: recentTimelineActivity.id,
          properties: mergedProperties,
          workspaceMemberId: payload.workspaceMemberId,
          workspaceId,
        });
      } else {
        payloadsToInsert.push(payload);
      }
    }

    await this.insertTimelineActivities({
      objectSingularName,
      payloads: payloadsToInsert,
      workspaceId,
    });
  }

  private async findRecentTimelineActivities({
    objectSingularName,
    workspaceId,
    payloads,
  }: TimelineActivityPayloadWorkspaceIdAndObjectSingularName) {
    const timelineActivityTypeORMRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'timelineActivity',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const whereConditions: Record<string, unknown> = {
      [`${objectSingularName}Id`]: In(
        payloads.map((payload) => payload.recordId),
      ),
      name: In(payloads.map((payload) => payload.name)),
      workspaceMemberId: In(
        payloads.map((payload) => payload.workspaceMemberId),
      ),
      createdAt: MoreThan(tenMinutesAgo),
    };

    return await timelineActivityTypeORMRepository.find({
      where: whereConditions,
      order: { createdAt: 'DESC' },
      take: 1,
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
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'timelineActivity',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    return timelineActivityTypeORMRepository.insert(
      payloads.map((payload) => ({
        name: payload.name,
        properties: payload.properties,
        workspaceMemberId: payload.workspaceMemberId,
        [`${objectSingularName}Id`]: payload.recordId,
        linkedRecordCachedName: payload.linkedRecordCachedName ?? '',
        linkedRecordId: payload.linkedRecordId,
        linkedObjectMetadataId: payload.linkedObjectMetadataId,
      })),
    );
  }

  private async updateTimelineActivity({
    id,
    properties,
    workspaceMemberId,
    workspaceId,
  }: {
    id: string;
    properties: Partial<ObjectRecord>;
    workspaceMemberId: string | undefined;
    workspaceId: string;
  }) {
    const timelineActivityTypeORMRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'timelineActivity',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    return timelineActivityTypeORMRepository.update(id, {
      properties: properties,
      workspaceMemberId: workspaceMemberId,
    });
  }
}
