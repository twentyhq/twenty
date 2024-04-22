import { InputType } from '@nestjs/graphql';

import { BeforeDeleteOne, IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BeforeDeleteOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-delete-one-object.hook';

@InputType()
@BeforeDeleteOne(BeforeDeleteOneObject)
export class DeleteOneObjectInput {
  @IDField(() => UUIDScalarType, {
    description: 'The id of the record to delete.',
  })
  id!: string;
}
