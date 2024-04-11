import { InputType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DeleteOneFieldInput {
  @IDField(() => UUIDScalarType, {
    description: 'The id of the field to delete.',
  })
  id!: string;
}
