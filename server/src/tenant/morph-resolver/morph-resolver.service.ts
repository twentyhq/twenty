import { Injectable } from '@nestjs/common';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';

@Injectable()
export class MorphResolverService {
  constructor(private readonly dataSourceService: DataSourceService) {}
  async findAll(entityName: string, workspaceId: string) {
    try {
      await this.dataSourceService.createWorkspaceSchema(workspaceId);
    } catch {}

    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    // It seems like workspaceDataSource is querying on public schema even if workspace one is specified during initialization
    // Maybe it's realted to the fact that it's a raw query ?
    // Seems like it's the problem: https://github.com/typeorm/typeorm/issues/6734
    const graphqlResult = await workspaceDataSource?.query(`
      SELECT graphql.resolve($$
        {
          ${entityName}Collection {
            edges {
              node {
                id
              }
            }
          }
        }
      $$);
    `);

    console.log(
      'QUERY: ',
      `
    SELECT graphql.resolve($$
      {
        ${entityName}Collection {
          edges {
            node {
              id
            }
          }
        }
      }
    $$);
  `,
    );

    console.log('graphqlResult: ', JSON.stringify(graphqlResult, null, 2));

    return [];
  }

  findOne(entityName: string, id: string, context: any) {
    // Your resolver logic here
    return {};
  }
}
