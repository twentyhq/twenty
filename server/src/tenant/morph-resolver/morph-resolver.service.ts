import { BadRequestException, Injectable } from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import isEmpty from 'lodash.isempty';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';

export const convertFieldsToGraphQL = (
  fields: any,
  fieldAliases: Record<string, string>,
  acc = '',
) => {
  for (const [key, value] of Object.entries(fields)) {
    if (value && !isEmpty(value)) {
      acc += `${key} {\n`;
      acc = convertFieldsToGraphQL(value, fieldAliases, acc);
      acc += `}\n`;
    } else {
      if (fieldAliases[key]) {
        acc += `${key}: ${fieldAliases[key]}\n`;
      } else {
        acc += `${key}\n`;
      }
    }
  }

  return acc;
};

@Injectable()
export class MorphResolverService {
  constructor(private readonly dataSourceService: DataSourceService) {}
  async findAll(
    entityName: string,
    workspaceId: string,
    info: GraphQLResolveInfo,
    fieldAliases: Record<string, string>,
  ) {
    // Extract requested fields from GraphQL resolve info
    const fields = graphqlFields(info);

    await this.dataSourceService.createWorkspaceSchema(workspaceId);

    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    const graphqlQuery = convertFieldsToGraphQL(fields, fieldAliases);

    console.log('graphqlQuery', graphqlQuery);

    const graphqlResult = await workspaceDataSource?.query(`
      SELECT graphql.resolve($$
        {
          ${entityName}Collection {
            ${graphqlQuery}
          }
        }
      $$);
    `);

    const result =
      graphqlResult?.[0]?.resolve?.data?.[`${entityName}Collection`];

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return result;
  }

  findOne(entityName: string, id: string, context: any) {
    // Your resolver logic here
    return {};
  }
}
