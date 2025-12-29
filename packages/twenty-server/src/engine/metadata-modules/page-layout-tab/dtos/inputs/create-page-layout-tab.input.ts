import { Field, Float, InputType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreatePageLayoutTabInput {
  @Field({ nullable: false })
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  position?: number;

  @Field(() => UUIDScalarType, { nullable: false })
  @IsUUID()
  @IsNotEmpty()
  pageLayoutId: string;
}
