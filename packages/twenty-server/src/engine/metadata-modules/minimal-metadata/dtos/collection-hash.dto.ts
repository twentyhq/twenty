import { Field, ObjectType } from '@nestjs/graphql';

import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

@ObjectType('CollectionHash')
export class CollectionHashDTO {
  @Field(() => ALL_METADATA_NAME)
  collectionName: AllMetadataName;

  @Field(() => String)
  hash: string;
}
