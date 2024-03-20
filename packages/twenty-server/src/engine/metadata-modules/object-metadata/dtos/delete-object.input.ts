import { ID, InputType } from '@nestjs/graphql';

import { BeforeDeleteOne, IDField } from '@ptc-org/nestjs-query-graphql';

import { BeforeDeleteOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-delete-one-object.hook';

@InputType()
@BeforeDeleteOne(BeforeDeleteOneObject)
export class DeleteOneObjectInput {
  @IDField(() => ID, { description: 'The id of the record to delete.' })
  id!: string;
}
