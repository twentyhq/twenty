import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberUncheckedCreateNestedManyWithoutWorkspaceInput } from '../workspace-member/workspace-member-unchecked-create-nested-many-without-workspace.input';
import { CompanyUncheckedCreateNestedManyWithoutWorkspaceInput } from '../company/company-unchecked-create-nested-many-without-workspace.input';

@InputType()
export class WorkspaceUncheckedCreateWithoutPeopleInput {

    @Field(() => String, {nullable:false})
    id!: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => String, {nullable:false})
    domainName!: string;

    @Field(() => String, {nullable:false})
    displayName!: string;

    @Field(() => WorkspaceMemberUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    WorkspaceMember?: WorkspaceMemberUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => CompanyUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    companies?: CompanyUncheckedCreateNestedManyWithoutWorkspaceInput;
}
