import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AbilityGuard } from 'src/guards/ability.guard';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { Workspace } from 'src/core/@generated/workspace/workspace.model';
import { CreateOneApiKeyArgs } from 'src/core/@generated/api-key/create-one-api-key.args';
import { ApiKey } from 'src/core/@generated/api-key/api-key.model';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { CreateApiKeyAbilityHandler } from 'src/ability/handlers/api-key.ability-handler';

import { ApiKeyService } from './api-key.service';

@Resolver()
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
}
