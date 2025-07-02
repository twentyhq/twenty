import { UseFilters, UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { writeFileSync } from 'fs';
import {
  IntrospectionQuery,
  introspectionFromSchema,
  printSchema,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class SchemaResolver {
  constructor(
    private readonly workspaceSchemaFactory: WorkspaceSchemaFactory,
  ) {}

  @Query(() => String)
  async workspaceSchema(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<string> {
    const schema = await this.workspaceSchemaFactory.createGraphQLSchema({
      workspace,
    });

    const schemaString = printSchema(schema);
    writeFileSync('schema.graphql', schemaString);

    return schemaString;
  }

  @Query(() => GraphQLJSON)
  async workspaceIntrospection(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<IntrospectionQuery> {
    const schema = await this.workspaceSchemaFactory.createGraphQLSchema({
      workspace,
    });

    return introspectionFromSchema(schema);
  }
}
