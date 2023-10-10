import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { accessibleBy } from '@casl/prisma';

import { AbilityGuard } from 'src/guards/ability.guard';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { Workspace } from 'src/core/@generated/workspace/workspace.model';
import { CreateOneApiKeyArgs } from 'src/core/@generated/api-key/create-one-api-key.args';
import { ApiKey } from 'src/core/@generated/api-key/api-key.model';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  CreateApiKeyAbilityHandler,
  ReadApiKeyAbilityHandler,
} from 'src/ability/handlers/api-key.ability-handler';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { FindManyApiKeyArgs } from 'src/core/@generated/api-key/find-many-api-key.args';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';

import { ApiKeyService } from './api-key.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => ApiKey)
export class ApiKeyResolver {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Mutation(() => ApiKey)
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateApiKeyAbilityHandler)
  async createOneApiKey(
    @Args() args: CreateOneApiKeyArgs,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<Partial<ApiKey>> {
    return this.apiKeyService.createApiKey({
      name: args.data.name,
      workspaceId: workspaceId,
    });
  }

  @Query(() => [ApiKey])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadApiKeyAbilityHandler)
  async findManyApiKey(
    @Args() args: FindManyApiKeyArgs,
    @UserAbility() ability: AppAbility,
  ) {
    return this.apiKeyService.findMany({
      ...args,
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).WorkspaceMember],
          }
        : accessibleBy(ability).WorkspaceMember,
    });
  }
}
