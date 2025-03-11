import {
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';

import { TraceableWorkspaceEntity } from 'src/modules/traceable/standard-objects/traceable.workspace-entity';

@EventSubscriber()
export class TraceableSubscriber
  implements EntitySubscriberInterface<TraceableWorkspaceEntity>
{
  listenTo() {
    return TraceableWorkspaceEntity;
  }

  async beforeUpdate(event: UpdateEvent<TraceableWorkspaceEntity>) {
    console.log('TraceableSubscriber: beforeUpdate triggered');
    const traceable = event.entity;

    if (!traceable) {
      return;
    }

    if (
      traceable.websiteUrl !== undefined ||
      traceable.campaignName !== undefined ||
      traceable.campaignSource !== undefined
    ) {
      const websiteUrl =
        typeof traceable.websiteUrl === 'string'
          ? traceable.websiteUrl
          : traceable.websiteUrl?.url || null;

      traceable.generatedUrl = this.generateUrl(
        websiteUrl,
        traceable.campaignName,
        traceable.campaignSource,
      );
    }
  }

  private generateUrl(
    websiteUrl: string | null,
    campaignName: string,
    campaignSource: string,
  ): string {
    if (!websiteUrl) {
      return '';
    }

    try {
      const url = new URL(websiteUrl);

      url.searchParams.set('utm_campaign', campaignName || '');
      url.searchParams.set('utm_source', campaignSource || '');

      return url.toString();
    } catch (error) {
      console.error('Erro ao gerar URL:', error);

      return '';
    }
  }
}
