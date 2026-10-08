import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('UUIDFilterComparison')
export class UUIDFilterComparisonInput {
  @Field(() => Boolean, { nullable: true })
  is?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  isNot?: boolean | null;

  @Field(() => UUIDScalarType, { nullable: true })
  eq?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  neq?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  gt?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  gte?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  lt?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  lte?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  like?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  notLike?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  iLike?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  notILike?: string;

  @Field(() => [UUIDScalarType], { nullable: true })
  in?: string[];

  @Field(() => [UUIDScalarType], { nullable: true })
  notIn?: string[];
}
