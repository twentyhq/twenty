import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Workspace } from '@prisma/client';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';

import { UniversalEntity, PaginatedUniversalEntity } from './universal.entity';
import { UnivervalService } from './universal.service';

import { FindManyUniversalArgs } from './args/find-many-universal.args';
import { FindUniqueUniversalArgs } from './args/find-unique-universal.args';
import { UpdateOneCustomArgs } from './args/update-one-custom.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => UniversalEntity)
export class CustomResolver {
  constructor(private readonly customService: UnivervalService) {}

  @Query(() => PaginatedUniversalEntity)
  findMany(
    @Args() args: FindManyUniversalArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<PaginatedUniversalEntity> {
    return this.customService.findManyUniversal(args, workspace);
  }

  @Query(() => UniversalEntity)
  findUnique(
    @Args() args: FindUniqueUniversalArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<UniversalEntity | undefined> {
    return this.customService.findUniqueUniversal(args, workspace);
  }

  @Query(() => UniversalEntity)
  updateOneCustom(@Args() args: UpdateOneCustomArgs): UniversalEntity {
    return {
      id: 'exampleId',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Query(() => UniversalEntity)
  deleteOneCustom(@Args() args: UpdateOneCustomArgs): UniversalEntity {
    return {
      id: 'exampleId',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
