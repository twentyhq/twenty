import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPeopleInput } from './workspace-create-without-people.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutPeopleInput } from './workspace-create-or-connect-without-people.input';
import { WorkspaceUpsertWithoutPeopleInput } from './workspace-upsert-without-people.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceUpdateWithoutPeopleInput } from './workspace-update-without-people.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutPeopleNestedInput {

    @HideField()
    create?: WorkspaceCreateWithoutPeopleInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutPeopleInput;

    @HideField()
    upsert?: WorkspaceUpsertWithoutPeopleInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;

    @HideField()
    update?: WorkspaceUpdateWithoutPeopleInput;
}
