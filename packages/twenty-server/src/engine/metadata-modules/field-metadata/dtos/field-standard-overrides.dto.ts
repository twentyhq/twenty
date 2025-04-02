import { Field, ObjectType } from '@nestjs/graphql';

import { IsJSON, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { APP_LOCALES } from 'twenty-shared/translations';

@ObjectType('StandardOverrides')
export class FieldStandardOverridesDTO {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  label?: string | null;

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
        label?: string | null;
        description?: string | null;
      }
    >
  > | null;
}
