import { Args, Field, InputType, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/core-modules/auth/guards/jwt.auth.guard';

import { ConversionTemplateService } from './conversion-template.service';
import { ConversionTemplateEntity, TemplateMatchingRule as EntityTemplateMatchingRule } from './conversion-template.entity';

@InputType()
class ConversionSettingsInput {
  @Field(() => Boolean)
  keepOriginalLead: boolean;

  @Field(() => Boolean)
  createRelations: boolean;

  @Field(() => Boolean)
  markAsConverted: boolean;
}

@InputType()
class TemplateMatchingRuleInput {
  @Field(() => String)
  fieldName: string;

  @Field(() => String)
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches';

  @Field(() => String)
  value: any;
}

@InputType()
class CreateTemplateInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  sourceLeadType: string;

  @Field(() => String)
  targetObjectType: string;

  @Field(() => [String])
  fieldMappingRules: any[];

  @Field(() => ConversionSettingsInput)
  conversionSettings: ConversionSettingsInput;

  @Field(() => [TemplateMatchingRuleInput], { nullable: true })
  matchingRules?: EntityTemplateMatchingRule[];

  @Field(() => Boolean, { nullable: true })
  isDefault?: boolean;

  @Field(() => Number)
  orderIndex: number;
}

@InputType()
class UpdateTemplateInput {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  fieldMappingRules?: any[];

  @Field(() => ConversionSettingsInput, { nullable: true })
  conversionSettings?: ConversionSettingsInput;

  @Field(() => [TemplateMatchingRuleInput], { nullable: true })
  matchingRules?: EntityTemplateMatchingRule[];

  @Field(() => Boolean, { nullable: true })
  isDefault?: boolean;

  @Field(() => Number, { nullable: true })
  orderIndex?: number;
}

@UseGuards(JwtAuthGuard)
@Resolver(() => ConversionTemplateEntity)
export class ConversionTemplateResolver {
  constructor(
    private readonly conversionTemplateService: ConversionTemplateService,
  ) {}

  @Mutation(() => ConversionTemplateEntity)
  async createConversionTemplate(
    @AuthWorkspace() workspaceId: string,
    @Args('input') input: CreateTemplateInput,
  ) {
    return this.conversionTemplateService.createTemplate({
      ...input,
      workspaceId,
    });
  }

  @Mutation(() => ConversionTemplateEntity)
  async updateConversionTemplate(
    @AuthWorkspace() workspaceId: string,
    @Args('input') input: UpdateTemplateInput,
  ) {
    return this.conversionTemplateService.updateTemplate(
      workspaceId,
      input,
    );
  }

  @Mutation(() => Boolean)
  async deleteConversionTemplate(
    @AuthWorkspace() workspaceId: string,
    @Args('templateId') templateId: string,
  ) {
    return this.conversionTemplateService.deleteTemplate(
      workspaceId,
      templateId,
    );
  }

  @Query(() => [ConversionTemplateEntity])
  async conversionTemplates(@AuthWorkspace() workspaceId: string) {
    return this.conversionTemplateService.getTemplatesForWorkspace(workspaceId);
  }

  @Query(() => [ConversionTemplateEntity])
  async availableTemplatesForLead(
    @AuthWorkspace() workspaceId: string,
    @Args('leadId') leadId: string,
  ) {
    return this.conversionTemplateService.getTemplatesForLead(
      workspaceId,
      leadId,
    );
  }

  @Mutation(() => [ConversionTemplateEntity])
  async reorderConversionTemplates(
    @AuthWorkspace() workspaceId: string,
    @Args('templateIds', { type: () => [String] }) templateIds: string[],
  ) {
    return this.conversionTemplateService.reorderTemplates(
      workspaceId,
      templateIds,
    );
  }
}
