import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';

import { accessibleBy } from '@casl/prisma';
import { v4 } from 'uuid';

import { AbilityGuard } from 'src/guards/ability.guard';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { Workspace } from 'src/core/@generated/workspace/workspace.model';
import { CreateOneApiKeyArgs } from 'src/core/@generated/api-key/create-one-api-key.args';
import { ApiKey } from 'src/core/@generated/api-key/api-key.model';
import { FindManyApiKeyArgs } from 'src/core/@generated/api-key/find-many-api-key.args';
import { DeleteOneApiKeyArgs } from 'src/core/@generated/api-key/delete-one-api-key.args';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  CreateApiKeyAbilityHandler,
  DeleteApiKeyAbilityHandler,
  ReadApiKeyAbilityHandler,
} from 'src/ability/handlers/api-key.ability-handler';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { TokenService } from 'src/core/auth/services/token.service';

import { ApiKeyService } from './api-key.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => ApiKey)
export class ApiKeyResolver {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly tokenService: TokenService,
  ) {}

  @Mutation(() => ApiKey)
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateApiKeyAbilityHandler)
  async createOneApiKey(
    @Args() args: CreateOneApiKeyArgs,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<Partial<ApiKey>> {
    const apiKeyId = v4();
    const customApiKey = await this.tokenService.generateApiKeyToken(
      workspaceId,
      apiKeyId,
      args.data.expiresAt,
    );
    await this.apiKeyService.create({
      data: {
        id: apiKeyId,
        key: customApiKey.token,
        expiresAt: customApiKey.expiresAt,
        name: args.data.name,
        workspaceId: workspaceId,
      },
    });
    return this.apiKeyService.findUniqueOrThrow({
      where: { key: customApiKey.token },
    });
  }

  @Mutation(() => ApiKey)
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteApiKeyAbilityHandler)
  async deleteOneApiKey(
    @Args() args: DeleteOneApiKeyArgs,
  ): Promise<Partial<ApiKey>> {
    const apiKeyToDelete = await this.apiKeyService.findFirst({
      where: { ...args.where },
    });
    if (!apiKeyToDelete) {
      throw new NotFoundException();
    }
    return this.apiKeyService.delete({
      where: args.where,
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
