import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DeleteOneObjectInput {
  @Field(() => UUIDScalarType, {
    description: 'The id of the record to delete.',
  })
  @IsUUID()
  id!: string;
}
