import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { LeadWorkspaceEntity } from '../standard-objects/lead.workspace-entity';

interface ConversionFieldMapping {
  sourceField: string;
  targetField: string;
}

interface ConversionSettings {
  keepOriginalLead: boolean;
  createRelations: boolean;
}

@Injectable()
export class LeadConversionService {
  constructor(
    @InjectRepository(LeadWorkspaceEntity, 'metadata')
    private readonly leadRepository: Repository<LeadWorkspaceEntity>,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async convertLead(
    workspaceId: string,
    leadId: string,
    targetObjectMetadataId: string,
    fieldMapping: ConversionFieldMapping[],
    settings: ConversionSettings,
  ) {
    const queryRunner = this.workspaceDataSourceService
      .getWorkspaceDataSource(workspaceId)
      .createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get lead data
      const lead = await this.leadRepository.findOneOrFail({
        where: { id: leadId, workspaceId },
      });

      // Get target object metadata
      const targetObjectMetadata = await this.objectMetadataService.findOneWithinWorkspace(
        workspaceId,
        { where: { id: targetObjectMetadataId } },
      );

      if (!targetObjectMetadata) {
        throw new Error('Target object metadata not found');
      }

      // Create new record in target object
      const targetTableName = targetObjectMetadata.targetTableName;
      const mappedData = this.mapFieldValues(lead, fieldMapping);

      const insertResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(targetTableName)
        .values(mappedData)
        .execute();

      const convertedObjectId = insertResult.identifiers[0].id;

      // Update lead status and tracking fields
      if (!settings.keepOriginalLead) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(LeadWorkspaceEntity)
          .set({
            status: 'CONVERTED',
            convertedAt: new Date(),
            convertedToObjectId: convertedObjectId,
            convertedToObjectType: targetObjectMetadata.nameSingular,
          })
          .where('id = :id', { id: leadId })
          .execute();
      }

      // Create relations if needed
      if (settings.createRelations) {
        await this.createRelations(
          queryRunner,
          workspaceId,
          lead,
          convertedObjectId,
          targetObjectMetadata,
        );
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        convertedObjectId,
        convertedObjectType: targetObjectMetadata.nameSingular,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private mapFieldValues(
    lead: LeadWorkspaceEntity,
    fieldMapping: ConversionFieldMapping[],
  ) {
    const mappedData: Record<string, any> = {};

    for (const mapping of fieldMapping) {
      if (lead[mapping.sourceField] !== undefined) {
        mappedData[mapping.targetField] = lead[mapping.sourceField];
      }
    }

    return mappedData;
  }

  private async createRelations(
    queryRunner: any,
    workspaceId: string,
    lead: LeadWorkspaceEntity,
    convertedObjectId: string,
    targetObjectMetadata: any,
  ) {
    // Implementation will depend on the specific relations needed
    // For example, creating task relations, note relations, etc.
    // This would involve:
    // 1. Identifying relevant relations from the lead
    // 2. Creating corresponding relations for the converted object
    // 3. Updating any reference tables as needed
  }

  async getAvailableTargetObjects(workspaceId: string) {
    // Get all standard and custom objects that leads can be converted to
    const objects = await this.objectMetadataService.findManyWithinWorkspace(
      workspaceId,
      {
        where: {
          isActive: true,
          // Exclude certain system objects or other objects that shouldn't be conversion targets
          isSystem: false,
        },
      },
    );

    return objects.map((object) => ({
      id: object.id,
      nameSingular: object.nameSingular,
      namePlural: object.namePlural,
      labelSingular: object.labelSingular,
      labelPlural: object.labelPlural,
      icon: object.icon,
      isCustom: object.isCustom,
    }));
  }

  async getFieldMappingSuggestions(
    workspaceId: string,
    targetObjectMetadataId: string,
  ) {
    // Get lead fields
    const leadFields = await this.fieldMetadataService.findMany({
      where: {
        workspaceId,
        objectMetadataId: 'lead_object_id', // This would need to be the actual lead object metadata ID
      },
    });

    // Get target object fields
    const targetFields = await this.fieldMetadataService.findMany({
      where: {
        workspaceId,
        objectMetadataId: targetObjectMetadataId,
      },
    });

    // Generate mapping suggestions based on:
    // 1. Field names
    // 2. Field types
    // 3. Common patterns (e.g. email fields, phone fields, etc.)
    const suggestions: ConversionFieldMapping[] = [];

    for (const leadField of leadFields) {
      // Find matching target fields
      const matchingFields = targetFields.filter((targetField) => {
        // Match by name
        if (targetField.name === leadField.name) return true;

        // Match by type
        if (targetField.type === leadField.type) {
          // Additional type-specific matching logic
          switch (leadField.type) {
            case 'EMAIL':
              return targetField.name.includes('email');
            case 'PHONE':
              return targetField.name.includes('phone');
            // Add more type-specific matching
            default:
              return false;
          }
        }

        return false;
      });

      if (matchingFields.length > 0) {
        suggestions.push({
          sourceField: leadField.name,
          targetField: matchingFields[0].name, // Use the first match
        });
      }
    }

    return suggestions;
  }
}
