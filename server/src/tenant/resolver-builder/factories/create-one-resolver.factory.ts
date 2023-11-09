import { Injectable } from '@nestjs/common';

import {
  CreateOneResolverArgs,
  Resolver,
} from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { SchemaBuilderContext } from 'src/tenant/schema-builder/interfaces/schema-builder-context.interface';
import { ResolverBuilderFactoryInterface } from 'src/tenant/resolver-builder/interfaces/resolver-builder-factory.interface';

import { PGGraphQLQueryRunner } from 'src/tenant/resolver-builder/pg-graphql/pg-graphql-query-runner';
import { FieldMetadataEntity } from 'src/database/typeorm/metadata/entities/field-metadata.entity';
import { TenantDataSourceService } from 'src/tenant-datasource/tenant-datasource.service';

@Injectable()
export class CreateOneResolverFactory
  implements ResolverBuilderFactoryInterface
{
  public static methodName = 'createOne' as const;

  constructor(
    private readonly tenantDataSourceService: TenantDataSourceService,
  ) {}

  create(context: SchemaBuilderContext): Resolver<CreateOneResolverArgs> {
    const internalContext = context;

    return (_source, args, context, info) => {
      const runner = new PGGraphQLQueryRunner(this.tenantDataSourceService, {
        targetTableName: internalContext.targetTableName,
        workspaceId: internalContext.workspaceId,
        info,
        fieldMetadataCollection:
          internalContext.fieldMetadataCollection as FieldMetadataEntity[],
      });

      return runner.createOne(args);
    };
  }
}
