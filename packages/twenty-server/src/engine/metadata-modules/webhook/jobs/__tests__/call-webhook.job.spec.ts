import { Test } from '@nestjs/testing';

import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { type MessageQueueJobRetryContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { CallWebhookJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { type WebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { WebhookException } from 'src/engine/metadata-modules/webhook/webhook.exception';

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

const buildStreamResponse = (status: number): AxiosResponse => ({
  status,
  statusText: '',
  headers: {},
  config: { headers: new AxiosHeaders() },
  data: { destroy: jest.fn() },
  request: { destroy: jest.fn() },
});

const buildHttpError = (status: number) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_RESPONSE,
    undefined,
    { destroy: jest.fn() },
    buildStreamResponse(status),
  );

describe('CallWebhookJob', () => {
  let postMock: jest.Mock;
  let jobContext: MessageQueueJobRetryContext<WebhookJobData[]>;
  let callWebhookJob: CallWebhookJob;

  beforeEach(async () => {
    postMock = jest.fn();
    jobContext = {
      jobId: 'job-id',
      retryLimit: 5,
      updateData: jest.fn(),
    };

    const testingModule = await Test.createTestingModule({
      providers: [
        CallWebhookJob,
        {
          provide: EventLogEmitterService,
          useValue: { dispatch: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: MetricsService,
          useValue: { incrementCounterForEvent: jest.fn() },
        },
        {
          provide: SecureHttpClientService,
          useValue: { getHttpClient: () => ({ post: postMock }) },
        },
      ],
    }).compile();

    callWebhookJob = testingModule.get(CallWebhookJob);
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
    ).rejects.toThrow(WebhookException);

    expect(jobContext.updateData).toHaveBeenCalledTimes(1);
    expect(jobContext.updateData).toHaveBeenCalledWith([failedEvent]);
  });

  it.each([408, 429])('should retry on a %s response', async (status) => {
    const event = buildWebhookJobData('https://a.example.com');

    postMock.mockRejectedValue(buildHttpError(status));

    await expect(callWebhookJob.handle([event], jobContext)).rejects.toThrow(
      WebhookException,
    );

    expect(jobContext.updateData).toHaveBeenCalledTimes(1);
    expect(jobContext.updateData).toHaveBeenCalledWith([event]);
  });

  it('should retry on a timeout', async () => {
    const event = buildWebhookJobData('https://a.example.com');

    postMock.mockRejectedValue(
      new AxiosError('timeout of 5000ms exceeded', AxiosError.ECONNABORTED),
    );

    await expect(callWebhookJob.handle([event], jobContext)).rejects.toThrow(
      WebhookException,
    );

    expect(jobContext.updateData).toHaveBeenCalledTimes(1);
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
