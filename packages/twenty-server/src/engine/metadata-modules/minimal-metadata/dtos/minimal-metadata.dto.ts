import { Field, Int, ObjectType } from '@nestjs/graphql';

import { MinimalObjectMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-object-metadata.dto';
import { MinimalViewDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-view.dto';

@ObjectType('MinimalMetadata')
export class MinimalMetadataDTO {
  @Field(() => [MinimalObjectMetadataDTO])
  objectMetadataItems: MinimalObjectMetadataDTO[];

  @Field(() => [MinimalViewDTO])
  views: MinimalViewDTO[];

  @Field(() => Int)
  metadataVersion: number;
}
