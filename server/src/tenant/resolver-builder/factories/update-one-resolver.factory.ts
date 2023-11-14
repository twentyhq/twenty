import { Injectable } from '@nestjs/common';

import {
  Resolver,
  UpdateOneResolverArgs,
} from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { SchemaBuilderContext } from 'src/tenant/schema-builder/interfaces/schema-builder-context.interface';
import { ResolverBuilderFactoryInterface } from 'src/tenant/resolver-builder/interfaces/resolver-builder-factory.interface';

import { QueryRunnerService } from 'src/tenant/query-runner/query-runner.service';

@Injectable()
export class UpdateOneResolverFactory
  implements ResolverBuilderFactoryInterface
{
  public static methodName = 'updateOne' as const;

  constructor(private readonly queryRunnerService: QueryRunnerService) {}

  create(context: SchemaBuilderContext): Resolver<UpdateOneResolverArgs> {
    const internalContext = context;

    return (_source, args, context, info) => {
      return this.queryRunnerService.updateOne(args, {
        targetTableName: internalContext.targetTableName,
        workspaceId: internalContext.workspaceId,
        info,
        fieldMetadataCollection: internalContext.fieldMetadataCollection,
      });
    };
  }
}
