import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPeopleInput } from './workspace-create-without-people.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutPeopleInput } from './workspace-create-or-connect-without-people.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';

@InputType()
export class WorkspaceCreateNestedOneWithoutPeopleInput {

    @Field(() => WorkspaceCreateWithoutPeopleInput, {nullable:true})
    @Type(() => WorkspaceCreateWithoutPeopleInput)
    create?: WorkspaceCreateWithoutPeopleInput;

    @Field(() => WorkspaceCreateOrConnectWithoutPeopleInput, {nullable:true})
    @Type(() => WorkspaceCreateOrConnectWithoutPeopleInput)
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPeopleInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
