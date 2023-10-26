import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

@EventSubscriber()
export class ObjectMetadataSubscriber
  implements EntitySubscriberInterface<ObjectMetadata>
{
  listenTo(): any {
    return ObjectMetadata;
  }

  afterInsert(event: InsertEvent<ObjectMetadata>): Promise<any> | void {
    console.log('afterInsertEvent ********************', event.entity);
    return;
  }
}
