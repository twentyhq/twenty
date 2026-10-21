import { Field, ObjectType } from '@nestjs/graphql';

import { CollectionHashDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/collection-hash.dto';
import { MinimalObjectMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-object-metadata.dto';
import { MinimalRoleDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-role.dto';
import { MinimalViewDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-view.dto';

@ObjectType('MinimalMetadata')
export class MinimalMetadataDTO {
  @Field(() => [MinimalObjectMetadataDTO])
  objectMetadataItems: MinimalObjectMetadataDTO[];

  @Field(() => [MinimalViewDTO])
  views: MinimalViewDTO[];

  @Field(() => [MinimalRoleDTO])
  roles: MinimalRoleDTO[];

  @Field(() => [CollectionHashDTO])
  collectionHashes: CollectionHashDTO[];
}
