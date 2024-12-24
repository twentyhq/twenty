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

import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

@Injectable()
export class BeforeDeleteOneRelation implements BeforeDeleteOneHook {
  constructor(
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
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
      relations: ['fromFieldMetadata', 'toFieldMetadata'],
    });

    if (!relationMetadata) {
      throw new BadRequestException('Relation does not exist');
    }

    if (
      !relationMetadata.toFieldMetadata.isCustom ||
      !relationMetadata.fromFieldMetadata.isCustom
    ) {
      throw new BadRequestException("Standard Relations can't be deleted");
    }

    if (
      relationMetadata.toFieldMetadata.isActive ||
      relationMetadata.fromFieldMetadata.isActive
    ) {
      throw new BadRequestException("Active relations can't be deleted");
    }

    return instance;
  }
}
