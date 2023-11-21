import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  BeforeUpdateOneHook,
  UpdateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';
import { UpdateObjectInput } from 'src/metadata/object-metadata/dtos/update-object.input';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';

@Injectable()
export class BeforeUpdateOneObject<T extends UpdateObjectInput>
  implements BeforeUpdateOneHook<T, any>
{
  constructor(
    readonly objectMetadataService: ObjectMetadataService,
    readonly fieldMetadataService: FieldMetadataService,
  ) {}

  // TODO: this logic could be moved in a policy guard
  async run(
    instance: UpdateOneInputType<T>,
    context: any,
  ): Promise<UpdateOneInputType<T>> {
    const workspaceId = context?.req?.user?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const objectMetadata = await this.objectMetadataService.findById(
      instance.id,
    );

    if (!objectMetadata || objectMetadata.workspaceId !== workspaceId) {
      throw new UnauthorizedException();
    }

    if (!objectMetadata.isCustom) {
      throw new BadRequestException("Standard Objects can't be updated");
    }

    if (
      instance.update.labelIdentifierFieldMetadataId ||
      instance.update.imageIdentifierFieldMetadataId
    ) {
      const fields = await this.fieldMetadataService.query({
        filter: {
          objectMetadataId: { eq: instance.id.toString() },
          id: {
            in: [
              instance.update.labelIdentifierFieldMetadataId,
              instance.update.imageIdentifierFieldMetadataId,
            ].flatMap((id) => id ?? []),
          },
          workspaceId: { eq: workspaceId },
        },
      });

      const fieldIds = fields.map((field) => field.id);

      if (
        instance.update.labelIdentifierFieldMetadataId &&
        !fieldIds.includes(instance.update.labelIdentifierFieldMetadataId)
      ) {
        throw new BadRequestException('This label identifier does not exist');
      }

      if (
        instance.update.imageIdentifierFieldMetadataId &&
        !fieldIds.includes(instance.update.imageIdentifierFieldMetadataId)
      ) {
        throw new BadRequestException('This image identifier does not exist');
      }
    }

    return instance;
  }
}
