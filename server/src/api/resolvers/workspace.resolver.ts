import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../models/user.model';
import { WorkspaceRepository } from 'src/entities/workspace/workspace.repository';
import { Workspace } from '../models/workspace.model';

@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  @Query(() => [Workspace])
  async getWorkspaces() {
    return this.workspaceRepository.findMany({});
  }
}
