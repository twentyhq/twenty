import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { Logger } from '@nestjs/common';

import { type EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { type WorkspaceEventSinkService } from 'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service';
import {
  type UsageEventRow,
  type WorkspaceEventEnvelope,
} from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const API_REQUEST: RecordUsageInput = {
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  quantity: 1,
  unit: UsageUnit.REQUEST,
};

describe('UsageRecorderService (integration)', () => {
  let recorder: UsageRecorderService;
  let sink: WorkspaceEventSinkService;
  let ingest: jest.SpyInstance;

  const ingestedRows = (): UsageEventRow[] =>
    ingest.mock.calls
      .flatMap((call) => call[0] as WorkspaceEventEnvelope[])
      .map((envelope) => envelope.row as UsageEventRow);

  beforeAll(() => {
    // Real collaborators from the booted app: the buffer, config, cache,
    // envelope builder and emitter all run for real. Only the event sink,
    // which would otherwise write to ClickHouse, is stubbed at the I/O edge.
    recorder = new UsageRecorderService(
      getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter'),
      getAppProviderByClassName<EventLogEmitterService>(
        'EventLogEmitterService',
      ),
      getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService'),
      getAppProviderByClassName<TwentyConfigService>('TwentyConfigService'),
    );
    sink = getAppProviderByClassName<WorkspaceEventSinkService>(
      'WorkspaceEventSinkService',
    );
  });

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    jest.spyOn(sink, 'isEnabled').mockReturnValue(true);
    ingest = jest.spyOn(sink, 'ingest').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('dispatches one aggregated batch per workspace on shutdown', async () => {
    recorder.accumulate('ws-1', API_REQUEST);
    recorder.accumulate('ws-1', API_REQUEST);
    recorder.accumulate('ws-2', API_REQUEST);

    await recorder.onModuleDestroy();

    expect(ingest).toHaveBeenCalledTimes(2);
    expect(ingestedRows()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ workspaceId: 'ws-1', quantity: 2 }),
        expect.objectContaining({ workspaceId: 'ws-2', quantity: 1 }),
      ]),
    );
  });

  it('re-buffers the counts of a failed dispatch instead of dropping them', async () => {
    ingest.mockRejectedValueOnce(new Error('clickhouse unreachable'));
    recorder.accumulate('ws-1', API_REQUEST);

    await recorder.onModuleDestroy();

    recorder.accumulate('ws-1', API_REQUEST);
    await recorder.onModuleDestroy();

    expect(ingestedRows()).toContainEqual(
      expect.objectContaining({ workspaceId: 'ws-1', quantity: 2 }),
    );
  });

  it('does not dispatch anything when usage monitoring is off', async () => {
    jest.spyOn(sink, 'isEnabled').mockReturnValue(false);
    recorder.accumulate('ws-1', API_REQUEST);

    await recorder.onModuleDestroy();

    expect(ingest).not.toHaveBeenCalled();
  });

  it('leaves the billing period out when billing is disabled', async () => {
    recorder.accumulate('ws-1', API_REQUEST);

    await recorder.onModuleDestroy();

    expect(ingestedRows()[0].periodStart).toBeUndefined();
  });
});
