import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutWorkspaceInput } from './company-create-without-workspace.input';
import { Type } from 'class-transformer';
import { CompanyCreateOrConnectWithoutWorkspaceInput } from './company-create-or-connect-without-workspace.input';
import { CompanyCreateManyWorkspaceInputEnvelope } from './company-create-many-workspace-input-envelope.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';

@InputType()
export class CompanyUncheckedCreateNestedManyWithoutWorkspaceInput {
  @Field(() => [CompanyCreateWithoutWorkspaceInput], { nullable: true })
  @Type(() => CompanyCreateWithoutWorkspaceInput)
  create?: Array<CompanyCreateWithoutWorkspaceInput>;

  @Field(() => [CompanyCreateOrConnectWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => CompanyCreateOrConnectWithoutWorkspaceInput)
  connectOrCreate?: Array<CompanyCreateOrConnectWithoutWorkspaceInput>;

  @Field(() => CompanyCreateManyWorkspaceInputEnvelope, { nullable: true })
  @Type(() => CompanyCreateManyWorkspaceInputEnvelope)
  createMany?: CompanyCreateManyWorkspaceInputEnvelope;

  @Field(() => [CompanyWhereUniqueInput], { nullable: true })
  @Type(() => CompanyWhereUniqueInput)
  connect?: Array<CompanyWhereUniqueInput>;
}
