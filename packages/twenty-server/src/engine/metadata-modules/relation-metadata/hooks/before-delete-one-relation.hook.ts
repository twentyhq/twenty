import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  BeforeDeleteOneHook,
  DeleteOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { RelationMetadataService } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.service';

@Injectable()
export class BeforeDeleteOneRelation implements BeforeDeleteOneHook {
  constructor(readonly relationMetadataService: RelationMetadataService) {}

  async run(
    instance: DeleteOneInputType,
    context: any,
  ): Promise<DeleteOneInputType> {
    const workspaceId = context?.req?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const relationMetadata =
      await this.relationMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: instance.id.toString(),
        },
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
