import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { RefreshTokenCreateManyInput } from './refresh-token-create-many.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateManyRefreshTokenArgs {

    @Field(() => [RefreshTokenCreateManyInput], {nullable:false})
    @Type(() => RefreshTokenCreateManyInput)
    data!: Array<RefreshTokenCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
