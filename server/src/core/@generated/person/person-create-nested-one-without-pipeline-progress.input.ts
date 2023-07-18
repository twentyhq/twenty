import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateWithoutPipelineProgressInput } from './person-create-without-pipeline-progress.input';
import { Type } from 'class-transformer';
import { PersonCreateOrConnectWithoutPipelineProgressInput } from './person-create-or-connect-without-pipeline-progress.input';
import { PersonWhereUniqueInput } from './person-where-unique.input';

@InputType()
export class PersonCreateNestedOneWithoutPipelineProgressInput {

    @Field(() => PersonCreateWithoutPipelineProgressInput, {nullable:true})
    @Type(() => PersonCreateWithoutPipelineProgressInput)
    create?: PersonCreateWithoutPipelineProgressInput;

    @Field(() => PersonCreateOrConnectWithoutPipelineProgressInput, {nullable:true})
    @Type(() => PersonCreateOrConnectWithoutPipelineProgressInput)
    connectOrCreate?: PersonCreateOrConnectWithoutPipelineProgressInput;

    @Field(() => PersonWhereUniqueInput, {nullable:true})
    @Type(() => PersonWhereUniqueInput)
    connect?: PersonWhereUniqueInput;
}
