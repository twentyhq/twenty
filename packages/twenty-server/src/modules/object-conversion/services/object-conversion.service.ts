import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectConversionSettingsEntity } from 'src/modules/object-conversion/entities/object-conversion-settings.entity';
import {
  ObjectConversionTemplateEntity,
  TemplateMatchingRule,
} from 'src/modules/object-conversion/entities/object-conversion-template.entity';

interface CreateTemplateInput {
  name: string;
  description?: string;
  sourceObjectMetadataId: string;
  targetObjectMetadataId: string;
  fieldMappingRules: any[];
  conversionSettings: {
    keepOriginalObject: boolean;
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
    keepOriginalObject: boolean;
    createRelations: boolean;
    markAsConverted: boolean;
  };
  matchingRules?: TemplateMatchingRule[];
  isDefault?: boolean;
  orderIndex?: number;
}

@Injectable()
export class ObjectConversionService {
  constructor(
    @InjectRepository(ObjectConversionSettingsEntity)
    private readonly settingsRepository: Repository<ObjectConversionSettingsEntity>,
    @InjectRepository(ObjectConversionTemplateEntity)
    private readonly templateRepository: Repository<ObjectConversionTemplateEntity>,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async createTemplate(
    input: CreateTemplateInput,
  ): Promise<ObjectConversionTemplateEntity> {
    // Validate target object exists
    const targetObject = await this.objectMetadataService.findOneWithinWorkspace(
      input.workspaceId,
      {
        where: { id: input.targetObjectMetadataId },
      },
    );

    if (!targetObject) {
      throw new Error(`Target object type "${input.targetObjectType}" not found`);
    }

    // If setting as default, unset any existing default for this source object
    if (input.isDefault) {
      await this.templateRepository.update(
        {
          workspaceId: input.workspaceId,
          sourceObjectMetadataId: input.sourceObjectMetadataId,
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
  ): Promise<ObjectConversionTemplateEntity> {
    const template = await this.templateRepository.findOneBy({
      id: input.id,
      workspaceId,
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // If setting as default, unset any existing default for this source object
    if (input.isDefault) {
      await this.templateRepository.update(
        {
          workspaceId,
          sourceObjectMetadataId: template.sourceObjectMetadataId,
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
  ): Promise<ObjectConversionTemplateEntity[]> {
    return this.templateRepository.find({
      where: { workspaceId },
      order: { orderIndex: 'ASC' },
    });
  }

  async getTemplatesForObject(
    workspaceId: string,
    objectId: string,
    recordId: string,
  ): Promise<ObjectConversionTemplateEntity[]> {
    const templates = await this.templateRepository.find({
      where: { workspaceId, sourceObjectMetadataId: objectId },
      order: { orderIndex: 'ASC' },
    });

    if (!templates.length) {
      return [];
    }

    // Get the record data to check matching rules
    const object = await this.objectMetadataService.findOneWithinWorkspace(
      workspaceId,
      { where: { id: objectId } },
    );

    if (!object) {
      throw new Error('Object not found');
    }

    const dataSource = await this.workspaceDataSourceService
      .connectToWorkspaceDataSource(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    try {
      const record = await queryRunner.manager
        .createQueryBuilder()
        .select('*')
        .from(object.targetTableName, 'record')
        .where('id = :id', { id: recordId })
        .getRawOne();

      return templates.filter((template) =>
        this.recordMatchesTemplate(record, template),
      );
    } finally {
      await queryRunner.release();
    }
  }

  private recordMatchesTemplate(
    record: any,
    template: ObjectConversionTemplateEntity,
  ): boolean {
    if (!template.matchingRules?.length) {
      return true;
    }

    return template.matchingRules.every((rule) => {
      const fieldValue = record[rule.fieldName];
      
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
  ): Promise<ObjectConversionTemplateEntity[]> {
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

  async convertObject(
    workspaceId: string,
    objectId: string,
    recordId: string,
    templateId: string,
  ) {
    const template = await this.templateRepository.findOneBy({
      id: templateId,
      workspaceId,
    });

    if (!template) {
      throw new Error('Template not found');
    }

    const dataSource = await this.workspaceDataSourceService
      .connectToWorkspaceDataSource(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get source and target objects
      const sourceObject = await this.objectMetadataService.findOneWithinWorkspace(
        workspaceId,
        {
          where: { id: template.sourceObjectMetadataId },
        },
      );

      const targetObject = await this.objectMetadataService.findOneWithinWorkspace(
        workspaceId,
        {
          where: { id: template.targetObjectMetadataId },
        },
      );

      if (!sourceObject || !targetObject) {
        throw new Error('Source or target object not found');
      }

      // Get source record
      const sourceRecord = await queryRunner.manager
        .createQueryBuilder()
        .select('*')
        .from(sourceObject.targetTableName, 'record')
        .where('id = :id', { id: recordId })
        .getRawOne();

      if (!sourceRecord) {
        throw new Error('Source record not found');
      }

      // Map fields according to template
      const mappedData = this.mapFieldValues(
        sourceRecord,
        template.fieldMappingRules,
      );

      // Create new record in target object
      const insertResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(targetObject.targetTableName)
        .values(mappedData)
        .execute();

      const convertedObjectId = insertResult.identifiers[0].id;

      // Update source record if needed
      if (!template.conversionSettings.keepOriginalObject) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(sourceObject.targetTableName)
          .set({
            isConverted: true,
            convertedAt: new Date(),
            convertedToObjectId: convertedObjectId,
            convertedToObjectType: targetObject.nameSingular,
          })
          .where('id = :id', { id: recordId })
          .execute();
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        convertedObjectId,
        convertedObjectType: targetObject.nameSingular,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private mapFieldValues(
    sourceRecord: any,
    fieldMappingRules: any[],
  ): Record<string, any> {
    const mappedData: Record<string, any> = {};

    for (const mapping of fieldMappingRules) {
      if (sourceRecord[mapping.sourceField] !== undefined) {
        mappedData[mapping.targetField] = sourceRecord[mapping.sourceField];
      }
    }

    return mappedData;
  }
}
