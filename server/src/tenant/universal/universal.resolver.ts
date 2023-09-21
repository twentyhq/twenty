import { Args, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';

import { Workspace } from '@prisma/client';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { UniversalEntity, PaginatedUniversalEntity } from './universal.entity';
import { UniversalService } from './universal.service';

import { FindManyUniversalArgs } from './args/find-many-universal.args';
import { FindUniqueUniversalArgs } from './args/find-unique-universal.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => UniversalEntity)
export class UniversalResolver {
  constructor(
    private readonly customService: UniversalService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Query(() => PaginatedUniversalEntity)
  findMany(
    @Args() args: FindManyUniversalArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PaginatedUniversalEntity> {
    if (!this.environmentService.isFlexibleBackendEnabled()) {
      throw new ForbiddenException();
    }

    return this.customService.findManyUniversal(args, workspace);
  }

  @Query(() => UniversalEntity)
  findUnique(
    @Args() args: FindUniqueUniversalArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<UniversalEntity | undefined> {
    if (!this.environmentService.isFlexibleBackendEnabled()) {
      throw new ForbiddenException();
    }

    return this.customService.findUniqueUniversal(args, workspace);
  }

  @Query(() => UniversalEntity)
  updateOneCustom(): UniversalEntity {
    if (!this.environmentService.isFlexibleBackendEnabled()) {
      throw new ForbiddenException();
    }

    return {
      id: 'exampleId',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Query(() => UniversalEntity)
  deleteOneCustom(): UniversalEntity {
    if (!this.environmentService.isFlexibleBackendEnabled()) {
      throw new ForbiddenException();
    }

    return {
      id: 'exampleId',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
