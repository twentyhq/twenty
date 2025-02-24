import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ConversionTemplateEntity, TemplateMatchingRule } from './conversion-template.entity';
import { LeadWorkspaceEntity } from '../standard-objects/lead.workspace-entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

interface CreateTemplateInput {
  name: string;
  description?: string;
  sourceLeadType: string;
  targetObjectType: string;
  fieldMappingRules: any[];
  conversionSettings: {
    keepOriginalLead: boolean;
    createRelations: boolean;
    markAsConverted: boolean;
  };
  matchingRules?: TemplateMatchingRule[];
  isDefault?: boolean;
  orderIndex: number;
  workspaceId: string;
}

interface UpdateTemplateInput {
  id: string;
  name?: string;
  description?: string;
  fieldMappingRules?: any[];
  conversionSettings?: {
    keepOriginalLead: boolean;
    createRelations: boolean;
    markAsConverted: boolean;
  };
  matchingRules?: TemplateMatchingRule[];
  isDefault?: boolean;
  orderIndex?: number;
}

@Injectable()
export class ConversionTemplateService {
  constructor(
    @InjectRepository(ConversionTemplateEntity)
    private readonly templateRepository: Repository<ConversionTemplateEntity>,
    @InjectRepository(LeadWorkspaceEntity, 'metadata')
    private readonly leadRepository: Repository<LeadWorkspaceEntity>,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  async createTemplate(input: CreateTemplateInput): Promise<ConversionTemplateEntity> {
    // Validate target object exists
    const targetObject = await this.objectMetadataService.findOneWithinWorkspace(
      input.workspaceId,
      { where: { nameSingular: input.targetObjectType } },
    );

    if (!targetObject) {
      throw new Error(`Target object type "${input.targetObjectType}" not found`);
    }

    // If setting as default, unset any existing default for this source lead type
    if (input.isDefault) {
      await this.templateRepository.update(
        {
          workspaceId: input.workspaceId,
          sourceLeadType: input.sourceLeadType,
          isDefault: true,
        },
        { isDefault: false },
      );
    }

    const template = this.templateRepository.create(input);
    return this.templateRepository.save(template);
  }

  async updateTemplate(
    workspaceId: string,
    input: UpdateTemplateInput,
  ): Promise<ConversionTemplateEntity> {
    const template = await this.templateRepository.findOneBy({
      id: input.id,
      workspaceId,
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // If setting as default, unset any existing default for this source lead type
    if (input.isDefault) {
      await this.templateRepository.update(
        {
          workspaceId,
          sourceLeadType: template.sourceLeadType,
          isDefault: true,
          id: input.id,
        },
        { isDefault: false },
      );
    }

    Object.assign(template, input);
    return this.templateRepository.save(template);
  }

  async deleteTemplate(
    workspaceId: string,
    templateId: string,
  ): Promise<boolean> {
    const result = await this.templateRepository.delete({
      id: templateId,
      workspaceId,
    });
    return result.affected ? result.affected > 0 : false;
  }

  async getTemplatesForWorkspace(
    workspaceId: string,
  ): Promise<ConversionTemplateEntity[]> {
    return this.templateRepository.find({
      where: { workspaceId },
      order: { orderIndex: 'ASC' },
    });
  }

  async getTemplatesForLead(
    workspaceId: string,
    leadId: string,
  ): Promise<ConversionTemplateEntity[]> {
    // Find lead in the workspace
    const lead = await this.leadRepository.findOne({
      where: {
        id: leadId,
      },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Get all templates for this lead type in the workspace
    const templates = await this.templateRepository.find({
      where: { 
        workspaceId,
        sourceLeadType: lead.constructor.name,
      },
      order: { orderIndex: 'ASC' },
    });

    return templates.filter((template) => this.matchesTemplate(lead, template));
  }

  private matchesTemplate(
    lead: LeadWorkspaceEntity,
    template: ConversionTemplateEntity,
  ): boolean {
    if (!template.matchingRules?.length) {
      return true;
    }

    return template.matchingRules.every((rule) => {
      const fieldValue = lead[rule.fieldName];
      
      switch (rule.operator) {
        case 'equals':
          return fieldValue === rule.value;
        case 'contains':
          return String(fieldValue).includes(String(rule.value));
        case 'startsWith':
          return String(fieldValue).startsWith(String(rule.value));
        case 'endsWith':
          return String(fieldValue).endsWith(String(rule.value));
        case 'matches':
          return new RegExp(rule.value).test(String(fieldValue));
        default:
          return false;
      }
    });
  }

  async reorderTemplates(
    workspaceId: string,
    templateIds: string[],
  ): Promise<ConversionTemplateEntity[]> {
    // Find all templates in the given order
    const templates = await this.templateRepository.find({
      where: {
        id: In(templateIds),
        workspaceId,
      },
    });

    if (templates.length !== templateIds.length) {
      throw new Error('Some templates not found');
    }

    const updates = templateIds.map((id, index) => ({
      id,
      orderIndex: index,
    }));

    await Promise.all(
      updates.map((update) =>
        this.templateRepository.update(update.id, {
          orderIndex: update.orderIndex,
        }),
      ),
    );

    return this.getTemplatesForWorkspace(workspaceId);
  }
}
