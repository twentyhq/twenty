import { Field, ObjectType } from '@nestjs/graphql';

import { CollectionHashDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/collection-hash.dto';
import { MinimalObjectMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-object-metadata.dto';
import { MinimalViewDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-view.dto';
import { ObjectViewsHashDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/object-views-hash.dto';

@ObjectType('MinimalMetadata')
export class MinimalMetadataDTO {
  @Field(() => [MinimalObjectMetadataDTO])
  objectMetadataItems: MinimalObjectMetadataDTO[];

  @Field(() => [MinimalViewDTO])
  views: MinimalViewDTO[];

  @Field(() => [ObjectViewsHashDTO])
  objectViewsHashes: ObjectViewsHashDTO[];

  @Field(() => [CollectionHashDTO])
  collectionHashes: CollectionHashDTO[];
}
