import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EnrichCompanySource {
  @Field(() => String)
  name: string;

  @Field(() => String)
  url: string;

  @Field(() => String, { nullable: true })
  snippet?: string;
}

@ObjectType()
export class EnrichCompanyResult {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [EnrichCompanySource], { nullable: true })
  sources?: EnrichCompanySource[];

  @Field(() => String, { nullable: true })
  error?: string;
}
