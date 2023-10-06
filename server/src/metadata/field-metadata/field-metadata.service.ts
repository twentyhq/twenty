import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldMetadata } from './field-metadata.entity';
import {
  generateColumnName,
  generateTargetColumnMap,
} from './field-metadata.util';

@Injectable()
export class FieldMetadataService {
  constructor(
    @InjectRepository(FieldMetadata, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadata>,
  ) {}

  public async createFieldMetadata(
    displayName: string,
    type: string,
    objectId: string,
    workspaceId: string,
  ): Promise<FieldMetadata> {
    return await this.fieldMetadataRepository.save({
      displayName: displayName,
      type,
      objectId,
      isCustom: true,
      targetColumnName: generateColumnName(displayName), // deprecated
      workspaceId,
      targetColumnMap: generateTargetColumnMap(type),
    });
  }

  public async getFieldMetadataByDisplayNameAndObjectId(
    name: string,
    objectId: string,
  ): Promise<FieldMetadata | null> {
    return await this.fieldMetadataRepository.findOne({
      where: { displayName: name, objectId },
    });
  }
}
