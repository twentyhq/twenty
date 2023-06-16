import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { RefreshTokenScalarWhereInput } from './refresh-token-scalar-where.input';
import { Type } from 'class-transformer';
import { RefreshTokenUpdateManyMutationInput } from './refresh-token-update-many-mutation.input';

@InputType()
export class RefreshTokenUpdateManyWithWhereWithoutUserInput {
  @Field(() => RefreshTokenScalarWhereInput, { nullable: false })
  @Type(() => RefreshTokenScalarWhereInput)
  where!: RefreshTokenScalarWhereInput;

  @Field(() => RefreshTokenUpdateManyMutationInput, { nullable: false })
  @Type(() => RefreshTokenUpdateManyMutationInput)
  data!: RefreshTokenUpdateManyMutationInput;
}
