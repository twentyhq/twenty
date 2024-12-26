import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';

import crypto from 'crypto';

import { AnalyticsService } from 'src/engine/core-modules/analytics/analytics.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type CallWebhookJobData = {
  targetUrl: string;
  eventName: string;
  objectMetadata: { id: string; nameSingular: string };
  workspaceId: string;
  webhookId: string;
  eventDate: Date;
  record: any;
  updatedFields?: string[];
  secret?: string;
};

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJob {
  private readonly logger = new Logger(CallWebhookJob.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  private generateSignature(
    payload: CallWebhookJobData,
    secret: string,
    timestamp: string,
  ): string {
    return crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}:${JSON.stringify(payload)}`)
      .digest('hex');
  }

  @Process(CallWebhookJob.name)
  async handle(data: CallWebhookJobData): Promise<void> {
    const commonPayload = {
      url: data.targetUrl,
      webhookId: data.webhookId,
      eventName: data.eventName,
    };

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

      const response = await this.httpService.axiosRef.post(
        data.targetUrl,
        payloadWithoutSecret,
        { headers },
      );

      const success = response.status >= 200 && response.status < 300;
      const eventInput = {
        action: 'webhook.response',
        payload: {
          status: response.status,
          success,
          ...commonPayload,
        },
      };

      this.analyticsService.create(eventInput, 'webhook', data.workspaceId);
    } catch (err) {
      const eventInput = {
        action: 'webhook.response',
        payload: {
          success: false,
          ...commonPayload,
          ...(err.response && { status: err.response.status }),
        },
      };

      this.analyticsService.create(eventInput, 'webhook', data.workspaceId);
      this.logger.error(
        `Error calling webhook on targetUrl '${data.targetUrl}': ${err}`,
      );
    }
  }
}
