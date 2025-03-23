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
import { isDefined } from 'twenty-shared';
import { Equal, In, Repository } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

interface StandardObjectUpdate extends Partial<UpdateObjectPayload> {
  standardOverrides?: {
    labelSingular?: string | null;
    labelPlural?: string | null;
    description?: string;
    icon?: string;
  };
}

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

    const objectMetadata = await this.getObjectMetadata(instance, workspaceId);

    if (!objectMetadata.isCustom) {
      return this.handleStandardObjectUpdate(instance, objectMetadata);
    }

    await this.validateIdentifierFields(instance, workspaceId);

    return instance;
  }

  private async getObjectMetadata(
    instance: UpdateOneInputType<T>,
    workspaceId: string,
  ) {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: instance.id.toString(),
        },
      });

    if (!objectMetadata) {
      throw new BadRequestException('Object does not exist');
    }

    return objectMetadata;
  }

  private handleStandardObjectUpdate(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
  ): UpdateOneInputType<T> {
    if (this.isOnlyActiveFieldUpdate(instance)) {
      const update = {
        isActive: instance.update.isActive,
      };

      return {
        id: instance.id,
        update: update as T,
      };
    }

    if (
      this.isOnlyLabelSyncedWithNameUpdate(instance) &&
      instance.update.isLabelSyncedWithName === true
    ) {
      const update: StandardObjectUpdate = {
        isLabelSyncedWithName: instance.update.isLabelSyncedWithName,
        standardOverrides: {
          labelSingular: '',
          labelPlural: '',
        },
      };

      return {
        id: instance.id,
        update: update as T,
      };
    }

    if (instance.update.isLabelSyncedWithName === true) {
      const update: StandardObjectUpdate = {
        isLabelSyncedWithName: true,
        standardOverrides: {
          labelSingular: null,
          labelPlural: null,
        },
      };

      return {
        id: instance.id,
        update: update as T,
      };
    }

    if (this.isAllowedStandardObjectUpdate(instance, objectMetadata)) {
      const updateObject: StandardObjectUpdate = {
        standardOverrides: {
          ...(instance.update.description && {
            description: instance.update.description,
          }),
          ...(instance.update.icon && { icon: instance.update.icon }),
          ...(instance.update.labelSingular && {
            labelSingular: instance.update.labelSingular,
          }),
          ...(instance.update.labelPlural && {
            labelPlural: instance.update.labelPlural,
          }),
        },
      };

      return {
        id: instance.id,
        update: updateObject as T,
      };
    }

    throw new BadRequestException(
      'Only isActive, isLabelSyncedWithName, labelSingular, labelPlural, icon and description fields can be updated for standard objects',
    );
  }

  private isOnlyActiveFieldUpdate(instance: UpdateOneInputType<T>): boolean {
    return (
      Object.keys(instance.update).length === 1 &&
      isDefined(instance.update.isActive)
    );
  }

  private isOnlyLabelSyncedWithNameUpdate(
    instance: UpdateOneInputType<T>,
  ): boolean {
    return (
      Object.keys(instance.update).length === 1 &&
      isDefined(instance.update.isLabelSyncedWithName)
    );
  }

  private isAllowedStandardObjectUpdate(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
  ): boolean {
    return Object.keys(instance.update).every(
      (key) =>
        (['labelSingular', 'labelPlural'].includes(key) &&
          !objectMetadata.isLabelSyncedWithName) ||
        ['icon', 'description', 'isLabelSyncedWithName'].includes(key),
    );
  }

  private async validateIdentifierFields(
    instance: UpdateOneInputType<T>,
    workspaceId: string,
  ): Promise<void> {
    if (
      !instance.update.labelIdentifierFieldMetadataId &&
      !instance.update.imageIdentifierFieldMetadataId
    ) {
      return;
    }

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

    this.validateLabelIdentifier(instance, fieldIds);
    this.validateImageIdentifier(instance, fieldIds);
  }

  private validateLabelIdentifier(
    instance: UpdateOneInputType<T>,
    fieldIds: string[],
  ): void {
    if (
      instance.update.labelIdentifierFieldMetadataId &&
      !fieldIds.includes(instance.update.labelIdentifierFieldMetadataId)
    ) {
      throw new BadRequestException('This label identifier does not exist');
    }
  }

  private validateImageIdentifier(
    instance: UpdateOneInputType<T>,
    fieldIds: string[],
  ): void {
    if (
      instance.update.imageIdentifierFieldMetadataId &&
      !fieldIds.includes(instance.update.imageIdentifierFieldMetadataId)
    ) {
      throw new BadRequestException('This image identifier does not exist');
    }
  }
}
