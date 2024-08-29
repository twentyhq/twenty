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

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Injectable()
export class BeforeUpdateOneObject<T extends UpdateObjectPayload>
  implements BeforeUpdateOneHook<T>
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
    workspaceId: string,
  ): Promise<UpdateOneInputType<T>> {
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
      if (
        Object.keys(instance.update).length === 1 &&
        // eslint-disable-next-line no-prototype-builtins
        instance.update.hasOwnProperty('isActive') &&
        instance.update.isActive !== undefined
      ) {
        return {
          id: instance.id,
          update: {
            isActive: instance.update.isActive,
          } as T,
        };
      }

      throw new BadRequestException(
        'Only isActive field can be updated for standard objects',
      );
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

    this.checkIfFieldIsEditable(instance.update, objectMetadata);

    return instance;
  }

  // This is temporary until we properly use the MigrationRunner to update column names
  private checkIfFieldIsEditable(
    update: UpdateObjectPayload,
    objectMetadata: ObjectMetadataEntity,
  ) {
    if (
      update.nameSingular &&
      update.nameSingular !== objectMetadata.nameSingular
    ) {
      throw new BadRequestException(
        "Object's nameSingular can't be updated. Please create a new object instead",
      );
    }

    if (
      update.labelSingular &&
      update.labelSingular !== objectMetadata.labelSingular
    ) {
      throw new BadRequestException(
        "Object's labelSingular can't be updated. Please create a new object instead",
      );
    }

    if (update.namePlural && update.namePlural !== objectMetadata.namePlural) {
      throw new BadRequestException(
        "Object's namePlural can't be updated. Please create a new object instead",
      );
    }

    if (
      update.labelPlural &&
      update.labelPlural !== objectMetadata.labelPlural
    ) {
      throw new BadRequestException(
        "Object's labelPlural can't be updated. Please create a new object instead",
      );
    }
  }
}
