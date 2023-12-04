import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  BeforeDeleteOneHook,
  DeleteOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';

@Injectable()
export class BeforeDeleteOneField implements BeforeDeleteOneHook<any> {
  constructor(readonly fieldMetadataService: FieldMetadataService) {}

  async run(
    instance: DeleteOneInputType,
    context: any,
  ): Promise<DeleteOneInputType> {
    const workspaceId = context?.req?.user?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const fieldMetadata =
      await this.fieldMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: instance.id.toString(),
        },
      });

    if (!fieldMetadata) {
      throw new BadRequestException('Field does not exist');
    }

    if (!fieldMetadata.isCustom) {
      throw new BadRequestException("Standard Fields can't be deleted");
    }

    if (fieldMetadata.isActive) {
      throw new BadRequestException("Active fields can't be deleted");
    }

    if (fieldMetadata.type === FieldMetadataType.RELATION) {
      throw new BadRequestException(
        "Relation fields can't be deleted, you need to delete the RelationMetadata instead",
      );
    }

    return instance;
  }
}
