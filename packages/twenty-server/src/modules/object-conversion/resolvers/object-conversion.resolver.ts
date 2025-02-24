import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';

import { ObjectConversionService } from '../services/object-conversion.service';
import { ObjectConversionSettingsEntity } from '../entities/object-conversion-settings.entity';
import { ObjectConversionTemplateEntity } from '../entities/object-conversion-template.entity';

@UseGuards(JwtAuthGuard)
@Resolver()
export class ObjectConversionResolver {
  constructor(private readonly objectConversionService: ObjectConversionService) {}

  // Settings Queries and Mutations
  @Query(() => ObjectConversionSettingsEntity)
  async getObjectConversionSettings(
    @AuthWorkspace() workspaceId: string,
    @Args('objectMetadataId') objectMetadataId: string,
  ) {
    return this.objectConversionService.getObjectConversionSettings(
      workspaceId,
      objectMetadataId,
    );
  }

  @Mutation(() => ObjectConversionSettingsEntity)
  async updateObjectConversionSettings(
    @AuthWorkspace() workspaceId: string,
    @Args('objectMetadataId') objectMetadataId: string,
    @Args('isConversionSource') isConversionSource: boolean,
    @Args('showConvertButton') showConvertButton: boolean,
  ) {
    return this.objectConversionService.updateObjectConversionSettings(
      workspaceId,
      objectMetadataId,
      isConversionSource,
      showConvertButton,
    );
  }

  // Template Queries and Mutations
  @Query(() => [ObjectConversionTemplateEntity])
  async conversionTemplates(@AuthWorkspace() workspaceId: string) {
    return this.objectConversionService.getTemplatesForWorkspace(workspaceId);
  }

  @Query(() => [ObjectConversionTemplateEntity])
  async availableTemplatesForObject(
    @AuthWorkspace() workspaceId: string,
    @Args('objectId') objectId: string,
    @Args('recordId') recordId: string,
  ) {
    return this.objectConversionService.getTemplatesForObject(
      workspaceId,
      objectId,
      recordId,
    );
  }

  @Mutation(() => ObjectConversionTemplateEntity)
  async createConversionTemplate(
    @AuthWorkspace() workspaceId: string,
    @Args('input') input: any,
  ) {
    return this.objectConversionService.createTemplate({
      ...input,
      workspaceId,
    });
  }

  @Mutation(() => ObjectConversionTemplateEntity)
  async updateConversionTemplate(
    @AuthWorkspace() workspaceId: string,
    @Args('input') input: any,
  ) {
    return this.objectConversionService.updateTemplate(workspaceId, input);
  }

  @Mutation(() => Boolean)
  async deleteConversionTemplate(
    @AuthWorkspace() workspaceId: string,
    @Args('templateId') templateId: string,
  ) {
    return this.objectConversionService.deleteTemplate(workspaceId, templateId);
  }

  @Mutation(() => [ObjectConversionTemplateEntity])
  async reorderConversionTemplates(
    @AuthWorkspace() workspaceId: string,
    @Args('templateIds', { type: () => [String] }) templateIds: string[],
  ) {
    return this.objectConversionService.reorderTemplates(workspaceId, templateIds);
  }

  @Mutation(() => ConversionResult)
  async convertObject(
    @AuthWorkspace() workspaceId: string,
    @Args('objectId') objectId: string,
    @Args('recordId') recordId: string,
    @Args('templateId') templateId: string,
  ) {
    return this.objectConversionService.convertObject(
      workspaceId,
      objectId,
      recordId,
      templateId,
    );
  }
}

// GraphQL Types
class ConversionResult {
  success: boolean;
  convertedObjectId: string;
  convertedObjectType: string;
}
