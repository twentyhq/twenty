import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { WorkflowHttpRequestActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-input.type';

@InputType()
export class WorkflowHttpRequestActionInputDto {
  @Field(() => graphqlTypeJson, {
    description: 'Input for HTTP request workflow action testing',
    nullable: false,
  })
  input: WorkflowHttpRequestActionInput;
}
