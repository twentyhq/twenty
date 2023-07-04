import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { RefreshTokenUpdateManyMutationInput } from './refresh-token-update-many-mutation.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { RefreshTokenWhereInput } from './refresh-token-where.input';

@ArgsType()
export class UpdateManyRefreshTokenArgs {

    @Field(() => RefreshTokenUpdateManyMutationInput, {nullable:false})
    @Type(() => RefreshTokenUpdateManyMutationInput)
    @Type(() => RefreshTokenUpdateManyMutationInput)
    @ValidateNested({each: true})
    data!: RefreshTokenUpdateManyMutationInput;

    @Field(() => RefreshTokenWhereInput, {nullable:true})
    @Type(() => RefreshTokenWhereInput)
    where?: RefreshTokenWhereInput;
}
