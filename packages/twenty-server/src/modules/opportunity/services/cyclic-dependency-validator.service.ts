import { Injectable } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { OpportunityMilestoneDependencyWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity-milestone-dependency.workspace-entity';

// Maximum depth the BFS will walk before giving up. Acts as a safety net
// if the graph somehow already contains a cycle (e.g. from a REST write
// that bypassed the GraphQL hook). Far above realistic project depth.
const MAX_BFS_DEPTH = 200;

export class CyclicDependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CyclicDependencyError';
  }
}

@Injectable()
export class CyclicDependencyValidatorService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  // Validates that adding the edge `dependent → required` would not
  // create a cycle. A cycle exists if `required` already (transitively)
  // depends on `dependent` — i.e. walking the existing graph from
  // `required` through the `dependsOn` direction reaches `dependent`.
  // Throws `CyclicDependencyError` on cycle or self-reference; resolves
  // void on success.
  async validateNoCycle(
    dependentMilestoneId: string,
    requiredMilestoneId: string,
    workspaceId: string,
  ): Promise<void> {
    if (dependentMilestoneId === requiredMilestoneId) {
      throw new CyclicDependencyError(
        'A milestone cannot depend on itself.',
      );
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const repository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            OpportunityMilestoneDependencyWorkspaceEntity,
            {
              shouldBypassPermissionChecks: true,
            },
          );

        const visited = new Set<string>();
        // BFS frontier: ids whose `dependsOn` predecessors we still need
        // to enumerate. Start at `requiredMilestoneId` because we want to
        // know "would adding this edge make `dependentId` reachable from
        // `requiredId`?" — if yes, there's a cycle.
        let frontier: string[] = [requiredMilestoneId];

        for (let depth = 0; depth < MAX_BFS_DEPTH; depth++) {
          if (frontier.length === 0) return;

          if (frontier.includes(dependentMilestoneId)) {
            throw new CyclicDependencyError(
              'This dependency would create a cycle.',
            );
          }

          const newlyVisited = frontier.filter(
            (id) => !visited.has(id),
          );

          newlyVisited.forEach((id) => visited.add(id));

          if (newlyVisited.length === 0) return;

          // Find all edges where any of these milestones is the dependent
          // — those are predecessors we still need to explore.
          const predecessorEdges = await repository.find({
            where: newlyVisited.map((id) => ({
              dependentMilestoneId: id,
            })),
            select: ['requiredMilestoneId'],
          });

          frontier = predecessorEdges
            .map((edge) => edge.requiredMilestoneId)
            .filter((id): id is string => id !== null);
        }

        // Reached MAX_BFS_DEPTH without confirming no-cycle — defensive:
        // assume cycle to keep the graph clean. In practice the graph
        // should never be 200 levels deep.
        throw new CyclicDependencyError(
          'Dependency graph is too deep to validate safely.',
        );
      },
      authContext,
    );
  }
}
