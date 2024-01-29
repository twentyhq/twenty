import { ID, InputType } from '@nestjs/graphql';

import { BeforeDeleteOne, IDField } from '@ptc-org/nestjs-query-graphql';

import { ObjectMetadataDTO } from 'src/metadata/object-metadata/dtos/object-metadata.dto';
import { BeforeDeleteOneObject } from 'src/metadata/object-metadata/hooks/before-delete-one-object.hook';

@InputType()
@BeforeDeleteOne(BeforeDeleteOneObject)
export class DeleteObjectInput {
  @IDField(() => ID, { description: 'The id of the object to delete' })
  id!: string;
}

export class DeleteObjectResponse extends ObjectMetadataDTO {}
