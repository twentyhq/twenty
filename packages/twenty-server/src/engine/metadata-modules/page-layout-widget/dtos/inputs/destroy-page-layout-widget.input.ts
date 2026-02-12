import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DestroyPageLayoutWidgetInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
