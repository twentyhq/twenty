import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateNavigationMenuItemInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  favoriteFolderId?: string | null;

  @IsNumber()
  @IsOptional()
  @Field({ nullable: true })
  position?: number;
}
