import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpsertFieldsWidgetFieldInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, { description: 'The id of the view field' })
  viewFieldId: string;

  @IsBoolean()
  @Field()
  isVisible: boolean;

  @IsNumber()
  @Field()
  position: number;
}
