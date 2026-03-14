import { Field, Int, ObjectType } from '@nestjs/graphql';

import { PresentationObjectMetadataDTO } from 'src/engine/metadata-modules/presentation-metadata/dtos/presentation-object-metadata.dto';
import { PresentationViewDTO } from 'src/engine/metadata-modules/presentation-metadata/dtos/presentation-view.dto';

@ObjectType('PresentationMetadata')
export class PresentationMetadataDTO {
  @Field(() => [PresentationObjectMetadataDTO])
  objectMetadataItems: PresentationObjectMetadataDTO[];

  @Field(() => [PresentationViewDTO])
  views: PresentationViewDTO[];

  @Field(() => Int)
  metadataVersion: number;
}
