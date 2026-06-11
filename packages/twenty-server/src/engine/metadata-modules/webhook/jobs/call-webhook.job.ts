import crypto from 'crypto';

import { ensureAbsoluteUrl } from 'twenty-shared/utils';

import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { WEBHOOK_RESPONSE_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/webhook/webhook-response';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type WebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJob {
  constructor(
    private readonly eventLogEmitterService: EventLogEmitterService,
    private readonly metricsService: MetricsService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  private generateSignature(
    payload: Record<string, unknown>,
    secret: string,
    timestamp: string,
  ): string {
    return crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}:${JSON.stringify(payload)}`)
      .digest('hex');
  }

  @Process(CallWebhookJob.name)
  async handle(webhookJobEvents: WebhookJobData[]): Promise<void> {
    await Promise.all(
      webhookJobEvents.map(
        async (webhookJobEvent) => await this.callWebhook(webhookJobEvent),
      ),
    );
  }

  private async callWebhook(data: WebhookJobData): Promise<void> {
    const commonPayload = {
      url: data.targetUrl,
      webhookId: data.webhookId,
      eventName: data.eventName,
    };
    const eventLogContext = this.eventLogEmitterService.createContext({
      workspaceId: data.workspaceId,
    });

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const { secret, ...payloadWithoutSecret } = data;

      if (secret) {
        headers['X-Twenty-Webhook-Timestamp'] = Date.now().toString();
        headers['X-Twenty-Webhook-Signature'] = this.generateSignature(
          payloadWithoutSecret,
          secret,
          headers['X-Twenty-Webhook-Timestamp'],
        );
        headers['X-Twenty-Webhook-Nonce'] = crypto
          .randomBytes(16)
          .toString('hex');
      }

      const axiosClient = this.secureHttpClientService.getHttpClient(
        undefined,
        {
          workspaceId: data.workspaceId,
          userId: data.userId,
          source: 'webhook',
        },
      );

      const response = await axiosClient.post(
        ensureAbsoluteUrl(data.targetUrl),
        payloadWithoutSecret,
        {
          headers,
          timeout: 5_000,
        },
      );

      const success = response.status >= 200 && response.status < 300;

      void eventLogContext.insertWorkspaceEvent(WEBHOOK_RESPONSE_EVENT, {
        status: response.status,
        success,
        ...commonPayload,
      });

      void this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobWebhookCallCompleted,
        shouldStoreInCache: false,
      });
    } catch (err) {
      const isSSRFBlocked =
        err instanceof Error &&
        err.message.includes('internal IP address') &&
        err.message.includes('is not allowed');

      void eventLogContext.insertWorkspaceEvent(WEBHOOK_RESPONSE_EVENT, {
        success: false,
        ...commonPayload,
        ...(err.response && { status: err.response.status }),
        ...(isSSRFBlocked && {
          error: 'Webhook URL resolves to a private/internal IP address',
        }),
      });
    }
  }
}
