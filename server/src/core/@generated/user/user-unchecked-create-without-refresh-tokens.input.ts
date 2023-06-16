import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { WorkspaceMemberUncheckedCreateNestedOneWithoutUserInput } from '../workspace-member/workspace-member-unchecked-create-nested-one-without-user.input';
import { CompanyUncheckedCreateNestedManyWithoutAccountOwnerInput } from '../company/company-unchecked-create-nested-many-without-account-owner.input';
import { CommentUncheckedCreateNestedManyWithoutAuthorInput } from '../comment/comment-unchecked-create-nested-many-without-author.input';

@InputType()
export class UserUncheckedCreateWithoutRefreshTokensInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  lastSeen?: Date | string;

  @Field(() => Boolean, { nullable: true })
  disabled?: boolean;

  @Field(() => String, { nullable: false })
  displayName!: string;

  @Field(() => String, { nullable: false })
  email!: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => String, { nullable: false })
  locale!: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @HideField()
  passwordHash?: string;

  @Field(() => Boolean, { nullable: true })
  emailVerified?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @HideField()
  workspaceMember?: WorkspaceMemberUncheckedCreateNestedOneWithoutUserInput;

  @Field(() => CompanyUncheckedCreateNestedManyWithoutAccountOwnerInput, {
    nullable: true,
  })
  companies?: CompanyUncheckedCreateNestedManyWithoutAccountOwnerInput;

  @Field(() => CommentUncheckedCreateNestedManyWithoutAuthorInput, {
    nullable: true,
  })
  comments?: CommentUncheckedCreateNestedManyWithoutAuthorInput;
}
