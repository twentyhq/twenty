import { Injectable } from '@nestjs/common';

import {
  Resolver,
  FindOneResolverArgs,
  ExecuteQuickActionOnOneResolverArgs,
  DeleteOneResolverArgs,
} from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { Record as IRecord } from 'src/workspace/workspace-query-builder/interfaces/record.interface';
import { WorkspaceSchemaBuilderContext } from 'src/workspace/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';
import { WorkspaceResolverBuilderFactoryInterface } from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import { WorkspaceQueryRunnerOptions } from 'src/workspace/workspace-query-runner/interfaces/query-runner-optionts.interface';

import { WorkspaceQueryRunnerService } from 'src/workspace/workspace-query-runner/workspace-query-runner.service';
import { QuickActionsService } from 'src/core/quick-actions/quick-actions.service';

@Injectable()
export class ExecuteQuickActionOnOneResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = 'executeQuickActionOnOne' as const;

  constructor(
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly quickActionsService: QuickActionsService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<ExecuteQuickActionOnOneResolverArgs> {
    const internalContext = context;

    return (_source, args, context, info) => {
      return this.executeQuickActionOnOne(args, {
        targetTableName: internalContext.targetTableName,
        workspaceId: internalContext.workspaceId,
        info,
        fieldMetadataCollection: internalContext.fieldMetadataCollection,
      });
    };
  }

  private async executeQuickActionOnOne<Record extends IRecord = IRecord>(
    args: DeleteOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    switch (options.targetTableName) {
      case 'company': {
        await this.quickActionsService.executeQuickActionOnCompany(
          args.id,
          options.workspaceId,
        );
        break;
      }
      case 'person': {
        await this.quickActionsService.createCompanyFromPerson(
          args.id,
          options.workspaceId,
        );
        break;
      }
      default:
        // TODO: different quick actions per object on frontend
        break;
    }

    return this.workspaceQueryRunnerService.findOne(
      { filter: { id: { eq: args.id } } } as FindOneResolverArgs,
      options,
    );
  }
}
