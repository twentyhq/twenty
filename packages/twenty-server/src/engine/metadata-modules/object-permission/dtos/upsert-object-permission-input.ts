import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class UpsertObjectPermissionInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  roleId: string;

  @IsUUID()
  @IsNotEmpty()
  @Field()
  objectMetadataId: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canReadRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canUpdateRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canSoftDeleteRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canDestroyRecords?: boolean;
}
