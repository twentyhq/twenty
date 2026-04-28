import { msg } from '@lingui/core/macro';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  CyclicDependencyError,
  CyclicDependencyValidatorService,
} from 'src/modules/opportunity/services/cyclic-dependency-validator.service';

type CreateMilestoneDependencyPayload = {
  id?: string;
  dependentMilestoneId: string;
  requiredMilestoneId: string;
  description?: string | null;
  position?: number;
};

@WorkspaceQueryHook(`opportunityMilestoneDependency.createOne`)
export class OpportunityMilestoneDependencyCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly cyclicDependencyValidatorService: CyclicDependencyValidatorService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<CreateMilestoneDependencyPayload>,
  ): Promise<CreateOneResolverArgs<CreateMilestoneDependencyPayload>> {
    const { dependentMilestoneId, requiredMilestoneId } = payload.data;

    if (!dependentMilestoneId || !requiredMilestoneId) {
      throw new CommonQueryRunnerException(
        'Both dependentMilestoneId and requiredMilestoneId are required',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        {
          userFriendlyMessage: msg`Both milestones are required to create a dependency.`,
        },
      );
    }

    try {
      await this.cyclicDependencyValidatorService.validateNoCycle(
        dependentMilestoneId,
        requiredMilestoneId,
        authContext.workspace.id,
      );
    } catch (error) {
      if (error instanceof CyclicDependencyError) {
        throw new CommonQueryRunnerException(
          error.message,
          CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          {
            userFriendlyMessage: msg`This dependency would create a cycle between milestones.`,
          },
        );
      }
      throw error;
    }

    return payload;
  }
}
