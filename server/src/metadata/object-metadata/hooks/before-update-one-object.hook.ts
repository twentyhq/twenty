import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  BeforeUpdateOneHook,
  UpdateOneInputType,
} from '@ptc-org/nestjs-query-graphql';
import { Equal, In, Repository } from 'typeorm';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { UpdateObjectInput } from 'src/metadata/object-metadata/dtos/update-object.input';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';

@Injectable()
export class BeforeUpdateOneObject<T extends UpdateObjectInput>
  implements BeforeUpdateOneHook<T, any>
{
  constructor(
    readonly objectMetadataService: ObjectMetadataService,
    // TODO: Should not use the repository here
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  // TODO: this logic could be moved to a policy guard
  async run(
    instance: UpdateOneInputType<T>,
    context: any,
  ): Promise<UpdateOneInputType<T>> {
    const workspaceId = context?.req?.user?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(
        instance.id.toString(),
        workspaceId,
      );

    if (!objectMetadata) {
      throw new BadRequestException('Object does not exist');
    }

    if (!objectMetadata.isCustom) {
      throw new BadRequestException("Standard Objects can't be updated");
    }

    if (
      instance.update.labelIdentifierFieldMetadataId ||
      instance.update.imageIdentifierFieldMetadataId
    ) {
      const fields = await this.fieldMetadataRepository.findBy({
        workspaceId: Equal(workspaceId),
        objectMetadataId: Equal(instance.id.toString()),
        id: In(
          [
            instance.update.labelIdentifierFieldMetadataId,
            instance.update.imageIdentifierFieldMetadataId,
          ].filter((id) => id !== null),
        ),
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

    this.checkIfFieldIsEditable(instance.update);

    return instance;
  }

  // This is temporary until we properly use the MigrationRunner to update column names
  private checkIfFieldIsEditable(update: UpdateObjectInput) {
    if (
      update.nameSingular ||
      update.namePlural ||
      update.labelSingular ||
      update.labelPlural
    ) {
      throw new BadRequestException("Object's name and label can't be updated");
    }
  }
}
