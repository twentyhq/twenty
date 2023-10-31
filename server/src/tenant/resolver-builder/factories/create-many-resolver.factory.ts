import { Injectable } from '@nestjs/common';

import {
  CreateManyResolverArgs,
  Resolver,
} from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { SchemaBuilderContext } from 'src/tenant/schema-builder/interfaces/schema-builder-context.interface';
import { FactoryInterface } from 'src/tenant/resolver-builder/interfaces/factory.interface';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { PGGraphQLQueryRunner } from 'src/tenant/resolver-builder/pg-graphql/pg-graphql-query-runner.util';
import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

@Injectable()
export class CreateManyResolverFactory implements FactoryInterface {
  public static methodName = 'createMany' as const;

  constructor(private readonly dataSourceService: DataSourceService) {}

  create(context: SchemaBuilderContext): Resolver<CreateManyResolverArgs> {
    const internalContext = context;

    return (_source, args, context, info) => {
      const runner = new PGGraphQLQueryRunner(this.dataSourceService, {
        tableName: internalContext.targetTableName,
        workspaceId: internalContext.workspaceId,
        info,
        // TODO: Replace FieldMetadata with FieldMetadataInterface
        fields: internalContext.fieldMetadataCollection as FieldMetadata[],
      });

      return runner.createMany(args);
    };
  }
}
