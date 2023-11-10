import { Injectable } from '@nestjs/common';

import {
  CreateOneResolverArgs,
  Resolver,
} from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { SchemaBuilderContext } from 'src/tenant/schema-builder/interfaces/schema-builder-context.interface';
import { ResolverBuilderFactoryInterface } from 'src/tenant/resolver-builder/interfaces/resolver-builder-factory.interface';

import { QueryRunnerService } from 'src/tenant/query-runner/query-runner.service';

@Injectable()
export class CreateOneResolverFactory
  implements ResolverBuilderFactoryInterface
{
  public static methodName = 'createOne' as const;

  constructor(private readonly queryRunnerService: QueryRunnerService) {}

  create(context: SchemaBuilderContext): Resolver<CreateOneResolverArgs> {
    const internalContext = context;

    return (_source, args, context, info) => {
      return this.queryRunnerService.createOne(args, {
        targetTableName: internalContext.targetTableName,
        workspaceId: internalContext.workspaceId,
        info,
        fieldMetadataCollection: internalContext.fieldMetadataCollection,
      });
    };
  }
}
