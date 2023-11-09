import { Injectable } from '@nestjs/common';

import {
  FindManyResolverArgs,
  Resolver,
} from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { SchemaBuilderContext } from 'src/tenant/schema-builder/interfaces/schema-builder-context.interface';
import { ResolverBuilderFactoryInterface } from 'src/tenant/resolver-builder/interfaces/resolver-builder-factory.interface';

import { PGGraphQLQueryRunner } from 'src/tenant/resolver-builder/pg-graphql/pg-graphql-query-runner';
import { TenantDataSourceService } from 'src/tenant-datasource/tenant-datasource.service';

@Injectable()
export class FindManyResolverFactory
  implements ResolverBuilderFactoryInterface
{
  public static methodName = 'findMany' as const;

  constructor(
    private readonly tenantDataSourceService: TenantDataSourceService,
  ) {}

  create(context: SchemaBuilderContext): Resolver<FindManyResolverArgs> {
    const internalContext = context;

    return (_source, args, context, info) => {
      const runner = new PGGraphQLQueryRunner(this.tenantDataSourceService, {
        targetTableName: internalContext.targetTableName,
        workspaceId: internalContext.workspaceId,
        info,
        fieldMetadataCollection: internalContext.fieldMetadataCollection,
      });

      return runner.findMany(args);
    };
  }
}
