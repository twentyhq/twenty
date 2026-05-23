import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateConnectedAccountSignatureInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsOptional()
  @MaxLength(50000)
  @Field(() => String, { nullable: true })
  emailSignature?: string | null;
}
