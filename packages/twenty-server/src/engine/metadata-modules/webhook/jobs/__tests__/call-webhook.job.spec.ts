import { AxiosError, type AxiosResponse } from 'axios';

import { type EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { type MessageQueueJobRetryContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { CallWebhookJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { type WebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { WebhookDeliveryRetryException } from 'src/engine/metadata-modules/webhook/webhook-delivery-retry.exception';

const buildWebhookJobData = (targetUrl: string): WebhookJobData => ({
  eventId: `event-for-${targetUrl}`,
  targetUrl,
  eventName: 'person.created',
  workspaceId: 'workspace-id',
  webhookId: 'webhook-id',
  eventDate: new Date('2026-01-01T00:00:00Z'),
  objectMetadata: { id: 'object-metadata-id', nameSingular: 'person' },
  record: { id: 'record-id' },
});

const buildStreamResponse = (status: number) => ({
  status,
  data: { destroy: jest.fn() },
  request: { destroy: jest.fn() },
});

const buildHttpError = (status: number) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_RESPONSE,
    undefined,
    { destroy: jest.fn() },
    {
      ...buildStreamResponse(status),
      statusText: '',
      headers: {},
      config: {},
    } as unknown as AxiosResponse,
  );

describe('CallWebhookJob', () => {
  let postMock: jest.Mock;
  let jobContext: MessageQueueJobRetryContext<WebhookJobData[]>;
  let callWebhookJob: CallWebhookJob;

  beforeEach(() => {
    postMock = jest.fn();
    jobContext = {
      jobId: 'job-id',
      retryLimit: 5,
      updateData: jest.fn(),
    };

    callWebhookJob = new CallWebhookJob(
      {
        dispatch: jest.fn().mockResolvedValue(undefined),
      } as unknown as EventLogEmitterService,
      {
        incrementCounterForEvent: jest.fn(),
      } as unknown as MetricsService,
      {
        getHttpClient: () => ({ post: postMock }),
      } as unknown as SecureHttpClientService,
    );
  });

  it('should not retry when every call succeeds', async () => {
    postMock.mockResolvedValue(buildStreamResponse(200));

    await expect(
      callWebhookJob.handle(
        [
          buildWebhookJobData('https://a.example.com'),
          buildWebhookJobData('https://b.example.com'),
        ],
        jobContext,
      ),
    ).resolves.toBeUndefined();

    expect(jobContext.updateData).not.toHaveBeenCalled();
  });

  it('should retry only the calls that failed with a 5xx', async () => {
    const deliveredEvent = buildWebhookJobData('https://a.example.com');
    const failedEvent = buildWebhookJobData('https://b.example.com');

    postMock.mockImplementation((url: string) =>
      url === failedEvent.targetUrl
        ? Promise.reject(buildHttpError(500))
        : Promise.resolve(buildStreamResponse(200)),
    );

    await expect(
      callWebhookJob.handle([deliveredEvent, failedEvent], jobContext),
    ).rejects.toThrow(WebhookDeliveryRetryException);

    expect(jobContext.updateData).toHaveBeenCalledWith([failedEvent]);
  });

  it.each([408, 429])('should retry on a %s response', async (status) => {
    const event = buildWebhookJobData('https://a.example.com');

    postMock.mockRejectedValue(buildHttpError(status));

    await expect(callWebhookJob.handle([event], jobContext)).rejects.toThrow(
      WebhookDeliveryRetryException,
    );

    expect(jobContext.updateData).toHaveBeenCalledWith([event]);
  });

  it('should retry on a timeout', async () => {
    const event = buildWebhookJobData('https://a.example.com');

    postMock.mockRejectedValue(
      new AxiosError('timeout of 5000ms exceeded', AxiosError.ECONNABORTED),
    );

    await expect(callWebhookJob.handle([event], jobContext)).rejects.toThrow(
      WebhookDeliveryRetryException,
    );

    expect(jobContext.updateData).toHaveBeenCalledWith([event]);
  });

  it('should not retry on a 404', async () => {
    postMock.mockRejectedValue(buildHttpError(404));

    await expect(
      callWebhookJob.handle(
        [buildWebhookJobData('https://a.example.com')],
        jobContext,
      ),
    ).resolves.toBeUndefined();

    expect(jobContext.updateData).not.toHaveBeenCalled();
  });

  it('should not retry when the target resolves to an internal IP address', async () => {
    postMock.mockRejectedValue(
      new AxiosError('Request to internal IP address 10.0.0.1 is not allowed.'),
    );

    await expect(
      callWebhookJob.handle(
        [buildWebhookJobData('https://a.example.com')],
        jobContext,
      ),
    ).resolves.toBeUndefined();

    expect(jobContext.updateData).not.toHaveBeenCalled();
  });
});
