import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';
import { PersonUpdateWithoutWorkspaceInput } from './person-update-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { PersonCreateWithoutWorkspaceInput } from './person-create-without-workspace.input';

@InputType()
export class PersonUpsertWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => PersonWhereUniqueInput, {nullable:false})
    @Type(() => PersonWhereUniqueInput)
    where!: PersonWhereUniqueInput;

    @HideField()
    update!: PersonUpdateWithoutWorkspaceInput;

    @HideField()
    create!: PersonCreateWithoutWorkspaceInput;
}
