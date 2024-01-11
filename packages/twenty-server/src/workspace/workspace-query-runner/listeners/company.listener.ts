import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/workspace/workspace-query-runner/events/object-record-create.event';

@Injectable()
export class CompanyListener {
  @OnEvent('company.created', { async: true })
  handleCreatedEvent(payload: ObjectRecordCreateEvent) {
    console.log(payload);
  }
}
