import { Field, GraphQLISODateTime, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('MktCustomer')
export class Customer {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  customerType?: string;

  @Field({ nullable: true })
  customerEmailPrimaryEmail?: string;

  @Field(() => [String], { nullable: true })
  emailAdditional?: string[];

  @Field({ nullable: true })
  customerPhonePrimaryPhoneNumber?: string;

  @Field({ nullable: true })
  phoneCountryCode?: string;

  @Field({ nullable: true })
  phoneCallingCode?: string;

  @Field(() => [String], { nullable: true })
  phoneAdditional?: string[];

  @Field({ nullable: true })
  taxCode?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  customerStatus?: string;

  @Field({ nullable: true })
  customerTier?: string;

  @Field({ nullable: true })
  customerLifecycleStage?: string;

  @Field({ nullable: true })
  customerTest?: string;

  @Field({ nullable: true })
  customerTotalOrderValue?: number;

  @Field({ nullable: true })
  customerTags?: string;

  @Field(() => GraphQLISODateTime)
  createdAt: string;

  @Field(() => GraphQLISODateTime)
  updatedAt: string;

  @Field(() => UUIDScalarType)
  workspaceId: string;
}

@InputType('MktCustomerFiltersInput')
export class CustomerFiltersInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  company?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerTier?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerLifecycleStage?: string;
}

@ObjectType('MktPageInfo')
export class MktPageInfo {
  @Field()
  page: number;

  @Field()
  limit: number;

  @Field()
  totalPages: number;
}

@ObjectType('MktCustomerConnection')
export class CustomerConnection {
  @Field(() => [Customer])
  data: Customer[];

  @Field(() => Int)
  totalCount: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  // @Field(() => MktPageInfo)
  // pageInfo: MktPageInfo;
}

// REST API Response Types
export interface CustomerRestResponse {
  success: boolean;
  data: Customer;
  message: string;
}

export interface CustomerListRestResponse {
  success: boolean;
  data: Customer[];
  // meta: {
  //   total: number;
  //   page: number;
  //   limit: number;
  //   totalPages: number;
  //   hasNextPage: boolean;
  //   hasPreviousPage: boolean;
  // };
  message: string;
}
