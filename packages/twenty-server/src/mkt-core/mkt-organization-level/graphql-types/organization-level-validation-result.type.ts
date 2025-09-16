import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('OrganizationLevelValidationResult')
export class OrganizationLevelValidationResult {
  @Field(() => Boolean)
  isValid: boolean;

  @Field(() => [ValidationError])
  errors: ValidationError[];

  @Field(() => [String])
  warnings: string[];

  @Field(() => [String])
  recommendations: string[];
}

@ObjectType('ValidationError')
export class ValidationError {
  @Field(() => String)
  field: string;

  @Field(() => String)
  message: string;

  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  severity?: 'error' | 'warning' | 'info';
}
