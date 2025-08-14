import { Field, ObjectType } from '@nestjs/graphql';

import { IsJSON, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type APP_LOCALES } from 'twenty-shared/translations';

@ObjectType('ObjectStandardOverrides')
export class ObjectStandardOverridesDTO {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  labelSingular?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  labelPlural?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  icon?: string | null;

  @IsJSON()
  @IsOptional()
  @Field(() => GraphQLJSON, {
    nullable: true,
  })
  translations?: Partial<
    Record<
      keyof typeof APP_LOCALES,
      {
        labelSingular?: string | null;
        labelPlural?: string | null;
        description?: string | null;
      }
    >
  > | null;
}
