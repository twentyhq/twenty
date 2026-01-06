import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('Skill')
export class SkillDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: true })
  standardId?: string | null;

  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field()
  label: string;

  @IsString()
  @Field({ nullable: true })
  icon?: string;

  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  content: string;

  @IsBoolean()
  @Field()
  isCustom: boolean;

  @IsBoolean()
  @Field()
  isActive: boolean;

  @HideField()
  workspaceId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId?: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
