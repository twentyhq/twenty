import { Injectable, Logger } from '@nestjs/common';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { LinkLogsWorkspaceEntity } from 'src/modules/linklogs/standard-objects/linklog.workspace-entity';
import { TraceableWorkspaceEntity } from 'src/modules/traceable/standard-objects/traceable.workspace-entity';

@Injectable()
export class TraceableEventListener {
  private readonly logger = new Logger('TraceableEventListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  // @OnDatabaseBatchEvent('traceable', DatabaseEventAction.UPDATED)
  async handleChargeCreateEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    const { workspaceId, name: eventName, events } = payload;

    if (!workspaceId || !eventName) {
      this.logger.error(
        `Missing workspaceId or eventName in payload ${JSON.stringify(
          payload,
        )}`,
      );

      return;
    }

    const traceableRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TraceableWorkspaceEntity>(
        workspaceId,
        'traceable',
      );

    const linklogsRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<LinkLogsWorkspaceEntity>(
        workspaceId,
        'linkLogs',
      );

    const traceableEntities = await Promise.all(
      events.map((event) =>
        traceableRepository.findOneByOrFail({
          id: event.recordId,
        }),
      ),
    );

    await Promise.all(
      traceableEntities.map(async (traceable) => {
        const generatedUrl = this.generateTraceableUrl(traceable);

        traceable.generatedUrl = generatedUrl;

        await traceableRepository.save(traceable);

        const existingLog = await linklogsRepository.findOneBy({
          linkId: traceable.id,
        });

        if (existingLog) {
          existingLog.userAgent = `${traceable.id}`;
          existingLog.utmSource = traceable.campaignSource || '';
          existingLog.utmMedium = 'cpc';
          existingLog.utmCampaign = traceable.campaignName || '';
          existingLog.linkName = traceable.linkName || '';
          existingLog.uv = 10;
          await linklogsRepository.save(existingLog);
        } else {
          const traceableAccessLog = linklogsRepository.create({
            userAgent: `${traceable.id}`,
            linkId: traceable.id,
            utmSource: traceable.campaignSource || '',
            utmMedium: 'cpc',
            utmCampaign: traceable.campaignName || '',
            userIp: null,
            linkName: traceable.linkName || '',
            uv: 10,
          });

          await linklogsRepository.save(traceableAccessLog);
        }

        return traceable;
      }),
    );

    await traceableRepository.find();

    return;
  }

  private generateTraceableUrl(
    traceable: TraceableWorkspaceEntity,
  ): TraceableWorkspaceEntity['generatedUrl'] {
    const linkName = traceable.linkName || '';
    const campaignSource = traceable.campaignSource || '';
    const campaignName = traceable.campaignName || '';

    const url = `${linkName}/?utm_source=${encodeURIComponent(
      campaignSource,
    )}&utm_medium=cpc&utm_campaign=${encodeURIComponent(campaignName)}`;

    return url;
  }
}
