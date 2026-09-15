import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DestroyViewFieldInput {
  @Field(() => UUIDScalarType, {
    description: 'The id of the view field to destroy.',
  })
  @IsUUID()
  id: string;
}
