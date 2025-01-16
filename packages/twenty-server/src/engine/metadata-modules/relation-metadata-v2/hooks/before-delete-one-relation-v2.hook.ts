import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  BeforeDeleteOneHook,
  DeleteOneInputType,
} from '@ptc-org/nestjs-query-graphql';
import { Repository } from 'typeorm';

import { RelationMetadataV2Entity } from 'src/engine/metadata-modules/relation-metadata-v2/relation-metadata-v2.entity';

@Injectable()
export class BeforeDeleteOneRelationV2 implements BeforeDeleteOneHook {
  constructor(
    @InjectRepository(RelationMetadataV2Entity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataV2Entity>,
  ) {}

  async run(
    instance: DeleteOneInputType,
    context: any,
  ): Promise<DeleteOneInputType> {
    const workspaceId = context?.req?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const relationMetadata = await this.relationMetadataRepository.findOne({
      where: {
        workspaceId,
        id: instance.id.toString(),
      },
      relations: ['sourceFieldMetadata', 'targetFieldMetadata'],
    });

    if (!relationMetadata) {
      throw new BadRequestException('Relation does not exist');
    }

    if (
      !relationMetadata.sourceFieldMetadata.isCustom ||
      !relationMetadata.targetFieldMetadata.isCustom
    ) {
      throw new BadRequestException("Standard Relations can't be deleted");
    }

    if (
      relationMetadata.sourceFieldMetadata.isActive ||
      relationMetadata.targetFieldMetadata.isActive
    ) {
      throw new BadRequestException("Active relations can't be deleted");
    }

    return instance;
  }
}
