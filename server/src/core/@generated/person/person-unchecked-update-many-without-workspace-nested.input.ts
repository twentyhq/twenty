import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateWithoutWorkspaceInput } from './person-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { PersonCreateOrConnectWithoutWorkspaceInput } from './person-create-or-connect-without-workspace.input';
import { PersonUpsertWithWhereUniqueWithoutWorkspaceInput } from './person-upsert-with-where-unique-without-workspace.input';
import { PersonCreateManyWorkspaceInputEnvelope } from './person-create-many-workspace-input-envelope.input';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';
import { PersonUpdateWithWhereUniqueWithoutWorkspaceInput } from './person-update-with-where-unique-without-workspace.input';
import { PersonUpdateManyWithWhereWithoutWorkspaceInput } from './person-update-many-with-where-without-workspace.input';
import { PersonScalarWhereInput } from './person-scalar-where.input';

@InputType()
export class PersonUncheckedUpdateManyWithoutWorkspaceNestedInput {

    @HideField()
    create?: Array<PersonCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<PersonCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    upsert?: Array<PersonUpsertWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    createMany?: PersonCreateManyWorkspaceInputEnvelope;

    @Field(() => [PersonWhereUniqueInput], {nullable:true})
    @Type(() => PersonWhereUniqueInput)
    set?: Array<PersonWhereUniqueInput>;

    @Field(() => [PersonWhereUniqueInput], {nullable:true})
    @Type(() => PersonWhereUniqueInput)
    disconnect?: Array<PersonWhereUniqueInput>;

    @HideField()
    delete?: Array<PersonWhereUniqueInput>;

    @Field(() => [PersonWhereUniqueInput], {nullable:true})
    @Type(() => PersonWhereUniqueInput)
    connect?: Array<PersonWhereUniqueInput>;

    @HideField()
    update?: Array<PersonUpdateWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    updateMany?: Array<PersonUpdateManyWithWhereWithoutWorkspaceInput>;

    @HideField()
    deleteMany?: Array<PersonScalarWhereInput>;
}
