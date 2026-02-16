import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { ObjectRecordEventPropertiesDTO } from 'src/engine/subscriptions/dtos/object-record-event-properties.dto';

export enum MetadataEventAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

registerEnumType(MetadataEventAction, {
  name: 'MetadataEventAction',
  description: 'Metadata Event Action',
});

@ObjectType('MetadataEvent')
export class MetadataEventDTO {
  @Field(() => MetadataEventAction)
  type: MetadataEventAction;

  @Field(() => String)
  metadataName: string;

  @Field(() => String)
  recordId: string;

  @Field(() => ObjectRecordEventPropertiesDTO)
  properties: ObjectRecordEventPropertiesDTO;
}
