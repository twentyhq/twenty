import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  BeforeDeleteOneHook,
  DeleteOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

@Injectable()
export class BeforeDeleteOneObject implements BeforeDeleteOneHook {
  constructor(readonly objectMetadataService: ObjectMetadataService) {}

  async run(
    instance: DeleteOneInputType,
    context: any,
  ): Promise<DeleteOneInputType> {
    const workspaceId = context?.req?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: instance.id.toString(),
        },
      });

    if (!objectMetadata) {
      throw new BadRequestException('Object does not exist');
    }

    if (!objectMetadata.isCustom) {
      throw new BadRequestException("Standard Objects can't be deleted");
    }

    if (objectMetadata.isActive) {
      throw new BadRequestException("Active objects can't be deleted");
    }

    return instance;
  }
}
