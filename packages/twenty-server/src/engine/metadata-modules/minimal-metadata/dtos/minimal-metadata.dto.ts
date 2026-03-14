import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

import { MinimalObjectMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-object-metadata.dto';
import { MinimalViewDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-view.dto';

@ObjectType('MinimalMetadata')
export class MinimalMetadataDTO {
  @Field(() => [MinimalObjectMetadataDTO])
  objectMetadataItems: MinimalObjectMetadataDTO[];

  @Field(() => [MinimalViewDTO])
  views: MinimalViewDTO[];

  @Field(() => GraphQLJSON)
  collectionHashes: Record<string, string>;
}
