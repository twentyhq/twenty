import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DeleteOneIndexInput {
  @Field(() => UUIDScalarType, {
    description: 'The id of the custom index to delete.',
  })
  @IsUUID()
  id!: string;
}
