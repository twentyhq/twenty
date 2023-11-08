import { Injectable } from '@nestjs/common';

import {
  CreateManyResolverArgs,
  Resolver,
} from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { SchemaBuilderContext } from 'src/tenant/schema-builder/interfaces/schema-builder-context.interface';
import { ResolverBuilderFactoryInterface } from 'src/tenant/resolver-builder/interfaces/resolver-builder-factory.interface';

import { QueryRunnerService } from 'src/tenant/query-runner/query-runner.service';

@Injectable()
export class CreateManyResolverFactory
  implements ResolverBuilderFactoryInterface
{
  public static methodName = 'createMany' as const;

  constructor(private readonly queryRunnerService: QueryRunnerService) {}

  create(context: SchemaBuilderContext): Resolver<CreateManyResolverArgs> {
    const internalContext = context;

    return (_source, args, context, info) => {
      const runner = this.queryRunnerService.init({
        targetTableName: internalContext.targetTableName,
        workspaceId: internalContext.workspaceId,
        info,
        fieldMetadataCollection: internalContext.fieldMetadataCollection,
      });

      return runner.createMany(args);
    };
  }
}
