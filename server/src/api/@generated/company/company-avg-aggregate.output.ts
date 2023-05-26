import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Float } from '@nestjs/graphql';

@ObjectType()
export class CompanyAvgAggregate {

    @Field(() => Float, {nullable:true})
    employees?: number;
}
