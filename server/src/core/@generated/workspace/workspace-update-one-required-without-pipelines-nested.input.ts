import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelinesInput } from './workspace-create-without-pipelines.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutPipelinesInput } from './workspace-create-or-connect-without-pipelines.input';
import { WorkspaceUpsertWithoutPipelinesInput } from './workspace-upsert-without-pipelines.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { WorkspaceUpdateWithoutPipelinesInput } from './workspace-update-without-pipelines.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutPipelinesNestedInput {
  @Field(() => WorkspaceCreateWithoutPipelinesInput, { nullable: true })
  @Type(() => WorkspaceCreateWithoutPipelinesInput)
  create?: WorkspaceCreateWithoutPipelinesInput;

  @Field(() => WorkspaceCreateOrConnectWithoutPipelinesInput, {
    nullable: true,
  })
  @Type(() => WorkspaceCreateOrConnectWithoutPipelinesInput)
  connectOrCreate?: WorkspaceCreateOrConnectWithoutPipelinesInput;

  @Field(() => WorkspaceUpsertWithoutPipelinesInput, { nullable: true })
  @Type(() => WorkspaceUpsertWithoutPipelinesInput)
  upsert?: WorkspaceUpsertWithoutPipelinesInput;

  @Field(() => WorkspaceWhereUniqueInput, { nullable: true })
  @Type(() => WorkspaceWhereUniqueInput)
  connect?: WorkspaceWhereUniqueInput;

  @Field(() => WorkspaceUpdateWithoutPipelinesInput, { nullable: true })
  @Type(() => WorkspaceUpdateWithoutPipelinesInput)
  update?: WorkspaceUpdateWithoutPipelinesInput;
}
