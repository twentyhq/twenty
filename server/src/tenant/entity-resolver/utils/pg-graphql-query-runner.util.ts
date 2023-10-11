import { BadRequestException } from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';
import isEmpty from 'lodash.isempty';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { pascalCase } from 'src/utils/pascal-case';
import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

import { PGGraphQLQueryBuilder } from './pg-graphql-query-builder.util';

interface QueryRunnerOptions {
  entityName: string;
  tableName: string;
  workspaceId: string;
  info: GraphQLResolveInfo;
  fields: FieldMetadata[];
}

function isSpecialKey(key: string): boolean {
  return key.startsWith('___');
}

function handleSpecialKey(result: any, key: string, value: any): void {
  const parts = key.split('_').filter((part) => part);
  const newKey = parts.slice(0, -1).join('');
  const subKey = parts[parts.length - 1];

  if (!result[newKey]) {
    result[newKey] = {};
  }

  result[newKey][subKey] = value;
}

function parseObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => parseObject(item));
  }

  const result: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = parseObject(obj[key]);
      } else if (isSpecialKey(key)) {
        handleSpecialKey(result, key, obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }

  return result;
}

export class PGGraphQLQueryRunner {
  private queryBuilder: PGGraphQLQueryBuilder;
  private options: QueryRunnerOptions;

  constructor(
    private dataSourceService: DataSourceService,
    options: QueryRunnerOptions,
  ) {
    this.queryBuilder = new PGGraphQLQueryBuilder({
      entityName: options.entityName,
      tableName: options.tableName,
      info: options.info,
      fields: options.fields,
    });
    this.options = options;
  }

  private async execute(query: string, workspaceId: string): Promise<any> {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    await workspaceDataSource?.query(`
      SET search_path TO ${this.dataSourceService.getSchemaName(workspaceId)};
    `);

    return workspaceDataSource?.query(`
      SELECT graphql.resolve($$
        ${query}
      $$);
    `);
  }

  private cleanResult(result: any): any {
    if (Array.isArray(result)) {
      return result.map((item) => this.cleanResult(item));
    }

    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'object' && !isEmpty(value)) {
        result[key] = this.cleanResult(value);
        continue;
      }

      if (key.startsWith('___')) {
        const mainKey = key.split('_')[1];
        const subKey = key.split('_')[2];

        if (mainKey) {
          result[mainKey] = {
            ...result[mainKey],
            [subKey]: value,
          };
        }

        delete result[key];
      }
    }

    console.log('CLEAN RESULT: ', JSON.stringify(result, null, 2));

    return result;
  }

  private parseResults(graphqlResult: any, command: string): any {
    const entityKey = `${command}${pascalCase(this.options.entityName)}`;
    const result = graphqlResult?.[0]?.resolve?.data?.[entityKey];

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return parseObject(result);
  }

  async findMany(): Promise<any[]> {
    const query = this.queryBuilder.findMany();
    const result = await this.execute(query, this.options.workspaceId);

    console.log('RESULT: ', JSON.stringify(result, null, 2));
    const res = this.parseResults(result, 'findMany');
    console.log('CLEAN RES: ', JSON.stringify(res, null, 2));

    return res;
  }

  async findOne(args: { id: string }): Promise<any> {
    const query = this.queryBuilder.findOne(args);
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResults(result, 'findOne');
  }

  async createMany(args: { data: any[] }): Promise<any[]> {
    const query = this.queryBuilder.createMany(args);
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResults(result, 'createMany')?.records;
  }

  async createOne(args: { data: any }): Promise<any> {
    const records = await this.createMany({ data: [args.data] });

    return records?.[0];
  }

  async updateOne(args: { id: string; data: any }): Promise<any> {
    const query = this.queryBuilder.updateOne(args);
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResults(result, 'updateOne')?.records?.[0];
  }
}
