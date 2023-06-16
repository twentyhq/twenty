import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCompaniesInput } from './workspace-create-without-companies.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutCompaniesInput } from './workspace-create-or-connect-without-companies.input';
import { WorkspaceUpsertWithoutCompaniesInput } from './workspace-upsert-without-companies.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { WorkspaceUpdateWithoutCompaniesInput } from './workspace-update-without-companies.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutCompaniesNestedInput {
  @Field(() => WorkspaceCreateWithoutCompaniesInput, { nullable: true })
  @Type(() => WorkspaceCreateWithoutCompaniesInput)
  create?: WorkspaceCreateWithoutCompaniesInput;

  @Field(() => WorkspaceCreateOrConnectWithoutCompaniesInput, {
    nullable: true,
  })
  @Type(() => WorkspaceCreateOrConnectWithoutCompaniesInput)
  connectOrCreate?: WorkspaceCreateOrConnectWithoutCompaniesInput;

  @Field(() => WorkspaceUpsertWithoutCompaniesInput, { nullable: true })
  @Type(() => WorkspaceUpsertWithoutCompaniesInput)
  upsert?: WorkspaceUpsertWithoutCompaniesInput;

  @Field(() => WorkspaceWhereUniqueInput, { nullable: true })
  @Type(() => WorkspaceWhereUniqueInput)
  connect?: WorkspaceWhereUniqueInput;

  @Field(() => WorkspaceUpdateWithoutCompaniesInput, { nullable: true })
  @Type(() => WorkspaceUpdateWithoutCompaniesInput)
  update?: WorkspaceUpdateWithoutCompaniesInput;
}
