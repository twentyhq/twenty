import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCompaniesInput } from './workspace-create-without-companies.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutCompaniesInput } from './workspace-create-or-connect-without-companies.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';

@InputType()
export class WorkspaceCreateNestedOneWithoutCompaniesInput {
  @Field(() => WorkspaceCreateWithoutCompaniesInput, { nullable: true })
  @Type(() => WorkspaceCreateWithoutCompaniesInput)
  create?: WorkspaceCreateWithoutCompaniesInput;

  @Field(() => WorkspaceCreateOrConnectWithoutCompaniesInput, {
    nullable: true,
  })
  @Type(() => WorkspaceCreateOrConnectWithoutCompaniesInput)
  connectOrCreate?: WorkspaceCreateOrConnectWithoutCompaniesInput;

  @Field(() => WorkspaceWhereUniqueInput, { nullable: true })
  @Type(() => WorkspaceWhereUniqueInput)
  connect?: WorkspaceWhereUniqueInput;
}
