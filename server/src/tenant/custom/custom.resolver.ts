import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Workspace } from '@prisma/client';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';

import { CustomEntity } from './custom.entity';
import { CustomService } from './custom.service';

import { FindManyCustomArgs } from './args/find-many-custom.args';
import { FindUniqueCustomArgs } from './args/find-unique-custom.args';
import { UpdateOneCustomArgs } from './args/update-one-custom.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => CustomEntity)
export class CustomResolver {
  constructor(private readonly customService: CustomService) {}

  @Query(() => [CustomEntity])
  findManyCustom(
    @Args() args: FindManyCustomArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<CustomEntity[]> {
    return this.customService.findManyCustom(args, workspace);
  }

  @Query(() => CustomEntity)
  findUniqueCustom(
    @Args() args: FindUniqueCustomArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<CustomEntity | undefined> {
    return this.customService.findUniqueCustom(args, workspace);
  }

  @Query(() => CustomEntity)
  updateOneCustom(@Args() args: UpdateOneCustomArgs): CustomEntity {
    return {
      id: 'exampleId',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Query(() => CustomEntity)
  deleteOneCustom(@Args() args: UpdateOneCustomArgs): CustomEntity {
    return {
      id: 'exampleId',
      data: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
