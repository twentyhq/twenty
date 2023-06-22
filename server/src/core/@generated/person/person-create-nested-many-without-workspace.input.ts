import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateWithoutWorkspaceInput } from './person-create-without-workspace.input';
import { Type } from 'class-transformer';
import { PersonCreateOrConnectWithoutWorkspaceInput } from './person-create-or-connect-without-workspace.input';
import { PersonCreateManyWorkspaceInputEnvelope } from './person-create-many-workspace-input-envelope.input';
import { PersonWhereUniqueInput } from './person-where-unique.input';

@InputType()
export class PersonCreateNestedManyWithoutWorkspaceInput {

    @Field(() => [PersonCreateWithoutWorkspaceInput], {nullable:true})
    @Type(() => PersonCreateWithoutWorkspaceInput)
    create?: Array<PersonCreateWithoutWorkspaceInput>;

    @Field(() => [PersonCreateOrConnectWithoutWorkspaceInput], {nullable:true})
    @Type(() => PersonCreateOrConnectWithoutWorkspaceInput)
    connectOrCreate?: Array<PersonCreateOrConnectWithoutWorkspaceInput>;

    @Field(() => PersonCreateManyWorkspaceInputEnvelope, {nullable:true})
    @Type(() => PersonCreateManyWorkspaceInputEnvelope)
    createMany?: PersonCreateManyWorkspaceInputEnvelope;

    @Field(() => [PersonWhereUniqueInput], {nullable:true})
    @Type(() => PersonWhereUniqueInput)
    connect?: Array<PersonWhereUniqueInput>;
}
