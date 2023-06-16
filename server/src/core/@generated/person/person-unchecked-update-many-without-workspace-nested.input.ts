import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateWithoutWorkspaceInput } from './person-create-without-workspace.input';
import { Type } from 'class-transformer';
import { PersonCreateOrConnectWithoutWorkspaceInput } from './person-create-or-connect-without-workspace.input';
import { PersonUpsertWithWhereUniqueWithoutWorkspaceInput } from './person-upsert-with-where-unique-without-workspace.input';
import { PersonCreateManyWorkspaceInputEnvelope } from './person-create-many-workspace-input-envelope.input';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { PersonUpdateWithWhereUniqueWithoutWorkspaceInput } from './person-update-with-where-unique-without-workspace.input';
import { PersonUpdateManyWithWhereWithoutWorkspaceInput } from './person-update-many-with-where-without-workspace.input';
import { PersonScalarWhereInput } from './person-scalar-where.input';

@InputType()
export class PersonUncheckedUpdateManyWithoutWorkspaceNestedInput {
  @Field(() => [PersonCreateWithoutWorkspaceInput], { nullable: true })
  @Type(() => PersonCreateWithoutWorkspaceInput)
  create?: Array<PersonCreateWithoutWorkspaceInput>;

  @Field(() => [PersonCreateOrConnectWithoutWorkspaceInput], { nullable: true })
  @Type(() => PersonCreateOrConnectWithoutWorkspaceInput)
  connectOrCreate?: Array<PersonCreateOrConnectWithoutWorkspaceInput>;

  @Field(() => [PersonUpsertWithWhereUniqueWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PersonUpsertWithWhereUniqueWithoutWorkspaceInput)
  upsert?: Array<PersonUpsertWithWhereUniqueWithoutWorkspaceInput>;

  @Field(() => PersonCreateManyWorkspaceInputEnvelope, { nullable: true })
  @Type(() => PersonCreateManyWorkspaceInputEnvelope)
  createMany?: PersonCreateManyWorkspaceInputEnvelope;

  @Field(() => [PersonWhereUniqueInput], { nullable: true })
  @Type(() => PersonWhereUniqueInput)
  set?: Array<PersonWhereUniqueInput>;

  @Field(() => [PersonWhereUniqueInput], { nullable: true })
  @Type(() => PersonWhereUniqueInput)
  disconnect?: Array<PersonWhereUniqueInput>;

  @Field(() => [PersonWhereUniqueInput], { nullable: true })
  @Type(() => PersonWhereUniqueInput)
  delete?: Array<PersonWhereUniqueInput>;

  @Field(() => [PersonWhereUniqueInput], { nullable: true })
  @Type(() => PersonWhereUniqueInput)
  connect?: Array<PersonWhereUniqueInput>;

  @Field(() => [PersonUpdateWithWhereUniqueWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PersonUpdateWithWhereUniqueWithoutWorkspaceInput)
  update?: Array<PersonUpdateWithWhereUniqueWithoutWorkspaceInput>;

  @Field(() => [PersonUpdateManyWithWhereWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PersonUpdateManyWithWhereWithoutWorkspaceInput)
  updateMany?: Array<PersonUpdateManyWithWhereWithoutWorkspaceInput>;

  @Field(() => [PersonScalarWhereInput], { nullable: true })
  @Type(() => PersonScalarWhereInput)
  deleteMany?: Array<PersonScalarWhereInput>;
}
