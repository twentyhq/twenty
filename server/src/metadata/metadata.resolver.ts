import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Workspace } from '@prisma/client';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';

import { MetadataService } from './metadata.service';

import { CreateCustomFieldInput } from './args/create-custom-field.input';

@UseGuards(JwtAuthGuard)
@Resolver()
export class MetadataResolver {
  constructor(private readonly metadataService: MetadataService) {}

  @Query(() => String)
  async hello(): Promise<string> {
    return 'Hello World!';
  }

  @Mutation(() => String)
  async createCustomField(
    @Args() createCustomFieldInput: CreateCustomFieldInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<string> {
    return this.metadataService.createCustomField(
      createCustomFieldInput.displayName,
      createCustomFieldInput.objectId,
      createCustomFieldInput.type,
      workspace.id,
    );
  }
}
