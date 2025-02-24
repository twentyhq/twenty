import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { LeadConversionService } from '../services/lead-conversion.service';

@UseGuards(JwtAuthGuard)
@Resolver()
export class LeadConversionResolver {
  constructor(private readonly leadConversionService: LeadConversionService) {}

  @Mutation(() => LeadConversionResult)
  async convertLead(
    @AuthWorkspace() workspaceId: string,
    @Args('leadId') leadId: string,
    @Args('targetObjectMetadataId') targetObjectMetadataId: string,
    @Args('fieldMapping', { type: () => [ConversionFieldMappingInput] })
    fieldMapping: ConversionFieldMappingInput[],
    @Args('settings', { type: () => ConversionSettingsInput })
    settings: ConversionSettingsInput,
  ) {
    return this.leadConversionService.convertLead(
      workspaceId,
      leadId,
      targetObjectMetadataId,
      fieldMapping,
      settings,
    );
  }

  @Query(() => [AvailableTargetObject])
  async getAvailableTargetObjects(@AuthWorkspace() workspaceId: string) {
    return this.leadConversionService.getAvailableTargetObjects(workspaceId);
  }

  @Query(() => [ConversionFieldMapping])
  async getFieldMappingSuggestions(
    @AuthWorkspace() workspaceId: string,
    @Args('targetObjectMetadataId') targetObjectMetadataId: string,
  ) {
    return this.leadConversionService.getFieldMappingSuggestions(
      workspaceId,
      targetObjectMetadataId,
    );
  }
}

// GraphQL Input Types
class ConversionFieldMappingInput {
  sourceField: string;
  targetField: string;
}

class ConversionSettingsInput {
  keepOriginalLead: boolean;
  createRelations: boolean;
}

// GraphQL Output Types
class LeadConversionResult {
  success: boolean;
  convertedObjectId: string;
  convertedObjectType: string;
}

class AvailableTargetObject {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  icon: string;
  isCustom: boolean;
}

class ConversionFieldMapping {
  sourceField: string;
  targetField: string;
}
