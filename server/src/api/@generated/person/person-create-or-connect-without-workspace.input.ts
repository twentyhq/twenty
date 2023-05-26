import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';
import { PersonCreateWithoutWorkspaceInput } from './person-create-without-workspace.input';

@InputType()
export class PersonCreateOrConnectWithoutWorkspaceInput {

    @Field(() => PersonWhereUniqueInput, {nullable:false})
    @Type(() => PersonWhereUniqueInput)
    where!: PersonWhereUniqueInput;

    @Field(() => PersonCreateWithoutWorkspaceInput, {nullable:false})
    @Type(() => PersonCreateWithoutWorkspaceInput)
    create!: PersonCreateWithoutWorkspaceInput;
}
