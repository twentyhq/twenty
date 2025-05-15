import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'class-validator';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { TraceableWorkspaceEntity } from 'src/modules/traceable/standard-objects/traceable.workspace-entity';

@Injectable()
export class TraceableEventListener {
  private readonly logger = new Logger('TraceableEventListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @OnDatabaseBatchEvent('traceable', DatabaseEventAction.UPDATED)
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

    const traceableEntities = await Promise.all(
      events.map((event) =>
        traceableRepository.findOneByOrFail({
          id: event.recordId,
        }),
      ),
    );

    await Promise.all(
      traceableEntities.map(async (traceable) => {
        if (isDefined(traceable?.websiteUrl)) {
          const { generatedUrl, url } = this.generateTraceableUrl(
            traceable,
            workspaceId,
          );

          traceable.generatedUrl = generatedUrl;
          traceable.url = url;

          return traceableRepository.save(traceable);
        }
      }),
    );

    return;
  }

  private generateTraceableUrl(
    traceable: TraceableWorkspaceEntity,
    workspaceId: string,
  ): {
    generatedUrl: TraceableWorkspaceEntity['generatedUrl'];
    url: TraceableWorkspaceEntity['generatedUrl'];
  } {
    const websiteUrl = this.normalizeUrl(
      traceable.websiteUrl?.primaryLinkUrl as string,
    ) as string;
    const campaignName = traceable.campaignName || '';
    const campaignSource = traceable.campaignSource || '';
    const meansOfCommunication = traceable.meansOfCommunication || '';
    const keyworkd = traceable.keyword || '';
    const campaignContent = traceable.campaignContent || '';

    const generatedUrl = `${websiteUrl}/?utm_campaign=${encodeURIComponent(campaignName)}&utm_source=${encodeURIComponent(
      campaignSource,
    )}&utm_medium=${encodeURIComponent(
      meansOfCommunication,
    )}&utm_term=${encodeURIComponent(keyworkd)}&utm_content=${encodeURIComponent(campaignContent)}`;

    const baseUrl = this.twentyConfigService.get('SERVER_URL');

    const redirectUrl = `${baseUrl}/traceable/r/${workspaceId}/${traceable.id}`;

    return {
      generatedUrl: {
        primaryLinkLabel: generatedUrl,
        primaryLinkUrl: generatedUrl,
        secondaryLinks: null,
      },
      url: {
        primaryLinkLabel: redirectUrl,
        primaryLinkUrl: redirectUrl,
        secondaryLinks: null,
      },
    };
  }

  normalizeUrl(url: string): string {
    if (!url) throw new BadRequestException('URL is required');

    try {
      // Add https:// if no protocol exists
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      const parsedUrl = new URL(url);

      // Remove trailing slash from pathname
      parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');

      // Sort query parameters alphabetically
      if (parsedUrl.search) {
        const params = Array.from(parsedUrl.searchParams.entries());

        params.sort((a, b) => a[0].localeCompare(b[0]));
        parsedUrl.search = '';
        params.forEach(([key, value]) => {
          parsedUrl.searchParams.append(key, value);
        });
      }

      // Remove default ports (e.g., :443 for HTTPS)
      if (parsedUrl.port === '443' && parsedUrl.protocol === 'https:') {
        parsedUrl.port = '';
      } else if (parsedUrl.port === '80' && parsedUrl.protocol === 'http:') {
        parsedUrl.port = '';
      }

      // Return normalized URL without trailing slash
      return parsedUrl.toString().replace(/\/$/, '');
    } catch (error) {
      throw new BadRequestException('Invalid URL provided');
    }
  }
}
