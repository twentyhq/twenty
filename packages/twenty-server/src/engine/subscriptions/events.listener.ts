import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PubSub } from 'graphql-subscriptions';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';

@Injectable()
export class EventsListener {
  constructor(@Inject('PUB_SUB') private readonly pubSub: PubSub) {}

  @OnEvent('*.created')
  async handleCreatedEvent(payload: ObjectRecordCreateEvent<any>) {
    this.pubSub.publish('created', { created: payload });
  }

  @OnEvent('*.updated')
  async handleUpdatedEvent(payload: ObjectRecordUpdateEvent<any>) {
    this.pubSub.publish('updated', { updated: payload });
  }

  @OnEvent('*.deleted')
  async handleDeletedEvent(payload: ObjectRecordDeleteEvent<any>) {
    this.pubSub.publish('deleted', { deleted: payload });
  }
}
