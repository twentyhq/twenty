import { Injectable } from '@nestjs/common';

import { MoreThan } from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { objectRecordDiffMerge } from 'src/engine/core-modules/event-emitter/utils/object-record-diff-merge';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class TimelineActivityRepository {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async upsertOne({
    name,
    objectName,
    properties,
    recordId,
    workspaceId,
    linkedObjectMetadataId,
    linkedRecordCachedName,
    linkedRecordId,
    workspaceMemberId,
  }: {
    name: string;
    properties: Partial<ObjectRecord>;
    objectName: string;
    recordId: string;
    workspaceId: string;
    workspaceMemberId?: string;
    linkedRecordCachedName?: string;
    linkedRecordId?: string;
    linkedObjectMetadataId: string | null;
  }) {
    const recentTimelineActivity = await this.findRecentTimelineActivity(
      name,
      objectName,
      recordId,
      workspaceMemberId,
      linkedRecordId,
      workspaceId,
    );

    // If the diff is empty, we don't need to insert or update an activity
    // this should be handled differently, events should not be triggered when we will use proper DB events.
    const isDiffEmpty =
      properties.diff !== null &&
      properties.diff &&
      Object.keys(properties.diff).length === 0;

    if (isDiffEmpty) {
      return;
    }

    if (recentTimelineActivity.length !== 0) {
      const newProps = objectRecordDiffMerge(
        recentTimelineActivity[0].properties,
        properties,
      );

      return this.updateTimelineActivity(
        recentTimelineActivity[0].id,
        newProps,
        workspaceMemberId,
        workspaceId,
      );
    }

    return this.insertTimelineActivity({
      name,
      properties,
      objectName,
      recordId,
      workspaceMemberId,
      linkedRecordCachedName: linkedRecordCachedName ?? '',
      linkedRecordId,
      linkedObjectMetadataId,
      workspaceId,
    });
  }

  private async findRecentTimelineActivity(
    name: string,
    objectName: string,
    recordId: string,
    workspaceMemberId: string | undefined,
    linkedRecordId: string | undefined,
    workspaceId: string,
  ) {
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
      [objectName + 'Id']: recordId,
      name: name,
      workspaceMemberId: workspaceMemberId,
      createdAt: MoreThan(tenMinutesAgo),
    };

    if (linkedRecordId) {
      whereConditions.linkedRecordId = linkedRecordId;
    } else {
      whereConditions.linkedRecordId = null;
    }

    return timelineActivityTypeORMRepository.find({
      where: whereConditions,
      order: { createdAt: 'DESC' },
      take: 1,
    });
  }

  private async updateTimelineActivity(
    id: string,
    properties: Partial<ObjectRecord>,
    workspaceMemberId: string | undefined,
    workspaceId: string,
  ) {
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

  private async insertTimelineActivity({
    linkedObjectMetadataId,
    linkedRecordCachedName,
    linkedRecordId,
    name,
    objectName,
    properties,
    recordId,
    workspaceId,
    workspaceMemberId,
  }: {
    name: string;
    properties: Partial<ObjectRecord>;
    objectName: string;
    recordId: string;
    workspaceMemberId: string | undefined;
    linkedRecordCachedName: string;
    linkedRecordId: string | undefined;
    linkedObjectMetadataId: string | null;
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

    return timelineActivityTypeORMRepository.insert({
      name: name,
      properties: properties,
      workspaceMemberId: workspaceMemberId,
      [objectName + 'Id']: recordId,
      linkedRecordCachedName: linkedRecordCachedName ?? '',
      linkedRecordId: linkedRecordId,
      linkedObjectMetadataId: linkedObjectMetadataId,
    });
  }

  public async insertTimelineActivitiesForObject(
    objectName: string,
    activities: {
      name: string;
      properties: Partial<ObjectRecord> | null;
      workspaceMemberId: string | undefined;
      recordId: string | null;
      linkedRecordCachedName: string;
      linkedRecordId: string | null | undefined;
      linkedObjectMetadataId: string | undefined;
    }[],
    workspaceId: string,
  ) {
    if (activities.length === 0) {
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
      activities.map((activity) => ({
        name: activity.name,
        properties: activity.properties,
        workspaceMemberId: activity.workspaceMemberId,
        [objectName + 'Id']: activity.recordId,
        linkedRecordCachedName: activity.linkedRecordCachedName ?? '',
        linkedRecordId: activity.linkedRecordId,
        linkedObjectMetadataId: activity.linkedObjectMetadataId,
      })),
    );
  }
}
