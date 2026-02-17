import { Field, ObjectType } from '@nestjs/graphql';

import { ObjectRecordEventPropertiesDTO } from 'src/engine/subscriptions/dtos/object-record-event-properties.dto';
import { MetadataEventAction } from 'src/engine/subscriptions/enums/metadata-event-action.enum';

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
