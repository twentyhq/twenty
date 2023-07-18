import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPeopleInput } from './workspace-create-without-people.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutPeopleInput } from './workspace-create-or-connect-without-people.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class WorkspaceCreateNestedOneWithoutPeopleInput {

    @HideField()
    create?: WorkspaceCreateWithoutPeopleInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPeopleInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
