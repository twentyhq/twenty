import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';

@Injectable()
export class ChargeEventListener {
  private readonly logger = new Logger('ChargeEventListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @OnDatabaseBatchEvent('charge', DatabaseEventAction.UPDATED)
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

    // Manipluate charges exemple
    //!!Exemple only, remove this after implementation

    // Get charge repository
    // const chargeRepository =
    //   await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
    //     workspaceId,
    //     'charge',
    //   );

    // Get all charges
    // const charges = await Promise.all(
    //   events.map((event) =>
    //     chargeRepository.findOneByOrFail({
    //       id: event.recordId,
    //     }),
    //   ),
    // );

    // Update all charges
    // const updateBacthes = await Promise.all(
    //   charges.map((charge) =>
    //     chargeRepository.update(charge.id, {
    //       price: (charge?.price ?? 0) + 1,
    //     }),
    //   ),
    // );

    // Get updated charges
    // const updatedCharges = await chargeRepository.find();

    return;
  }
}
