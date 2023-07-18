import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateWithoutWorkspaceInput } from './person-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { PersonCreateOrConnectWithoutWorkspaceInput } from './person-create-or-connect-without-workspace.input';
import { PersonCreateManyWorkspaceInputEnvelope } from './person-create-many-workspace-input-envelope.input';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class PersonCreateNestedManyWithoutWorkspaceInput {

    @HideField()
    create?: Array<PersonCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<PersonCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    createMany?: PersonCreateManyWorkspaceInputEnvelope;

    @Field(() => [PersonWhereUniqueInput], {nullable:true})
    @Type(() => PersonWhereUniqueInput)
    connect?: Array<PersonWhereUniqueInput>;
}
