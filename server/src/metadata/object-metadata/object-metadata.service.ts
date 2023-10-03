import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ObjectMetadata } from './object-metadata.entity';

@Injectable()
export class ObjectMetadataService {
  constructor(
    @InjectRepository(ObjectMetadata, 'metadata')
    private readonly fieldMetadataRepository: Repository<ObjectMetadata>,
  ) {}

  public async getObjectMetadataFromDataSourceId(dataSourceId: string) {
    return this.fieldMetadataRepository.find({
      where: { dataSourceId },
      relations: ['fields'],
    });
  }

  public async getObjectMetadataFromId(objectMetadataId: string) {
    return this.fieldMetadataRepository.findOne({
      where: { id: objectMetadataId },
      relations: ['fields'],
    });
  }
}
