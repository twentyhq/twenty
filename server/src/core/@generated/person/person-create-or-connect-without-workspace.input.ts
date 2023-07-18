import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';
import { PersonCreateWithoutWorkspaceInput } from './person-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PersonCreateOrConnectWithoutWorkspaceInput {

    @Field(() => PersonWhereUniqueInput, {nullable:false})
    @Type(() => PersonWhereUniqueInput)
    where!: PersonWhereUniqueInput;

    @HideField()
    create!: PersonCreateWithoutWorkspaceInput;
}
