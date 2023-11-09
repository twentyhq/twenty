import { Injectable } from '@nestjs/common';

import {
  CreateOneResolverArgs,
  Resolver,
} from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { SchemaBuilderContext } from 'src/tenant/schema-builder/interfaces/schema-builder-context.interface';
import { ResolverBuilderFactoryInterface } from 'src/tenant/resolver-builder/interfaces/resolver-builder-factory.interface';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { PGGraphQLQueryRunner } from 'src/tenant/resolver-builder/pg-graphql/pg-graphql-query-runner';
import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

@Injectable()
export class CreateOneResolverFactory
  implements ResolverBuilderFactoryInterface
{
  public static methodName = 'createOne' as const;

  constructor(private readonly dataSourceService: DataSourceService) {}

  create(context: SchemaBuilderContext): Resolver<CreateOneResolverArgs> {
    const internalContext = context;

    return (_source, args, context, info) => {
      const runner = new PGGraphQLQueryRunner(this.dataSourceService, {
        targetTableName: internalContext.targetTableName,
        workspaceId: internalContext.workspaceId,
        info,
        fieldMetadataCollection:
          internalContext.fieldMetadataCollection as FieldMetadata[],
      });

      return runner.createOne(args);
    };
  }
}
