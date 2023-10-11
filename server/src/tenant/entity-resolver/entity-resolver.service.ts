import { Injectable } from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';

import { SchemaBuilderContext } from 'src/tenant/schema-builder/interfaces/schema-builder-context.interface';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';

import { PGGraphQLQueryRunner } from './utils/pg-graphql-query-runner.util';

@Injectable()
export class EntityResolverService {
  constructor(private readonly dataSourceService: DataSourceService) {}

  async findMany(context: SchemaBuilderContext, info: GraphQLResolveInfo) {
    const runner = new PGGraphQLQueryRunner(this.dataSourceService, {
      entityName: context.entityName,
      tableName: context.tableName,
      workspaceId: context.workspaceId,
      info,
      fields: context.fields,
    });

    return runner.findMany();
  }

  async findOne(
    args: { id: string },
    context: SchemaBuilderContext,
    info: GraphQLResolveInfo,
  ) {
    const runner = new PGGraphQLQueryRunner(this.dataSourceService, {
      entityName: context.entityName,
      tableName: context.tableName,
      workspaceId: context.workspaceId,
      info,
      fields: context.fields,
    });

    return runner.findOne(args);
  }

  async createOne(
    args: { data: any },
    context: SchemaBuilderContext,
    info: GraphQLResolveInfo,
  ) {
    const records = await this.createMany({ data: [args.data] }, context, info);

    return records?.[0];
  }

  async createMany(
    args: { data: any[] },
    context: SchemaBuilderContext,
    info: GraphQLResolveInfo,
  ) {
    const runner = new PGGraphQLQueryRunner(this.dataSourceService, {
      entityName: context.entityName,
      tableName: context.tableName,
      workspaceId: context.workspaceId,
      info,
      fields: context.fields,
    });

    return runner.createMany(args);
  }

  async updateOne(
    args: { id: string; data: any },
    context: SchemaBuilderContext,
    info: GraphQLResolveInfo,
  ) {
    const runner = new PGGraphQLQueryRunner(this.dataSourceService, {
      entityName: context.entityName,
      tableName: context.tableName,
      workspaceId: context.workspaceId,
      info,
      fields: context.fields,
    });

    return runner.updateOne(args);
  }
}
