import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';
import { PersonCreateWithoutPipelineProgressInput } from './person-create-without-pipeline-progress.input';

@InputType()
export class PersonCreateOrConnectWithoutPipelineProgressInput {

    @Field(() => PersonWhereUniqueInput, {nullable:false})
    @Type(() => PersonWhereUniqueInput)
    where!: PersonWhereUniqueInput;

    @Field(() => PersonCreateWithoutPipelineProgressInput, {nullable:false})
    @Type(() => PersonCreateWithoutPipelineProgressInput)
    create!: PersonCreateWithoutPipelineProgressInput;
}
